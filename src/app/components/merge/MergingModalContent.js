import React, { useState, useEffect, useMemo } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useLoading, Alert } from 'react-components';

import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { splitKeys } from 'proton-shared/lib/keys/keys';
import { wait } from 'proton-shared/lib/helpers/promise';
import { prepareContact as decrypt } from '../../helpers/decrypt';
import { prepareContact as encrypt } from '../../helpers/encrypt';
import { merge } from '../../helpers/merge';
import { divideInBatches, trivialIndexMap } from '../../helpers/import';
import { combineProgress } from '../../helpers/progress';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE, API_SAFE_INTERVAL, ADD_CONTACTS_MAX_SIZE } from '../../constants';

import DynamicProgress from '../DynamicProgress';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE } = CATEGORIES;

const MergingModalContent = ({
    contactID,
    userKeysList,
    beMergedIDs = [],
    alreadyMerged,
    beDeletedIDs = [],
    totalBeMerged = 0,
    onFinish,
    history,
    location
}) => {
    const api = useApi();
    const { privateKeys, publicKeys } = useMemo(() => splitKeys(userKeysList), []);

    const [loading, withLoading] = useLoading(true);
    const [newContactID, setNewContactID] = useState(contactID);
    const [model, setModel] = useState({
        mergedAndEncrypted: [],
        failedOnMergeAndEncrypt: [],
        submitted: [],
        failedOnSubmit: []
    });

    useEffect(() => {
        // if the current contact has been merged or deleted, update contactID
        if (newContactID !== contactID) {
            console.log(newContactID);
            history.push({ ...location, pathname: `/contacts/${newContactID}` });
        }
    }, [newContactID]);

    useEffect(() => {
        /*
			Prepare api for allowing cancellation in the middle of the import
		*/
        const abortController = new AbortController();
        const apiWithAbort = (config) => api({ ...config, signal: abortController.signal });

        /*
            Get a contact from its ID and decrypt it. Return contact as a list of properties
        */
        const getDecryptedContact = async (ID, { signal }) => {
            if (signal.aborted) {
                return [];
            }
            const { Contact } = await apiWithAbort(getContact(ID));
            const { properties, errors: contactErrors } = await decrypt(Contact, {
                privateKeys,
                publicKeys
            });
            if (contactErrors.length) {
                throw new Error('Error decrypting contact ${ID}');
            }
            return properties;
        };

        /*
            Get and decrypt a group of contacts to be merged. Return contacts as list of properties
        */
        const getDecryptedGroup = async (IDs = [], { signal }) => {
            const decryptedGroup = [];
            for (const ID of IDs) {
                // avoid overloading API in case getDecryptedContact is too fast
                const [decryptedContact] = await Promise.all([
                    getDecryptedContact(ID, { signal }),
                    wait(API_SAFE_INTERVAL)
                ]);
                decryptedGroup.push(decryptedContact);
            }
            return decryptedGroup;
        };

        /*
            Encrypt a contact already merged. Useful for the case of `preview merge`
        */
        const encryptAlreadyMerged = async ({ signal }) => {
            if (signal.aborted) {
                return {};
            }
            const groupIDs = beMergedIDs[0];
            const beSubmittedContacts = [];
            const beDeletedAfterMergeIDs = [];
            try {
                const encryptedMergedContact = await encrypt(alreadyMerged, {
                    privateKey: privateKeys[0],
                    publicKey: publicKeys[0]
                });
                beSubmittedContacts.push(encryptedMergedContact);
                beDeletedAfterMergeIDs.push(groupIDs.slice(1));
                !signal.aborted &&
                    setModel((model) => ({ ...model, mergedAndEncrypted: [...model.mergedAndEncrypted, ...groupIDs] }));
            } catch {
                !signal.aborted &&
                    setModel((model) => ({
                        ...model,
                        failedOnMergeAndEncrypt: [...model.failedOnMergeAndEncrypt, ...groupIDs]
                    }));
            }
            return { beSubmittedContacts, beDeletedAfterMergeIDs };
        };

        /*
            Merge groups of contacts characterized by their ID. Return the encrypted merged contacts
            to be submitted plus the IDs of the contacts to be deleted after the merge
        */
        const mergeAndEncrypt = async ({ signal }) => {
            const beSubmittedContacts = [];
            const beDeletedAfterMergeIDs = [];
            for (const groupIDs of beMergedIDs) {
                if (signal.aborted) {
                    return {};
                }
                try {
                    const beMergedGroup = await getDecryptedGroup(groupIDs, { signal });
                    const encryptedMergedContact = await encrypt(merge(beMergedGroup), {
                        privateKey: privateKeys[0],
                        publicKey: publicKeys[0]
                    });
                    beSubmittedContacts.push(encryptedMergedContact);
                    beDeletedAfterMergeIDs.push(groupIDs.slice(1));
                    !signal.aborted &&
                        setModel((model) => ({
                            ...model,
                            mergedAndEncrypted: [...model.mergedAndEncrypted, ...groupIDs]
                        }));
                } catch {
                    !signal.aborted &&
                        setModel((model) => ({
                            ...model,
                            failedOnMergeAndEncrypt: [...model.failedOnMergeAndEncrypt, ...groupIDs]
                        }));
                }
            }
            return { beSubmittedContacts, beDeletedAfterMergeIDs };
        };

        /*
            Submit a batch of merged contacts to the API
        */
        const submitBatch = async ({ beSubmittedContacts, indexMap }, { signal }) => {
            if (signal.aborted) {
                return;
            }
            const beDeletedBatchIDs = [];
            const { Responses = [] } =
                !!beSubmittedContacts.length &&
                (await apiWithAbort(
                    addContacts({
                        Contacts: beSubmittedContacts,
                        Overwrite: OVERWRITE_CONTACT,
                        Labels: IGNORE
                    })
                ));
            for (const { Index, Response } of Responses) {
                const groupIDs = beMergedIDs[indexMap[Index]];
                if (Response.Code === SUCCESS_IMPORT_CODE) {
                    !signal.aborted &&
                        setModel((model) => ({ ...model, submitted: [...model.submitted, ...groupIDs] }));
                    beDeletedBatchIDs.push(...groupIDs.slice(1));
                    // if the current contact is merged, prepare to update contactID
                    !signal.aborted && groupIDs.slice(1).includes(contactID) && setNewContactID(groupIDs[0]);
                } else {
                    !signal.aborted &&
                        setModel((model) => ({ ...model, failedOnSubmit: [...model.failedOnSubmit, ...groupIDs] }));
                }
            }
            !signal.aborted && !!beDeletedBatchIDs.length && (await apiWithAbort(deleteContacts(beDeletedBatchIDs)));
        };

        /*
            Submit all merged contacts to the API
        */
        const submitContacts = async ({ beSubmittedContacts }, { signal }) => {
            // split contacts to be submitted and deleted in batches in case there are too many
            const { contactBatches: beSubmittedBatches, indexMapBatches } = divideInBatches(
                { contacts: beSubmittedContacts, indexMap: trivialIndexMap(beMergedIDs) },
                ADD_CONTACTS_MAX_SIZE
            );
            const apiCalls = beSubmittedBatches.length;

            for (let i = 0; i < apiCalls; i++) {
                // avoid overloading API in the case submitBatch is too fast
                await Promise.all([
                    submitBatch(
                        {
                            beSubmittedContacts: beSubmittedBatches[i],
                            indexMap: indexMapBatches[i]
                        },
                        { signal }
                    ),
                    wait(API_SAFE_INTERVAL)
                ]);
            }
        };

        /*
            Delete contacts marked for deletion
        */
        const deleteMarkedForDeletion = async ({ signal }) => {
            !signal.aborted && !!beDeletedIDs.length && (await apiWithAbort(deleteContacts(beDeletedIDs)));
            // if current contact is deleted, route to /contacts
            !signal.aborted && beDeletedIDs.includes(contactID) && setNewContactID('');
        };

        /*
            All steps of the merge process
        */
        const mergeContacts = async ({ signal }) => {
            const { beSubmittedContacts, beDeletedAfterMergeIDs } = !alreadyMerged
                ? await mergeAndEncrypt({ signal })
                : await encryptAlreadyMerged({ signal });
            await submitContacts({ beSubmittedContacts, beDeletedAfterMergeIDs }, { signal });
            await deleteMarkedForDeletion({ signal });
            !signal.aborted && (await onFinish());
        };

        withLoading(mergeContacts(abortController));

        return () => {
            abortController.abort();
        };
    }, []);

    /*
		Allocate 90% of the progress to merging and encrypting, 10% to sending to API
	*/
    const combinedProgress = combineProgress([
        {
            allocated: 0.9,
            successful: model.mergedAndEncrypted.length,
            failed: model.failedOnMergeAndEncrypt.length,
            total: totalBeMerged
        },
        {
            allocated: 0.1,
            successful: model.submitted.length,
            failed: model.failedOnSubmit.length,
            total: totalBeMerged - model.failedOnMergeAndEncrypt.length
        }
    ]);

    return (
        <>
            <Alert>
                {c('Description')
                    .t`Merging contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-merge-contacts"
                alt="contact-loader"
                value={combinedProgress}
                failed={!model.submitted.length}
                displaySuccess={c('Progress bar description')
                    .t`${model.submitted.length} out of ${totalBeMerged} contacts successfully merged.`}
                displayFailed={c('Progress bar description').t`No contacts merged.`}
                endPostponed={loading}
            />
        </>
    );
};

MergingModalContent.propTypes = {
    contactID: PropTypes.string,
    userKeysList: PropTypes.array.isRequired,
    beMergedIDs: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    alreadyMerged: PropTypes.arrayOf(PropTypes.object),
    beDeletedIDs: PropTypes.arrayOf(PropTypes.string),
    totalBeMerged: PropTypes.number,
    onFinish: PropTypes.func,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};

export default withRouter(MergingModalContent);
