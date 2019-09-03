import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useApi,
    useLoading,
    useEventManager,
    useModals,
    FormModal,
    ResetButton,
    PrimaryButton
} from 'react-components';

import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { noop } from 'proton-shared/lib/helpers/function';
import { prepareContact as decrypt } from '../../helpers/decrypt';
import { prepareContact as encrypt } from '../../helpers/encrypt';
import { merge } from '../../helpers/merge';
import { moveInGroup } from '../../helpers/array';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE } from '../../constants';

import ContactDetails from './ContactDetails';
import MergeContactPreview from './MergeContactPreview';
import MergeModalContent from './MergeModalContent';
import MergeTable from './MergeTable';
import MergingModalContent from './MergingModalContent';
import { splitKeys } from 'proton-shared/lib/keys/keys';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE } = CATEGORIES;

// pull staticContext to avoid it being passed with rest
const MergeModal = ({
    contacts,
    contactID,
    userKeysList,
    onMerge = noop,
    history,
    location,
    // eslint-disable-next-line no-unused-vars
    staticContext,
    ...rest
}) => {
    const api = useApi();
    const { call } = useEventManager();
    const { createModal } = useModals();

    const [isMerging, setIsMerging] = useState(false);
    const [loading, withLoading] = useLoading(false);
    const [model, setModel] = useState({
        orderedContacts: contacts,
        isChecked: contacts.flat().reduce((acc, { ID }) => {
            acc[ID] = true;
            return acc;
        }, {}),
        isDeleted: contacts.flat().reduce((acc, { ID }) => {
            acc[ID] = false;
            return acc;
        }, {}),
        merged: { success: [], error: [] },
        submitted: { success: [], error: [] }
    });

    const { orderedContacts, isChecked, isDeleted, merged, submitted } = model;

    useEffect(() => {
        if (!orderedContacts.length) {
            rest.onClose();
        }
    }, model);

    // contacts that should be merged
    // beMergedIDs = [[group of (ordered) contact IDs to be merged], ...]
    const beMergedIDs = orderedContacts
        .map((group) => group.map(({ ID }) => isChecked[ID] && !isDeleted[ID] && ID).filter(Boolean))
        .map((group) => (group.length > 1 ? group : []));
    // contacts marked for deletion
    // beDeletedIDs = [[group of (ordered) contact IDs to be deleted], ...]
    const beDeletedIDs = orderedContacts.map((group) => group.map(({ ID }) => isDeleted[ID] && ID).filter(Boolean));
    // total number of contacts to be merged
    const totalBeMerged = beMergedIDs.flat().length;

    const handleClickDetails = (contactID) => {
        createModal(<ContactDetails contactID={contactID} userKeysList={userKeysList} />);
    };

    const handleRemoveMerged = (beRemovedIDs, groupIndex) => {
        // groupIndex not really needed here, but it can help with performance
        setModel({
            ...model,
            orderedContacts: orderedContacts
                .map((group, i) => (i !== groupIndex ? group : group.filter(({ ID }) => !beRemovedIDs.includes(ID))))
                .filter((group) => group.length > 1)
        });
    };

    const handlePreview = (contactIDs, groupIndex) => {
        const handleMergePreview = () => {
            // deal with a potential change of current contact ID
            const newContactID = contactIDs[0];
            if (contactIDs.includes(contactID) && newContactID !== contactID) {
                history.push({ ...location, pathname: `/contacts/${newContactID}` });
            }
            // update model
            const beRemovedIDs =
                orderedContacts[groupIndex].length === contactIDs.length
                    ? contactIDs.concat(beDeletedIDs[groupIndex])
                    : contactIDs.slice(1).concat(beDeletedIDs[groupIndex]);
            handleRemoveMerged(beRemovedIDs, groupIndex);
        };

        createModal(
            <MergeContactPreview
                beMergedIDs={contactIDs}
                userKeysList={userKeysList}
                beDeletedIDs={beDeletedIDs[groupIndex]}
                onMerge={handleMergePreview}
            />
        );
    };

    const handleToggleCheck = (ID) => {
        setModel({
            ...model,
            isChecked: { ...isChecked, [ID]: !isChecked[ID] }
        });
    };

    const handleToggleDelete = (ID) => {
        setModel({
            ...model,
            isDeleted: { ...isDeleted, [ID]: !isDeleted[ID] }
        });
    };

    const handleSortEnd = (groupIndex) => ({ oldIndex, newIndex }) => {
        setModel({
            ...model,
            orderedContacts: moveInGroup(orderedContacts, groupIndex, { oldIndex, newIndex })
        });
    };

    const handleMerge = async () => {
        const { publicKeys, privateKeys } = splitKeys(userKeysList);

        const encryptedContacts = [];
        const beDeletedAfterMergeIDs = [];
        let newContactID = contactID;
        for (const group of beMergedIDs) {
            if (!beMergedIDs.length) {
                continue;
            }
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
                    // if the current contact is merged, prepare to update contactID
                    if (ID && ID === contactID) {
                        newContactID = group[0];
                    }
                }
                // merge contacts
                const mergedContact = merge(beMergedContacts);
                // encrypt merged contact
                const encryptedContact = await encrypt(mergedContact, {
                    privateKey: privateKeys[0],
                    publicKey: publicKeys[0]
                });
                encryptedContacts.push({ contact: encryptedContact, group });
                beDeletedAfterMergeIDs.push(group.slice(1));
                setModel((model) => ({
                    ...model,
                    merged: { ...model.merged, success: [...model.merged.success, ...group] }
                }));
            } catch (errror) {
                setModel((model) => ({
                    ...model,
                    merged: { ...model.merged, error: [...model.merged.error, ...group] },
                    submitted: {
                        ...model.submitted,
                        error: [...model.submitted.error, ...group]
                    }
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
        // populate submitted depending on API responses
        for (const { Index, Response } of Responses) {
            if (Response.Code === SUCCESS_IMPORT_CODE) {
                setModel((model) => ({
                    ...model,
                    submitted: {
                        ...model.submitted,
                        success: [...model.submitted.success, ...encryptedContacts[Index].group]
                    }
                }));
                await api(deleteContacts(beDeletedAfterMergeIDs[Index]));
            } else {
                setModel((model) => ({
                    ...model,
                    submitted: {
                        ...model.submitted,
                        error: [...model.submitted.error, ...encryptedContacts[Index].group]
                    }
                }));
            }
        }
        // delete contacts marked for deletion
        if (beDeletedIDs && beDeletedIDs.flat().length) {
            await api(deleteContacts(beDeletedIDs.flat()));
        }
        onMerge();
        // if the current contact has been merged, update contactID
        if (newContactID && newContactID !== contactID) {
            history.push({ ...location, pathname: `/contacts/${newContactID}` });
        }
        await call();
    };

    const { content, ...modalProps } = (() => {
        /*
            display table with mergeable contacts
        */
        if (!isMerging) {
            const handleSubmit = () => {
                setIsMerging(true);
                withLoading(handleMerge());
            };
            const footer = (
                <>
                    <ResetButton>{c('Action').t`Cancel`}</ResetButton>
                    <PrimaryButton type="submit" disabled={!totalBeMerged}>{c('Action').t`Merge`}</PrimaryButton>
                </>
            );

            return {
                title: c('Title').t`Merge contacts`,
                content: (
                    <MergeModalContent>
                        <MergeTable
                            onSortEnd={handleSortEnd}
                            contacts={orderedContacts}
                            isChecked={isChecked}
                            isDeleted={isDeleted}
                            onClickCheckbox={handleToggleCheck}
                            onClickDetails={handleClickDetails}
                            onClickDelete={handleToggleDelete}
                            onClickUndelete={handleToggleDelete}
                            onClickPreview={handlePreview}
                        />
                    </MergeModalContent>
                ),
                footer,
                onSubmit: handleSubmit,
                ...rest
            };
        }

        /*
            display progress bar while merging contacts
        */
        const footer = (
            <PrimaryButton type="reset" loading={loading}>
                {c('Action').t`Close`}
            </PrimaryButton>
        );
        return {
            title: c('Title').t`Merging contacts`,
            hasClose: false,
            content: (
                <MergingModalContent
                    merged={merged.success}
                    notMerged={merged.error}
                    submitted={submitted.success}
                    notSubmitted={submitted.error}
                    total={totalBeMerged}
                />
            ),
            footer,
            onSubmit: rest.onClose,
            ...rest
        };
    })();

    return <FormModal {...modalProps}>{content}</FormModal>;
};

MergeModal.propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.array).isRequired,
    contactID: PropTypes.string,
    userKeysList: PropTypes.array.isRequired,
    onMerge: PropTypes.func,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    staticContext: PropTypes.object
};

export default withRouter(MergeModal);
