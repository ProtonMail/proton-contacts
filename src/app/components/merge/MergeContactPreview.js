import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useApi,
    useLoading,
    useEventManager,
    Loader,
    FormModal,
    PrimaryButton,
    ResetButton,
    ContactView,
    useContactEmails,
    useAddresses,
    useContactGroups
} from 'react-components';
import { splitKeys } from 'proton-shared/lib/keys/keys';
import { getContact } from 'proton-shared/lib/api/contacts';
import { prepareContact } from 'proton-shared/lib/contacts/decrypt';
import { noop } from 'proton-shared/lib/helpers/function';
import { toMap } from 'proton-shared/lib/helpers/object';

import { merge } from '../../helpers/merge';

import MergeErrorContent from './MergeErrorContent';
import MergingModalContent from './MergingModalContent';

const MergeContactPreview = ({ contactID, userKeysList, beMergedModel, beDeletedModel, updateModel, ...rest }) => {
    const { call } = useEventManager();
    const api = useApi();
    const { privateKeys, publicKeys } = useMemo(() => splitKeys(userKeysList), []);

    const [contactEmails, loadingContactEmails] = useContactEmails();

    const [addresses = [], loadingAddresses] = useAddresses();
    const ownAddresses = useMemo(() => addresses.map(({ Email }) => Email), [addresses]);

    const [contactGroups = [], loadingContactGroups] = useContactGroups();
    const contactGroupsMap = useMemo(() => toMap(contactGroups), [contactGroups]);

    const [loading, withLoading] = useLoading(true);
    const [isMerging, setIsMerging] = useState(false);
    const [mergeFinished, setMergeFinished] = useState(false);
    const [model, setModel] = useState({});

    const [beMergedIDs] = Object.values(beMergedModel);
    const beDeletedIDs = Object.keys(beDeletedModel);

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
        // Display preview
        if (!isMerging) {
            const submit = (
                <PrimaryButton type="submit" disabled={!model.mergedContact}>
                    {c('Action').t`Merge`}
                </PrimaryButton>
            );
            const content = (() => {
                if (loadingContactEmails || loadingAddresses || loadingContactGroups || loading) {
                    return <Loader />;
                }
                if (model.errorOnLoad || model.errorOnMerge) {
                    const error = model.errorOnLoad
                        ? c('Warning')
                              .t`Some of the contacts to be merged display errors. Please review them individually`
                        : c('Warning').t`Contacts could not be merged`;

                    return <MergeErrorContent error={error} />;
                }

                return (
                    <ContactView
                        properties={model.mergedContact}
                        contactID={contactID}
                        contactEmails={contactEmails}
                        contactGroupsMap={contactGroupsMap}
                        ownAddresses={ownAddresses}
                        userKeysList={userKeysList}
                        onDelete={noop}
                        isModal
                        isPreview
                    />
                );
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

        // Display progress bar while merging contacts
        const close = !mergeFinished && <ResetButton>{c('Action').t`Cancel`}</ResetButton>;
        const submit = (
            <PrimaryButton type="submit" loading={!mergeFinished}>
                {c('Action').t`Close`}
            </PrimaryButton>
        );

        const handleFinish = async () => {
            handleRemoveMerged();
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
                    alreadyMerged={model.mergedContact}
                    beMergedModel={beMergedModel}
                    beDeletedModel={beDeletedModel}
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
    userKeysList: PropTypes.array.isRequired,
    beMergedModel: PropTypes.shape({ ID: PropTypes.arrayOf(PropTypes.string) }),
    beDeletedModel: PropTypes.shape({ ID: PropTypes.string }),
    updateModel: PropTypes.func
};

export default MergeContactPreview;
