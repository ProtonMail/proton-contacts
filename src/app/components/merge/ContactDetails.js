import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useLoading, Loader, FormModal, PrimaryButton } from 'react-components';
import { splitKeys } from 'proton-shared/lib/keys/keys';
import { getContact } from 'proton-shared/lib/api/contacts';
import { prepareContact } from 'proton-shared/lib/contacts/decrypt';

import { CRYPTO_PROCESSING_TYPES } from 'proton-shared/lib/contacts/constants';

import ContactViewErrors from '../ContactViewErrors';
import MergedContactSummary from './MergedContactSummary';

const ContactDetails = ({ contactID, userKeysList, hasPaidMail, ...rest }) => {
    const api = useApi();
    const [loading, withLoading] = useLoading(true);
    const [model, setModel] = useState({ properties: [], errors: [] });

    useEffect(() => {
        const request = async () => {
            const { Contact } = await api(getContact(contactID));
            const { properties, errors } = await prepareContact(Contact, splitKeys(userKeysList));
            setModel({ properties, errors });
        };

        try {
            withLoading(request());
        } catch (error) {
            setModel({ ...model, errors: [{ type: CRYPTO_PROCESSING_TYPES.FAIL_TO_LOAD, error }] });
        }
    }, []);

    return (
        <FormModal
            small
            title={c('Title').t`Contact Details`}
            onSubmit={rest.onClose}
            footer={<PrimaryButton type="submit">{c('Action').t`Close`}</PrimaryButton>}
            {...rest}
        >
            {loading ? (
                <Loader />
            ) : (
                <>
                    <ContactViewErrors errors={model.errors} />
                    <MergedContactSummary properties={model.properties} hasPaidMail={hasPaidMail} />
                </>
            )}
        </FormModal>
    );
};

ContactDetails.propTypes = {
    contactID: PropTypes.string,
    userKeysList: PropTypes.array,
    hasPaidMail: PropTypes.bool
};

export default ContactDetails;
