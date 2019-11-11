import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    FormModal,
    Alert,
    useUser,
    useApi,
    useUserKeys,
    useEventManager,
    useNotifications,
    useLoading
} from 'react-components';
import { c } from 'ttag';
import { addContacts } from 'proton-shared/lib/api/contacts';

import ContactModalProperties from './ContactModalProperties';
import { randomIntFromInterval } from 'proton-shared/lib/helpers/function';
import { generateUID } from 'react-components/helpers/component';
import { prepareContacts } from '../helpers/encrypt';
import { hasCategories } from '../helpers/import';
import { addWKDFlags } from '../helpers/wkd';
import { getEditableFields, getOtherInformationFields } from '../helpers/fields';
import { OVERWRITE, CATEGORIES, UNIX_TIME_WKD_ON } from '../constants';
import { API_CODES } from 'proton-shared/lib/constants';

import UpsellFree from './UpsellFree';

const DEFAULT_MODEL = [{ field: 'fn', value: '' }, { field: 'email', value: '' }];
const { OVERWRITE_CONTACT, THROW_ERROR_IF_CONFLICT } = OVERWRITE;
const { INCLUDE, IGNORE } = CATEGORIES;
const { SINGLE_SUCCESS } = API_CODES;

const editableFields = getEditableFields().map(({ value }) => value);
const otherInformationFields = getOtherInformationFields().map(({ value }) => value);
const UID_PREFIX = 'contact-property';

const ContactModal = ({ contactID, modifyTime, properties: initialProperties = [], history, onAdd, ...rest }) => {
    const api = useApi();
    const { createNotification } = useNotifications();
    const [loadingWKDKeys, withLoadingWKDKeys] = useLoading();
    const [loadingSubmit, withLoadingSubmit] = useLoading();
    const [user] = useUser();
    const { call } = useEventManager();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);
    const [properties, setProperties] = useState([]);
    const title = contactID ? c('Title').t`Edit contact details` : c('Title').t`Add new contact`;

    useEffect(() => {
        const formatModel = async (properties = [], modifyTime) => {
            if (!properties.length) {
                const emptyProperties = DEFAULT_MODEL.map((property) => ({
                    ...property,
                    uid: generateUID(UID_PREFIX), // Add UID to localize the property easily
                    checkForWKDKeys: property.field === 'email' ? true : undefined
                }));
                return setProperties(emptyProperties);
            }
            const formattedProperties = properties
                .filter(({ field }) => editableFields.includes(field)) // Only includes editable properties that we decided
                .map((property) => ({ ...property, uid: generateUID(UID_PREFIX) })); // Add UID to localize the property easily

            // If the last modification time is earlier than UNIX_TIME_WKD_ON, add WKD flags
            const propertiesWithWKDChecks =
                modifyTime < UNIX_TIME_WKD_ON
                    ? formattedProperties.map((property) =>
                          property.field === 'email' ? { ...property, checkForWKDKeys: true } : property
                      )
                    : [...formattedProperties];
            const propertiesWithWKDFlags = await addWKDFlags(propertiesWithWKDChecks);
            setProperties(propertiesWithWKDFlags);
        };

        withLoadingWKDKeys(formatModel(initialProperties, modifyTime));
    }, []);

    const handleRemove = (propertyUID) => {
        setProperties(properties.filter(({ uid }) => uid !== propertyUID));
    };

    const handleAdd = (field) => () => {
        if (!field) {
            // Get random field from other info
            const index = randomIntFromInterval(0, otherInformationFields.length - 1);
            return setProperties([
                ...properties,
                { field: otherInformationFields[index], value: '', uid: generateUID(UID_PREFIX) }
            ]);
        }
        if (field === 'email') {
            // for new email addresses, we must check if there are WKD keys
            return setProperties([
                ...properties,
                { field, value: '', uid: generateUID(UID_PREFIX), checkForWKDKeys: true }
            ]);
        }
        setProperties([...properties, { field, value: '', uid: generateUID(UID_PREFIX) }]);
    };

    const handleSubmit = async () => {
        const notEditableProperties = initialProperties.filter(({ field }) => !editableFields.includes(field));
        const contact = await addWKDFlags(properties.concat(notEditableProperties), api);
        const Contacts = await prepareContacts([contact], userKeysList[0]);
        const labels = hasCategories(notEditableProperties) ? INCLUDE : IGNORE;
        const {
            Responses: [{ Response: { Code, Contact: { ID } = {} } = {} }]
        } = await api(
            addContacts({
                Contacts,
                Overwrite: contactID ? OVERWRITE_CONTACT : THROW_ERROR_IF_CONFLICT,
                Labels: labels
            })
        );
        if (Code !== SINGLE_SUCCESS) {
            rest.onClose();
            return createNotification({ text: c('Error').t`Contact could not be saved`, type: 'error' });
        }
        await call();
        if (!contactID) {
            onAdd();
            history.push(`/contacts/${ID}`);
        }
        rest.onClose();
        createNotification({ text: c('Success').t`Contact saved` });
    };

    const handleChange = ({ uid: propertyUID, value, key = 'value' }) => {
        const newProperties = properties.map((property) => {
            if (property.uid === propertyUID) {
                return {
                    ...property,
                    [key]: value
                };
            }
            return property;
        });
        setProperties(newProperties);
    };

    const handleOrderChange = useCallback(
        (field, orderedProperties) => {
            const newProperties = properties.filter((property) => property.field !== field);
            newProperties.unshift(...orderedProperties);

            setProperties(newProperties);
        },
        [properties]
    );

    return (
        <FormModal
            loading={loadingWKDKeys || loadingUserKeys || loadingSubmit}
            onSubmit={() => withLoadingSubmit(handleSubmit())}
            title={title}
            submit={c('Action').t`Save`}
            {...rest}
        >
            <Alert>{c('Info')
                .t`Email address, phone number and address at the top of their respective list are automatically set as the default information and will be displayed in the contact information's summary section.`}</Alert>
            <ContactModalProperties
                properties={properties}
                field="fn"
                onChange={handleChange}
                onRemove={handleRemove}
            />
            <ContactModalProperties
                properties={properties}
                field="email"
                onChange={handleChange}
                onRemove={handleRemove}
                onOrderChange={handleOrderChange}
                onAdd={handleAdd('email')}
            />
            {user.hasPaidMail ? (
                <>
                    <ContactModalProperties
                        properties={properties}
                        field="tel"
                        onChange={handleChange}
                        onRemove={handleRemove}
                        onOrderChange={handleOrderChange}
                        onAdd={handleAdd('tel')}
                    />
                    <ContactModalProperties
                        properties={properties}
                        field="adr"
                        onChange={handleChange}
                        onRemove={handleRemove}
                        onOrderChange={handleOrderChange}
                        onAdd={handleAdd('adr')}
                    />
                    <ContactModalProperties
                        properties={properties}
                        onChange={handleChange}
                        onRemove={handleRemove}
                        onAdd={handleAdd()}
                    />
                </>
            ) : (
                <UpsellFree />
            )}
        </FormModal>
    );
};

ContactModal.propTypes = {
    contactID: PropTypes.string,
    modifyTime: PropTypes.number,
    properties: PropTypes.array,
    onAdd: PropTypes.func,
    history: PropTypes.object
};

export default ContactModal;
