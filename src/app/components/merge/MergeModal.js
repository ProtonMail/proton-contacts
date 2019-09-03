import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useEventManager, FormModal, ResetButton, PrimaryButton } from 'react-components';

import MergeModalContent from './MergeModalContent';
import MergingModalContent from './MergingModalContent';

const MergeModal = ({ contacts, contactID, userKeysList, ...rest }) => {
    const { call } = useEventManager();

    const [isMerging, setIsMerging] = useState(false);
    const [mergeFinished, setMergeFinished] = useState(false);
    const [model, setModel] = useState(() => ({
        orderedContacts: contacts,
        isChecked: contacts.flat().reduce((acc, { ID }) => {
            acc[ID] = true;
            return acc;
        }, {}),
<<<<<<< HEAD
        beDeleted: contacts.flat().reduce((acc, { ID }) => {
            acc[ID] = false;
            return acc;
        }, {})
    }));

    const { orderedContacts, isChecked, beDeleted } = model;
=======
        isDeleted: contacts.flat().reduce((acc, { ID }) => {
            acc[ID] = false;
            return acc;
        }, {}),
        merged: { success: [], error: [] },
        submitted: { success: [], error: [] }
    });

    const { orderedContacts, isChecked, isDeleted, merged, submitted } = model;
>>>>>>> refactor merge modal

    useEffect(() => {
        // close the modal if all contacts have been merged from preview
        if (!orderedContacts.flat().length) {
            rest.onClose();
        }
<<<<<<< HEAD
    }, [orderedContacts]);

    // beMergedModel = { 'ID of be-merged contact': [IDs to be merged] }
    // beDeletedModel = { 'ID of be-deleted contact': 'ID to navigate to in case it is the current ID' }
    const { beMergedModel, beDeletedModel, totalBeMerged } = useMemo(
        () =>
            orderedContacts.reduce(
                (acc, group) => {
                    const groupIDs = group.map(({ ID }) => ID);
                    const beMergedIDs = groupIDs.map((ID) => isChecked[ID] && !beDeleted[ID] && ID).filter(Boolean);
                    const beDeletedIDs = groupIDs.map((ID) => beDeleted[ID] && ID).filter(Boolean);
                    const willBeMerged = beMergedIDs.length > 1;

                    if (willBeMerged) {
                        acc.beMergedModel[beMergedIDs[0]] = beMergedIDs;
                        acc.totalBeMerged += beMergedIDs.length;
=======
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
>>>>>>> refactor merge modal
                    }
                    for (const ID of beDeletedIDs) {
                        // route to merged contact or to /contacts if no associated contact is merged
                        acc.beDeletedModel[ID] = willBeMerged ? beMergedIDs[0] : '';
                    }
<<<<<<< HEAD
                    return acc;
                },
                { beMergedModel: {}, beDeletedModel: {}, totalBeMerged: 0 }
            ),
        [orderedContacts, isChecked, beDeleted]
    );

    const { content, ...modalProps } = (() => {
        // Display table with mergeable contacts
        if (!isMerging) {
            const submit = (
                <PrimaryButton type="submit" disabled={!totalBeMerged}>{c('Action').t`Merge`}</PrimaryButton>
=======
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
>>>>>>> refactor merge modal
            );

            const handleSubmit = () => setIsMerging(true);

            return {
                title: c('Title').t`Merge contacts`,
                content: (
                    <MergeModalContent
                        contactID={contactID}
                        userKeysList={userKeysList}
                        model={model}
                        updateModel={setModel}
                        beMergedModel={beMergedModel}
                        beDeletedModel={beDeletedModel}
                    />
                ),
                submit,
                onSubmit: handleSubmit,
                ...rest
            };
        }

<<<<<<< HEAD
        // Display progress bar while merging contacts
        const close = !mergeFinished && <ResetButton>{c('Action').t`Cancel`}</ResetButton>;
        const submit = (
            <PrimaryButton type="submit" loading={!mergeFinished}>
=======
        /*
            display progress bar while merging contacts
        */
        const footer = (
            <PrimaryButton type="reset" loading={loading}>
>>>>>>> refactor merge modal
                {c('Action').t`Close`}
            </PrimaryButton>
        );

        const handleFinish = async () => {
            await call();
            setMergeFinished(true);
        };

        return {
            title: c('Title').t`Merging contacts`,
            hasClose: false,
            content: (
                <MergingModalContent
<<<<<<< HEAD
                    contactID={contactID}
                    userKeysList={userKeysList}
                    beMergedModel={beMergedModel}
                    beDeletedModel={beDeletedModel}
                    totalBeMerged={totalBeMerged}
                    onFinish={handleFinish}
=======
                    merged={merged.success}
                    notMerged={merged.error}
                    submitted={submitted.success}
                    notSubmitted={submitted.error}
                    total={totalBeMerged}
>>>>>>> refactor merge modal
                />
            ),
            close,
            submit,
            onSubmit: rest.onClose,
            ...rest
        };
    })();

    return <FormModal {...modalProps}>{content}</FormModal>;
};

MergeModal.propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.array).isRequired,
    contactID: PropTypes.string,
    userKeysList: PropTypes.array.isRequired
};

export default withRouter(MergeModal);
