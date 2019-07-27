import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useModals, Loader, FormModal, Icon, PrimaryButton, ResetButton } from 'react-components';

import { getContact } from 'proton-shared/lib/api/contacts';
import { prepareContact, bothUserKeys } from '../../helpers/decrypt';
import { merge } from '../../helpers/merge';

import ExtendedContactSummary from './ExtendedContactSummary';
import MergingModal from './MergingModal';

import { FAIL_TO_LOAD } from '../../constants';

const MergeContactPreview = ({ contactsIDs, userKeysList, ...rest }) => {
    const api = useApi();
    const { createModal } = useModals();

    const [loading, setLoading] = useState(true);
    const [model, setModel] = useState({ contacts: [], errors: [] });

    const mergedContact = loading ? [] : merge(model.contacts);

    const handleSumbit = () => {
        rest.onClose();
        createModal(
            <MergingModal contactsIDs={[contactsIDs]} userKeysList={userKeysList} mergedContact={mergedContact} />
        );
    };

    useEffect(() => {
        const request = async () => {
            setLoading(true);
            for (const ID of contactsIDs) {
                try {
                    const { Contact } = await api(getContact(ID));
                    const { properties, contactErrors } = await prepareContact(Contact, bothUserKeys(userKeysList));
                    setModel(({ contacts, errors }) => ({
                        contacts: [...contacts, properties],
                        errors: [...errors, contactErrors]
                    }));
                } catch (error) {
                    setModel(({ contacts, errors }) => ({
                        contacts,
                        errors: [...errors, [FAIL_TO_LOAD]]
                    }));
                }
            }
            setLoading(false);
        };

        request();
    }, []);

    return (
        <FormModal
            small
            title={c('Title').t`Contact Details`}
            submit={c('Action').t`Merge`}
            footer={
                <>
                    <ResetButton>{c('Action').t`Cancel`}</ResetButton>
                    <PrimaryButton type="submit" disabled={loading}>
                        {c('Action').t`Merge`}
                    </PrimaryButton>
                </>
            }
            onSubmit={handleSumbit}
            {...rest}
        >
            {loading ? (
                <Loader />
            ) : model.errors.filter(Boolean).length ? (
                <div className="bg-global-attention p1">
                    <Icon name="attention" className="mr1" />
                    <span className="mr1">
                        {c('Warning')
                            .t`Some of the contacts to be merged display errors. Please review them individually`}
                    </span>
                </div>
            ) : (
                <ExtendedContactSummary properties={mergedContact} />
            )}
        </FormModal>
    );
};

MergeContactPreview.propTypes = {
    contactID: PropTypes.string,
    userKeysList: PropTypes.array
};

export default MergeContactPreview;
