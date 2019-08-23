import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useLoading, useEventManager, Loader, FormModal, PrimaryButton, ResetButton } from 'react-components';
import { splitKeys } from 'proton-shared/lib/keys/keys';
import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { noop } from 'proton-shared/lib/helpers/function';

import { prepareContact as decrypt } from '../../helpers/decrypt';
import { prepareContact as encrypt } from '../../helpers/encrypt';
import { merge } from '../../helpers/merge';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE } from '../../constants';

import MergingModalContent from './MergingModalContent';
import MergeErrorContent from './MergeErrorContent';
import MergedContactSummary from './MergedContactSummary';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE } = CATEGORIES;

const MergeContactPreview = ({ beMergedIDs, beDeletedIDs = [], userKeysList, onMerge = noop, ...rest }) => {
    const api = useApi();
    const { call } = useEventManager();
    const { privateKeys, publicKeys } = useMemo(() => splitKeys(userKeysList), []);

    const [loading, withLoading] = useLoading(true);
    const [isMerging, setIsMerging] = useState(false);
    const [model, setModel] = useState({
        contacts: [],
        errorOnLoad: false,
        errorOnMerge: false,
        errorOnSubmit: false,
        submitted: []
    });

    const handleMerge = async () => {
        try {
            // encrypt contact obtained after merge
            const encryptedContact = await encrypt(model.merged, privateKeys, publicKeys);
            // send it to API
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
            // delete contacts that have been merged
            await api(deleteContacts(beMergedIDs.slice(1)));
            if (beDeletedIDs.length) {
                await api(deleteContacts(beDeletedIDs));
            }
            onMerge();
            await call();
        } catch (error) {
            setModel((model) => ({ ...model, errorOnSubmit: true }));
        }
        setModel((model) => ({ ...model, submitted: beMergedIDs }));
    };

    useEffect(() => {
        // decrypt contacts to be merged
        const getContacts = async () => {
            for (const ID of beMergedIDs) {
                const { Contact } = await api(getContact(ID));
                const { properties, errors } = await decrypt(Contact, { privateKeys, publicKeys });
                if (errors.length) {
                    throw new Error('Error decrypting contact');
                }
                setModel((model) => ({
                    ...model,
                    contacts: [...model.contacts, properties]
                }));
            }
        };
        // merge contacts
        const mergeContacts = () => setModel((model) => ({ ...model, merged: merge(model.contacts) }));

        withLoading(getContacts())
            .catch(() => setModel((model) => ({ ...model, errorOnLoad: true })))
            .then(mergeContacts)
            .catch(() => setModel((model) => ({ ...model, errorOnMerge: true })));
    }, []);

    const { content, ...modalProps } = (() => {
        // display preview of merged contact
        if (!isMerging) {
            const footer = (
                <>
                    <ResetButton>{c('Action').t`Cancel`}</ResetButton>
                    <PrimaryButton type="submit" disabled={!model.merged}>
                        {c('Action').t`Merge`}
                    </PrimaryButton>
                </>
            );
            const content = (() => {
                if (loading) {
                    return <Loader />;
                }
                if (model.errorOnLoad || model.errorOnMerge) {
                    return <MergeErrorContent errorOnLoad={model.errorOnLoad} />;
                }
                return <MergedContactSummary properties={model.merged} />;
            })();

            return {
                title: c('Title').t`Contact Details`,
                content,
                footer,
                onSubmit: () => {
                    setIsMerging(true);
                    handleMerge();
                },
                ...rest
            };
        }

        // display progress bar
        const footer = (
            <PrimaryButton type="reset" loading={!model.submitted.length}>
                {c('Action').t`Close`}
            </PrimaryButton>
        );
        return {
            title: c('Title').t`Merging contacts`,
            hasClose: false,
            content: (
                <MergingModalContent
                    merged={model.submitted}
                    notMerged={model.errorOnSubmit ? beMergedIDs : []}
                    submitted={model.submitted}
                    notSubmitted={model.errorOnSubmit ? beMergedIDs : []}
                    total={beMergedIDs.length}
                />
            ),
            footer,
            onSubmit: rest.onClose,
            ...rest
        };
    })();

    return <FormModal {...modalProps}>{content}</FormModal>;
};

MergeContactPreview.propTypes = {
    beMergedIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
    beDeletedIDs: PropTypes.arrayOf(PropTypes.string),
    userKeysList: PropTypes.array,
    onMerge: PropTypes.func
};

export default MergeContactPreview;
