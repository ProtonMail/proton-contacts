import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useEventManager, FormModal, PrimaryButton, Alert } from 'react-components';

import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { prepareContact as encrypt } from '../../helpers/encrypt';
import { bothUserKeys, prepareContact as decrypt } from '../../helpers/decrypt';
import { merge } from '../../helpers/merge';
import { percentageProgress } from '../../helpers/progress';
import { noop } from 'proton-shared/lib/helpers/function';

import DynamicProgress from '../DynamicProgress';

import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE } from '../../constants';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE } = CATEGORIES;

const MergingModal = ({ contactsIDs, userKeysList, mergedContact, beDeletedIDs, onMerge = noop, ...rest }) => {
    const api = useApi();
    const { call } = useEventManager();

    const { publicKeys, privateKeys } = bothUserKeys(userKeysList);

    const [model, setModel] = useState({ merged: { success: [], error: [] }, submitted: { success: [], error: [] } });

    const countContacts = contactsIDs.flat().length;
    const isFinished = model.submitted.success.length + model.submitted.error.length === countContacts;

    useEffect(() => {
        const mergeSingle = async () => {
            // in this case, contactsIDs.length = 1 and the contacts have been merged already
            setModel(({ merged, submitted }) => ({ submitted, merged: { ...merged, success: contactsIDs[0] } }));
            try {
                const encryptedContact = await encrypt(mergedContact, privateKeys, publicKeys);
                const { Responses } = await api(
                    addContacts({
                        Contacts: [encryptedContact],
                        Overwrite: OVERWRITE_CONTACT,
                        Labels: IGNORE
                    })
                );
                if (Responses[0].Response.Code !== SUCCESS_IMPORT_CODE) {
                    throw new Error('Error submitting merged contact');
                }
                await api(deleteContacts(contactsIDs[0].slice(1)));
                setModel(({ merged, submitted }) => ({ merged, submitted: { ...submitted, success: contactsIDs[0] } }));
                if (beDeletedIDs) {
                    await api(deleteContacts(beDeletedIDs));
                }
                onMerge();
                await call();
            } catch (error) {
                setModel(({ merged, submitted }) => ({ merged, submitted: { ...submitted, errror: contactsIDs[0] } }));
            }
        };

        const mergeMultiple = async () => {
            const encryptedContacts = [];
            const beDeletedAfterMergeIDs = [];
            for (const group of contactsIDs) {
                try {
                    const beMergedContacts = [];
                    for (const ID of group) {
                        // decrypt contacts to be merged
                        const { Contact } = await api(getContact(ID));
                        const { properties, errors: contactErrors } = await decrypt(Contact, {
                            privateKeys,
                            publicKeys
                        });
                        if (contactErrors.length) {
                            throw new Error(c('Error description').t`Error decrypting contact ${ID}`);
                        }
                        beMergedContacts.push(properties);
                    }
                    // merge contacts
                    const mergedContact = merge(beMergedContacts);
                    setModel(({ merged: { success, error }, submitted }) => ({
                        submitted,
                        merged: { error, success: [...success, ...group] }
                    }));
                    // encrypt merged contact
                    const encryptedContact = await encrypt(mergedContact, privateKeys, publicKeys);
                    encryptedContacts.push({ contact: encryptedContact, group });
                    beDeletedAfterMergeIDs.push(group.slice(1));
                } catch (errror) {
                    setModel(({ merged: { success, error }, submitted }) => ({
                        submitted,
                        merged: { success, error: [...error, ...group] }
                    }));
                }
            }
            // send encrypted merged contacts to API
            const { Responses } = await api(
                addContacts({
                    Contacts: encryptedContacts.map(({ contact }) => contact),
                    Overwrite: OVERWRITE_CONTACT,
                    Labels: IGNORE
                })
            );
            // populate contactsMerged and contactsNotMerged depending on API responses
            for (const { Index, Response } of Responses) {
                if (Response.Code === SUCCESS_IMPORT_CODE) {
                    setModel(({ submitted: { success, error }, merged }) => ({
                        merged,
                        submitted: { error, success: [...success, ...encryptedContacts[Index].group] }
                    }));
                    await api(deleteContacts(beDeletedAfterMergeIDs[Index]));
                } else {
                    setModel(({ submitted: { success, error }, merged }) => ({
                        merged,
                        submitted: { success, error: [...error, ...encryptedContacts[Index].group] }
                    }));
                }
            }
            // delete contacts marked for deletion
            if (beDeletedIDs) {
                await api(deleteContacts(beDeletedIDs));
            }
            onMerge();
            await call();
        };

        if (mergedContact) {
            mergeSingle();
        } else {
            mergeMultiple();
        }

        return () => onMerge();
    }, []);

    return (
        <FormModal
            title={c('Title').t`Merging contacts`}
            onSubmit={rest.onClose}
            hasClose={false}
            footer={
                <PrimaryButton
                    type="reset"
                    loading={model.submitted.success.length + model.submitted.error.length !== countContacts}
                >
                    {c('Action').t`Close`}
                </PrimaryButton>
            }
            {...rest}
        >
            <Alert>
                {c('Description')
                    .t`Merging contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-merge-contacts"
                alt="contact-loader"
                value={percentageProgress(model.merged.success.length, model.merged.error.length, countContacts)}
                failed={!model.submitted.success.length}
                displaySuccess={c('Progress bar description')
                    .t`${model.submitted.success.length} out of ${countContacts} contacts successfully merged.`}
                displayFailed={c('Progress bar description').t`No contacts merged.`}
                endPostponed={!isFinished}
            />
        </FormModal>
    );
};

MergingModal.propTypes = {
    contactsIDs: PropTypes.arrayOf(PropTypes.array).isRequired,
    userKeysList: PropTypes.array.isRequired,
    mergedContact: PropTypes.array,
    beDeletedIDs: PropTypes.array,
    onMerge: PropTypes.func
};

export default MergingModal;
