import React, { useState, useEffect, useMemo } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useLoading, Alert } from 'react-components';

import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { splitKeys } from 'proton-shared/lib/keys/keys';
import { wait } from 'proton-shared/lib/helpers/promise';
import { chunk } from 'proton-shared/lib/helpers/array';
import { prepareContact as decrypt } from 'proton-shared/lib/contacts/decrypt';
import { prepareContact as encrypt } from 'proton-shared/lib/contacts/encrypt';
import { merge } from '../../helpers/merge';
import { splitContacts } from '../../helpers/import';
import { combineProgress } from '../../helpers/progress';
import { OVERWRITE, CATEGORIES, API_SAFE_INTERVAL, ADD_CONTACTS_MAX_SIZE } from '../../constants';
import { API_CODES } from 'proton-shared/lib/constants';

import DynamicProgress from '../DynamicProgress';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { INCLUDE, IGNORE } = CATEGORIES;
const { SINGLE_SUCCESS } = API_CODES;

const MergingModalContent = ({
    contactID,
    userKeysList,
    alreadyMerged,
    beMergedModel = {},
    beDeletedModel = {},
    totalBeMerged = 0,
    onFinish,
    history,
    location
}) => {
    const api = useApi();
    const { privateKeys, publicKeys } = useMemo(() => splitKeys(userKeysList), []);

    const [loading, withLoading] = useLoading(true);
    const [model, setModel] = useState({
        mergedAndEncrypted: [],
        failedOnMergeAndEncrypt: [],
        submitted: [],
        failedOnSubmit: []
    });

    useEffect(() => {
        // Prepare api for allowing cancellation in the middle of the merge
        const abortController = new AbortController();
        const apiWithAbort = (config) => api({ ...config, signal: abortController.signal });

        /**
         * Get a contact from its ID and decrypt it. Return contact as a list of properties
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
                throw new Error(`Error decrypting contact ${ID}`);
            }
            return properties;
        };

        /**
         * Get and decrypt a group of contacts to be merged. Return array of decrypted contacts
         */
        const getDecryptedGroup = async (groupIDs = [], { signal }) => {
            const decryptedGroup = [];
            for (const ID of groupIDs) {
                // avoid overloading API in case getDecryptedContact is too fast
                const [decryptedContact] = await Promise.all([
                    getDecryptedContact(ID, { signal }),
                    wait(API_SAFE_INTERVAL)
                ]);
                decryptedGroup.push(decryptedContact);
            }
            return decryptedGroup;
        };

        /**
         * Encrypt a contact already merged. Useful for the case of `preview merge`
         */
        const encryptAlreadyMerged = async ({ signal }) => {
            if (signal.aborted) {
                return {};
            }
            // beMergedModel only contains one entry in this case
            const [groupIDs] = Object.values(beMergedModel);
            const beSubmittedContacts = [];
            try {
                const encryptedMergedContact = await encrypt(alreadyMerged, {
                    privateKey: privateKeys[0],
                    publicKey: publicKeys[0]
                });
                beSubmittedContacts.push({ contact: encryptedMergedContact });

                !signal.aborted &&
                    setModel((model) => ({ ...model, mergedAndEncrypted: [...model.mergedAndEncrypted, ...groupIDs] }));
            } catch {
                !signal.aborted &&
                    setModel((model) => ({
                        ...model,
                        failedOnMergeAndEncrypt: [...model.failedOnMergeAndEncrypt, ...groupIDs]
                    }));
            }
            return beSubmittedContacts;
        };

        /**
         * Merge groups of contacts characterized by their ID. Return the encrypted merged contacts
         * to be submitted plus the IDs of the contacts to be deleted after the merge
         */
        const mergeAndEncrypt = async ({ signal }) => {
            const beSubmittedContacts = [];
            for (const groupIDs of Object.values(beMergedModel)) {
                if (signal.aborted) {
                    return {};
                }
                try {
                    const decryptedGroup = await getDecryptedGroup(groupIDs, { signal });
                    const encryptedMergedContact = await encrypt(merge(decryptedGroup), {
                        privateKey: privateKeys[0],
                        publicKey: publicKeys[0]
                    });
                    beSubmittedContacts.push({ contact: encryptedMergedContact });
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
            return beSubmittedContacts;
        };

        /**
         * Submit a batch of merged contacts to the API
         */
        const submitBatch = async ({ contacts = [], labels }, { signal }) => {
            if (signal.aborted || !contacts.length) {
                return;
            }
            const beDeletedBatchIDs = [];
            const responses = (
                await apiWithAbort(
                    addContacts({
                        Contacts: contacts.map(({ contact }) => contact),
                        Overwrite: OVERWRITE_CONTACT,
                        Labels: labels
                    })
                )
            ).Responses.map(({ Response }) => Response);

            if (signal.aborted) {
                return;
            }

            for (const {
                Code,
                Contact: { ID }
            } of responses) {
                const groupIDs = beMergedModel[ID];
                const beDeletedAfterMergeIDs = groupIDs.slice(1);
                if (Code === SINGLE_SUCCESS) {
                    !signal.aborted &&
                        setModel((model) => ({ ...model, submitted: [...model.submitted, ...groupIDs] }));
                    beDeletedBatchIDs.push(...beDeletedAfterMergeIDs);
                    if (!signal.aborted && beDeletedAfterMergeIDs.includes(contactID)) {
                        // if the current contact is merged, update URL
                        history.replace({ ...location, state: { ignoreClose: true }, pathname: `/contacts/${ID}` });
                    }
                } else {
                    !signal.aborted &&
                        setModel((model) => ({ ...model, failedOnSubmit: [...model.failedOnSubmit, ...groupIDs] }));
                }
            }
            !signal.aborted && !!beDeletedBatchIDs.length && (await apiWithAbort(deleteContacts(beDeletedBatchIDs)));
        };

        /**
         * Submit all merged contacts to the API
         */
        const submitContacts = async ({ contacts = [], labels }, { signal }) => {
            if (signal.aborted) {
                return;
            }
            // divide contacts and indexMap in batches
            const contactBatches = chunk(contacts, ADD_CONTACTS_MAX_SIZE);
            const apiCalls = contactBatches.length;

            for (let i = 0; i < apiCalls; i++) {
                // avoid overloading API in the unlikely case submitBatch is too fast
                await Promise.all([
                    submitBatch({ contacts: contactBatches[i], labels }, { signal }),
                    wait(API_SAFE_INTERVAL)
                ]);
            }
        };

        /**
         * Delete contacts marked for deletion
         */
        const deleteMarkedForDeletion = async ({ signal }) => {
            const beDeletedIDs = Object.keys(beDeletedModel);
            if (!signal.aborted && !!beDeletedIDs.length) {
                await apiWithAbort(deleteContacts(beDeletedIDs));
            }
            if (!signal.aborted && beDeletedIDs.includes(contactID)) {
                history.replace({
                    ...location,
                    state: { ignoreClose: true },
                    pathname: `/contacts/${beDeletedModel[contactID]}`
                });
            }
        };

        /**
         * All steps of the merge process
         */
        const mergeContacts = async ({ signal }) => {
            const beSubmittedContacts = !alreadyMerged
                ? await mergeAndEncrypt({ signal })
                : await encryptAlreadyMerged({ signal });
            const { withCategories, withoutCategories } = splitContacts(beSubmittedContacts);
            await submitContacts({ contacts: withCategories, labels: INCLUDE }, { signal });
            await submitContacts({ contacts: withoutCategories, labels: IGNORE }, { signal });
            await deleteMarkedForDeletion({ signal });
            !signal.aborted && (await onFinish());
        };

        withLoading(mergeContacts(abortController));

        return () => {
            abortController.abort();
        };
    }, []);

    // Allocate 90% of the progress to merging and encrypting, 10% to sending to API
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
    alreadyMerged: PropTypes.arrayOf(PropTypes.object),
    beMergedModel: PropTypes.shape({ ID: PropTypes.arrayOf(PropTypes.string) }),
    beDeletedModel: PropTypes.shape({ ID: PropTypes.string }),
    totalBeMerged: PropTypes.number,
    onFinish: PropTypes.func,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};

export default withRouter(MergingModalContent);
