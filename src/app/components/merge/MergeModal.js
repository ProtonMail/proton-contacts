import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useEventManager, useModals, FormModal, ResetButton, PrimaryButton } from 'react-components';

import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { prepareContact as decrypt, bothUserKeys } from '../../helpers/decrypt';
import { prepareContact as encrypt } from '../../helpers/encrypt';
import { merge } from '../../helpers/merge';
import { move } from 'proton-shared/lib/helpers/array';
import { noop } from 'proton-shared/lib/helpers/function';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE } from '../../constants';

import ContactDetails from './ContactDetails';
import MergeContactPreview from './MergeContactPreview';
import MergeModalContent from './MergeModalContent';
import MergingModalContent from './MergingModalContent';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE } = CATEGORIES;

// helper to re-order arrays inside a list of arrays
const reOrderInGroup = (collection, groupIndex, { oldIndex, newIndex }) =>
    collection.map((group, i) => {
        if (i === groupIndex) {
            return move(group, oldIndex, newIndex);
        }
        return group;
    });

const MergeModal = ({ contacts, userKeysList, onMerge = noop, ...rest }) => {
    const api = useApi();
    const { call } = useEventManager();
    const { createModal } = useModals();
    const { publicKeys, privateKeys } = bothUserKeys(userKeysList);

    const [isMerging, setIsMerging] = useState(false);
    const [model, setModel] = useState({
        orderedContacts: contacts,
        isChecked: contacts.map((group) => group.map(() => true)),
        isDeleted: contacts.map((group) => group.map(() => false)),
        merged: { success: [], error: [] },
        submitted: { success: [], error: [] }
    });

    const { orderedContacts, isChecked, isDeleted, merged, submitted } = model;

    const beMergedIDs = orderedContacts
        .map((group, i) => group.map(({ ID }, j) => isChecked[i][j] && !isDeleted[i][j] && ID).filter(Boolean))
        .filter((group) => group.length > 1);
    const beDeletedIDs = orderedContacts
        .map((group, i) => group.map(({ ID }, j) => isDeleted[i][j] && ID).filter(Boolean))
        .filter((group) => group.length)
        .flat();
    const totalContacts = beMergedIDs.flat().length;

    const handleClickDetails = (contactID) => {
        createModal(<ContactDetails contactID={contactID} userKeysList={userKeysList} />);
    };

    const handlePreview = (beMergedIDs, groupIndex) => {
        createModal(
            <MergeContactPreview
                beMergedIDs={beMergedIDs}
                userKeysList={userKeysList}
                beDeletedIDs={beDeletedIDs[groupIndex]}
                onMerge={() => handleRemoveMerged(groupIndex)}
            />
        );
    };

    const handleRemoveMerged = (groupIndex) => {
        setModel({
            ...model,
            orderedContacts: orderedContacts.filter((_group, i) => i !== groupIndex),
            isChecked: isChecked.filter((_group, i) => i !== groupIndex),
            isDeleted: isDeleted.filter((_group, i) => i !== groupIndex)
        });
    };

    const handleToggleCheck = (groupIndex) => (index) => {
        setModel({
            ...model,
            isChecked: isChecked.map((group, i) => {
                if (i !== groupIndex) {
                    return group;
                }
                return group.map((bool, j) => (index === j ? !bool : bool));
            })
        });
    };

    const handleToggleDelete = (groupIndex) => (index) => {
        setModel({
            ...model,
            isDeleted: isDeleted.map((group, i) => {
                if (i !== groupIndex) {
                    return group;
                }
                return group.map((bool, j) => (index === j ? !bool : bool));
            })
        });
    };

    const handleSortEnd = (groupIndex) => ({ oldIndex, newIndex }) => {
        setModel({
            ...model,
            orderedContacts: reOrderInGroup(orderedContacts, groupIndex, { oldIndex, newIndex }),
            isChecked: reOrderInGroup(isChecked, groupIndex, { oldIndex, newIndex }),
            isDeleted: reOrderInGroup(isDeleted, groupIndex, { oldIndex, newIndex })
        });
    };

    const handleMerge = async () => {
        const encryptedContacts = [];
        const beDeletedAfterMergeIDs = [];
        for (const group of beMergedIDs) {
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
                setModel((model) => ({
                    ...model,
                    merged: { ...model.merged, success: [...model.merged.success, ...group] }
                }));
                // encrypt merged contact
                const encryptedContact = await encrypt(mergedContact, privateKeys, publicKeys);
                encryptedContacts.push({ contact: encryptedContact, group });
                beDeletedAfterMergeIDs.push(group.slice(1));
            } catch (errror) {
                setModel((model) => ({
                    ...model,
                    merged: { ...model.merged, error: [...model.merged.error, ...group] }
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
        if (beDeletedIDs && beDeletedIDs.length) {
            await api(deleteContacts(beDeletedIDs));
        }
        onMerge();
        await call();
    };

    const { content, ...modalProps } = (() => {
        // display table with mergeable contacts
        if (!isMerging) {
            const handleSubmit = () => {
                setIsMerging(true);
                handleMerge();
            };
            const footer = (
                <>
                    <ResetButton>{c('Action').t`Cancel`}</ResetButton>
                    <PrimaryButton type="submit" disabled={!beMergedIDs.length}>{c('Action').t`Merge`}</PrimaryButton>
                </>
            );

            return {
                title: c('Title').t`Merge contacts`,
                content: (
                    <MergeModalContent
                        onSortEnd={handleSortEnd}
                        orderedContacts={orderedContacts}
                        isChecked={isChecked}
                        isDeleted={isDeleted}
                        onClickCheckbox={handleToggleCheck}
                        onClickDetails={handleClickDetails}
                        onClickDelete={handleToggleDelete}
                        onClickUndelete={handleToggleDelete}
                        onClickPreview={handlePreview}
                    />
                ),
                footer,
                onSubmit: handleSubmit,
                ...rest
            };
        }

        // display progress bar while merging contacts
        const footer = (
            <PrimaryButton type="reset" loading={submitted.success.length + submitted.error.length !== totalContacts}>
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
                    total={totalContacts}
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
    userKeysList: PropTypes.array.isRequired,
    onMerge: PropTypes.func
};

export default MergeModal;
