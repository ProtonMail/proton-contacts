import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useApi, Loader, FormModal, PrimaryButton } from 'react-components';

import { getContact } from 'proton-shared/lib/api/contacts';
import { prepareContact, bothUserKeys } from '../../helpers/decrypt';

import ContactViewErrors from '../ContactViewErrors';
import ExtendedContactSummary from './ExtendedContactSummary';

import { FAIL_TO_LOAD } from '../../constants';

const ContactDetails = ({ contactID, userKeysList, ...rest }) => {
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [model, setModel] = useState({ properties: [], errors: [] });

    useEffect(() => {
        const request = async () => {
            try {
                setLoading(true);
                const { Contact } = await api(getContact(contactID));
                const { properties, errors } = await prepareContact(Contact, bothUserKeys(userKeysList));
                setModel({ properties, errors });
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setModel({ ...model, errors: [FAIL_TO_LOAD] });
            }
        };

        request();
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
                    <ExtendedContactSummary properties={model.properties} />
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
