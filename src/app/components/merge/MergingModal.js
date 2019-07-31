import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useEventManager, FormModal, PrimaryButton, Alert } from 'react-components';

import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { prepareContact as encrypt } from '../../helpers/encrypt';
import { bothUserKeys, prepareContact as decrypt } from '../../helpers/decrypt';
import { percentageProgress } from '../../helpers/progress';
import DynamicProgress from '../DynamicProgress';

import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE } from '../../constants';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE } = CATEGORIES;

const MergingModal = ({ contactsIDs, userKeysList, mergedContact, beDeletedIDs, onMerge, ...rest }) => {
    const api = useApi();
    const { call } = useEventManager();

    const { publicKeys, privateKeys } = bothUserKeys(userKeysList);

    const [contactsMerged, addSuccess] = useState(0);
    const [contactsNotMerged, addError] = useState([]);

    const countContacts = contactsIDs.flat().length;

    useEffect(() => {
        const submit = async (mergedContact, beDeletedIDs) => {
            const encryptedContact = await encrypt(mergedContact, privateKeys, publicKeys);
            const {
                Responses: [
                    {
                        Response: { Code }
                    }
                ]
            } = await api(
                addContacts({
                    Contacts: [encryptedContact],
                    Overwrite: OVERWRITE_CONTACT,
                    Labels: IGNORE
                })
            );

            if (Code !== SUCCESS_IMPORT_CODE) {
                throw new Error('Error submitting merged contact');
            }
            await api(deleteContacts(beDeletedIDs));
        };

        const merge = async () => {
            if (mergedContact) {
                // in this case, contactIDs.length = 1 and the contacts have been merged already
                try {
                    await submit(mergedContact, contactsIDs[0].slice(1));
                    addSuccess((merged) => merged + contactsIDs[0].length);
                    onMerge();
                } catch (error) {
                    addError(...contactsIDs);
                }
            } else {
                for (const group of contactsIDs) {
                    const beMergedContacts = [];
                    const beDeletedAfterMergeIDs = [];
                    try {
                        for (const [i, ID] of group.entries()) {
                            const { Contact } = await api(getContact(ID));
                            const { properties, errors: contactErrors } = await decrypt(Contact, {
                                privateKeys,
                                publicKeys
                            });
                            if (!contactErrors.length) {
                                beMergedContacts.push(properties);
                                i !== 0 && beDeletedAfterMergeIDs.push(ID);
                            } else {
                                throw new Error(c('Error description').t`Error decrypting contact ${ID}`);
                            }
                        }
                        await submit(merge(beMergedContacts), beDeletedAfterMergeIDs);
                        addSuccess((merged) => merged + group.length);
                        onMerge();
                    } catch (errror) {
                        addError((notMerged) => notMerged.concat(group));
                    }
                }
            }

            if (beDeletedIDs) {
                await api(deleteContacts(beDeletedIDs));
            }
            call();
        };

        merge();
    }, []);

    return (
        <FormModal
            title={c('Title').t`Merging contacts`}
            onSubmit={rest.onClose}
            footer={
                <PrimaryButton type="reset" loading={contactsMerged + contactsNotMerged.length !== countContacts}>
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
                value={percentageProgress(contactsMerged, contactsNotMerged.length, countContacts)}
                failed={!contactsMerged}
                displaySuccess={c('Progress bar description')
                    .t`${contactsMerged} out of ${countContacts} contacts successfully merged.`}
                displayFailed={c('Progress bar description').t`No contacts merged.`}
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
