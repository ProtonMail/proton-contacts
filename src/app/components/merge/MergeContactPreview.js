import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useLoading, Loader, FormModal, PrimaryButton, ResetButton } from 'react-components';
import { splitKeys } from 'proton-shared/lib/keys/keys';
import { getContact } from 'proton-shared/lib/api/contacts';

import { prepareContact } from '../../helpers/decrypt';
import { merge } from '../../helpers/merge';

import MergeErrorContent from './MergeErrorContent';
import MergedContactSummary from './MergedContactSummary';
import MergingModalContent from './MergingModalContent';

const MergeContactPreview = ({ contactID, beMergedIDs, beDeletedIDs = [], userKeysList, updateModel, ...rest }) => {
    const api = useApi();
    const { privateKeys, publicKeys } = useMemo(() => splitKeys(userKeysList), []);

    const [loading, withLoading] = useLoading(true);
    const [isMerging, setIsMerging] = useState(false);
    const [mergeFinished, setMergeFinished] = useState(false);
    const [model, setModel] = useState({});

    const handleRemoveMerged = () => {
        const beRemovedIDs = beMergedIDs.slice(1).concat(beDeletedIDs);
        updateModel((model) => ({
            ...model,
            orderedContacts: model.orderedContacts
                .map((group) => group.filter(({ ID }) => !beRemovedIDs.includes(ID)))
                .filter((group) => group.length > 1)
        }));
    };

    useEffect(() => {
        const mergeContacts = async () => {
            try {
                const beMergedContacts = [];
                for (const ID of beMergedIDs) {
                    const { Contact } = await api(getContact(ID));
                    const { properties, errors } = await prepareContact(Contact, { privateKeys, publicKeys });
                    if (errors.length) {
                        setModel({ ...model, errorOnLoad: true });
                        throw new Error('Error decrypting contact');
                    }
                    beMergedContacts.push(properties);
                }
                setModel({ ...model, mergedContact: merge(beMergedContacts) });
            } catch {
                setModel({ ...model, errorOnMerge: true });
            }
        };

        withLoading(mergeContacts());
    }, []);

    const { content, ...modalProps } = (() => {
        /*
            display preview
        */
        if (!isMerging) {
            const submit = (
                <PrimaryButton type="submit" disabled={!model.mergedContact}>
                    {c('Action').t`Merge`}
                </PrimaryButton>
            );
            const content = (() => {
                if (loading) {
                    return <Loader />;
                }
                if (model.errorOnLoad || model.errorOnMerge) {
                    return <MergeErrorContent errorOnLoad={model.errorOnLoad} />;
                }
                return <MergedContactSummary properties={model.mergedContact} />;
            })();

            const handleSubmit = () => setIsMerging(true);

            return {
                content,
                title: c('Title').t`Contact Details`,
                submit,
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
            handleRemoveMerged();
            setMergeFinished(true);
        };

        return {
            title: c('Title').t`Merging contacts`,
            hasClose: false,
            content: (
                <MergingModalContent
                    contactID={contactID}
                    userKeysList={userKeysList}
                    beMergedIDs={[beMergedIDs]}
                    alreadyMerged={model.mergedContact}
                    beDeletedIDs={beDeletedIDs}
                    totalBeMerged={beMergedIDs.length}
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

MergeContactPreview.propTypes = {
    contactID: PropTypes.string,
    beMergedIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
    beDeletedIDs: PropTypes.arrayOf(PropTypes.string),
    userKeysList: PropTypes.array.isRequired,
    updateModel: PropTypes.func
};

export default MergeContactPreview;
