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
    const [model, setModel] = useState({
        orderedContacts: contacts,
        isChecked: contacts.flat().reduce((acc, { ID }) => {
            acc[ID] = true;
            return acc;
        }, {}),
        beDeleted: contacts.flat().reduce((acc, { ID }) => {
            acc[ID] = false;
            return acc;
        }, {})
    });

    const { orderedContacts, isChecked, beDeleted } = model;

    useEffect(() => {
        // close the modal if all contacts have been merged from preview
        if (!orderedContacts.flat().length) {
            rest.onClose();
        }
    }, model);

    const beMergedIDs = useMemo(
        () =>
            orderedContacts
                .map((group) => group.map(({ ID }) => isChecked[ID] && !beDeleted[ID] && ID).filter(Boolean))
                .map((group) => (group.length > 1 ? group : [])),
        [orderedContacts, isChecked, beDeleted]
    );
    const beDeletedIDs = useMemo(
        () => orderedContacts.map((group) => group.map(({ ID }) => beDeleted[ID] && ID).filter(Boolean)),
        [orderedContacts, beDeleted]
    );
    const totalBeMerged = useMemo(() => beMergedIDs.flat().length, [beMergedIDs]);

    console.log({ beMergedIDs });
    console.log({ beDeletedIDs });

    const { content, ...modalProps } = (() => {
        /*
            display table with mergeable contacts
        */
        if (!isMerging) {
            const handleSubmit = () => {
                setIsMerging(true);
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
                    <MergeModalContent
                        contactID={contactID}
                        userKeysList={userKeysList}
                        model={model}
                        updateModel={setModel}
                        beDeletedIDs={beDeletedIDs}
                    />
                ),
                footer,
                onSubmit: handleSubmit,
                ...rest
            };
        }

        /*
            display progress bar while merging contacts
        */
        const close = !mergeFinished && <ResetButton>{c('Action').t`Cancel`}</ResetButton>;
        const submit = (
            <PrimaryButton type="submit" loading={!mergeFinished}>
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
                    contactID={contactID}
                    userKeysList={userKeysList}
                    beMergedIDs={beMergedIDs.filter((group) => group.length > 1)}
                    beDeletedIDs={beDeletedIDs.flat()}
                    totalBeMerged={totalBeMerged}
                    onFinish={handleFinish}
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

export default MergeModal;
