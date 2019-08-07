import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useEventManager, Loader, FormModal, Icon, PrimaryButton, ResetButton } from 'react-components';

import { getContact, addContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { prepareContact as decrypt, bothUserKeys } from '../../helpers/decrypt';
import { prepareContact as encrypt } from '../../helpers/encrypt';
import { merge } from '../../helpers/merge';
import { noop } from 'proton-shared/lib/helpers/function';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE } from '../../constants';

import MergingModalContent from './MergingModalContent';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE } = CATEGORIES;

import ExtendedContactSummary from './ExtendedContactSummary';

const MergeContactPreview = ({ beMergedIDs, beDeletedIDs = [], userKeysList, onMerge = noop, ...rest }) => {
    const api = useApi();
    const { call } = useEventManager();
    const { privateKeys, publicKeys } = bothUserKeys(userKeysList);

    const [loading, setLoading] = useState(true);
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
            // encrypt merged contact
            const encryptedContact = await encrypt(model.merged, privateKeys, publicKeys);
            // send to API
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
        const getContacts = async () => {
            for (const ID of beMergedIDs) {
                try {
                    const { Contact } = await api(getContact(ID));
                    const { properties, errors } = await decrypt(Contact, { privateKeys, publicKeys });
                    if (errors.length) {
                        setModel((model) => ({ ...model, errorOnLoad: true }));
                    }
                    setModel((model) => ({
                        ...model,
                        contacts: [...model.contacts, properties]
                    }));
                } catch (error) {
                    setModel((model) => ({ ...model, errorOnLoad: true }));
                }
            }
            setLoading(false);
        };
        const mergeContacts = () => {
            try {
                setModel((model) => ({ ...model, merged: merge(model.contacts) }));
            } catch (error) {
                setModel((model) => ({ ...model, errorOnMerge: true }));
            }
        };

        if (loading) {
            getContacts();
        } else {
            mergeContacts();
        }
    }, [loading]);

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
                if (model.errorOnLoad) {
                    return (
                        <div className="bg-global-attention p1">
                            <Icon name="attention" className="mr1" />
                            <span className="mr1">
                                {c('Warning')
                                    .t`Some of the contacts to be merged display errors. Please review them individually`}
                            </span>
                        </div>
                    );
                }
                if (model.errorOnMerge) {
                    return (
                        <div className="bg-global-attention p1">
                            <Icon name="attention" className="mr1" />
                            <span className="mr1">{c('Warning').t`Contacts could not be merged`}</span>
                        </div>
                    );
                }
                return <ExtendedContactSummary properties={model.merged} />;
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
