import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, useLoading, Loader, FormModal, PrimaryButton } from 'react-components';

import { getContact } from 'proton-shared/lib/api/contacts';
import { prepareContact, bothUserKeys } from '../../helpers/decrypt';

import ContactViewErrors from '../ContactViewErrors';
import MergedContactSummary from './MergedContactSummary';

import { FAIL_TO_LOAD } from '../../constants';

const ContactDetails = ({ contactID, userKeysList, ...rest }) => {
    const api = useApi();
    const [loading, withLoading] = useLoading(true);
    const [model, setModel] = useState({ properties: [], errors: [] });

    useEffect(() => {
        const request = async () => {
            const { Contact } = await api(getContact(contactID));
            const { properties, errors } = await prepareContact(Contact, bothUserKeys(userKeysList));
            setModel({ properties, errors });
        };

        try {
            withLoading(request());
        } catch (error) {
            setModel({ ...model, errors: [FAIL_TO_LOAD] });
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
                    <MergedContactSummary properties={model.properties} />
                </>
            )}
        </FormModal>
    );
};

ContactDetails.propTypes = {
    contactID: PropTypes.string,
    userKeysList: PropTypes.array
};

export default ContactDetails;
