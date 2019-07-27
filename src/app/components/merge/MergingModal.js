import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useEventManager, FormModal, PrimaryButton, Alert } from 'react-components';

import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { prepareContact as encrypt } from '../../helpers/encrypt';
import { bothUserKeys, prepareContact as decrypt } from '../../helpers/decrypt';
import { percentageProgress } from '../../helpers/progress';
import DynamicProgress from '../DynamicProgress';

import { OVERWRITE, CATEGORIES } from '../../constants';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE } = CATEGORIES;

const MergingModal = ({ contactsIDs, userKeysList, mergedContact, ...rest }) => {
    const api = useApi();
    const { call } = useEventManager();

    const { publicKeys, privateKeys } = bothUserKeys(userKeysList);

    const [contactsMerged, addSuccess] = useState(0);
    const [contactsNotMerged, addError] = useState([]);

    const countContacts = contactsIDs.flat().length;

    useEffect(() => {
        const merge = async () => {
            const encryptedMergedContacts = [];
            const beDeleted = [];

            if (mergedContact) {
                try {
                    encryptedMergedContacts.push(await encrypt(mergedContact, privateKeys, publicKeys));
                    addSuccess((merged) => merged + contactsIDs[0].length);
                } catch (error) {
                    addError([...contactsIDs]);
                }
            } else {
                for (const group of contactsIDs) {
                    const beMerged = [];
                    try {
                        for (const [i, ID] of group.entries()) {
                            const { Contact } = await api(getContact(ID));
                            const { properties, contactErrors } = await decrypt(Contact, { privateKeys, publicKeys });
                            if (!contactErrors) {
                                beMerged.push(properties);
                                i !== 0 && beDeleted.push(ID);
                            } else {
                                throw new Error(c('Error description').t`Error decrypting contact ${ID}`);
                            }
                        }
                        const mergedContact = merge(beMerged);
                        encryptedMergedContacts.push(await encrypt(mergedContact, privateKeys, publicKeys));
                        addSuccess((merged) => merged + group.length);
                    } catch (errror) {
                        addError((notMerged) => notMerged.concat(group));
                    }
                }
            }

            await api(addContacts({ Contacts: encryptedMergedContacts, Overwrite: OVERWRITE_CONTACT, Labels: IGNORE }));
            await api(deleteContacts(beDeleted));
        };

        merge();

        return () => call();
    }, []);

    return (
        <FormModal
            title={c('Title').t`Merging contacts`}
            onSubmit={rest.onClose}
            footer={
                <PrimaryButton loading={contactsMerged + contactsNotMerged.length !== countContacts}>
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
                displayEnd={c('Progress bar description')
                    .t`${contactsMerged} out of ${countContacts} contacts successfully merged.`}
            />
        </FormModal>
    );
};

MergingModal.propTypes = {
    contactsIDs: PropTypes.arrayOf(PropTypes.array).isRequired,
    userKeysList: PropTypes.array.isRequired,
    mergedContact: PropTypes.array
};

export default MergingModal;
