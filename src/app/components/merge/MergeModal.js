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
        isChecked: contacts.map((group) => group.map(() => true)),
        isDeleted: contacts.map((group) => group.map(() => false)),
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
        .map((group, i) => group.map(({ ID }, j) => isChecked[i][j] && !isDeleted[i][j] && ID).filter(Boolean))
        .filter((group) => group.length > 1);
    // IDs of contacts marked for deletion
    const beDeletedIDs = orderedContacts
        .map((group, i) => group.map(({ ID }, j) => isDeleted[i][j] && ID).filter(Boolean))
        .filter((group) => group.length)
        .flat();
    // total number of contacts to be merged
    const totalContacts = beMergedIDs.flat().length;

    const handleClickDetails = (contactID) => {
        createModal(<ContactDetails contactID={contactID} userKeysList={userKeysList} />);
    };

    const handleRemoveMerged = (groupIndex) => {
        setModel({
            ...model,
            orderedContacts: orderedContacts.filter((_group, i) => i !== groupIndex),
            isChecked: isChecked.filter((_group, i) => i !== groupIndex),
            isDeleted: isDeleted.filter((_group, i) => i !== groupIndex)
        });
    };

    const handlePreview = (groupIDs, groupIndex) => {
        const handleMergePreview = () => {
            const newContactID = groupIDs[0];
            if (groupIDs.includes(contactID) && newContactID !== contactID) {
                history.push({ ...location, pathname: `/contacts/${newContactID}` });
            }
            handleRemoveMerged(groupIndex);
        };

        createModal(
            <MergeContactPreview
                beMergedIDs={groupIDs}
                userKeysList={userKeysList}
                beDeletedIDs={beDeletedIDs[groupIndex]}
                onMerge={handleMergePreview}
            />
        );
    };

    const handleToggleCheck = (groupIndex) => (index) => {
        setModel({
            ...model,
            isChecked: isChecked.map((group, i) =>
                i !== groupIndex ? group : group.map((bool, j) => (index === j ? !bool : bool))
            )
        });
    };

    const handleToggleDelete = (groupIndex) => (index) => {
        setModel({
            ...model,
            isDeleted: isDeleted.map((group, i) =>
                i !== groupIndex ? group : group.map((bool, j) => (index === j ? !bool : bool))
            )
        });
    };

    const handleSortEnd = (groupIndex) => ({ oldIndex, newIndex }) => {
        setModel({
            ...model,
            orderedContacts: moveInGroup(orderedContacts, groupIndex, { oldIndex, newIndex }),
            isChecked: moveInGroup(isChecked, groupIndex, { oldIndex, newIndex }),
            isDeleted: moveInGroup(isDeleted, groupIndex, { oldIndex, newIndex })
        });
    };

    const handleMerge = async () => {
        const { publicKeys, privateKeys } = splitKeys(userKeysList);

        const encryptedContacts = [];
        const beDeletedAfterMergeIDs = [];
        let newContactID = contactID;
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
        if (beDeletedIDs && beDeletedIDs.length) {
            await api(deleteContacts(beDeletedIDs));
        }
        onMerge();
        // if the current contact has been merged, update contactID
        if (newContactID && newContactID !== contactID) {
            history.push({ ...location, pathname: `/contacts/${newContactID}` });
        }
        await call();
    };

    const { content, ...modalProps } = (() => {
        // display table with mergeable contacts
        if (!isMerging) {
            const handleSubmit = () => {
                setIsMerging(true);
                withLoading(handleMerge());
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

        // display progress bar while merging contacts
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
    contactID: PropTypes.string,
    userKeysList: PropTypes.array.isRequired,
    onMerge: PropTypes.func,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    staticContext: PropTypes.object
};

export default withRouter(MergeModal);
