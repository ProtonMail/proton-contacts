import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    FormModal,
    Alert,
    useUser,
    useApi,
    useUserKeys,
    useEventManager,
    useNotifications,
    useModals
} from 'react-components';
import { c } from 'ttag';
import { addContacts } from 'proton-shared/lib/api/contacts';

import ContactModalProperties from './ContactModalProperties';
import { randomIntFromInterval } from 'proton-shared/lib/helpers/function';
import { generateUID } from 'react-components/helpers/component';
import { prepareContacts } from '../helpers/encrypt';
import { getEditableFields, getOtherInformationFields } from '../helpers/fields';
import UpgradeModal from './UpgradeModal';

const DEFAULT_MODEL = [{ field: 'fn', value: '' }, { field: 'email', value: '' }];

const editableFields = getEditableFields().map(({ value }) => value);
const otherInformationFields = getOtherInformationFields().map(({ value }) => value);
const UID_PREFIX = 'contact-property';

const formatModel = (properties = []) => {
    if (!properties.length) {
        return DEFAULT_MODEL.map((property) => ({ ...property, uid: generateUID(UID_PREFIX) })); // Add UID to localize the property easily;
    }
    return properties
        .filter(({ field }) => editableFields.includes(field)) // Only includes editable properties that we decided
        .map((property) => ({ ...property, uid: generateUID(UID_PREFIX) })); // Add UID to localize the property easily
};

const ContactModal = ({ contactID, properties: initialProperties, ...rest }) => {
    const { createModal } = useModals();
    const api = useApi();
    const { createNotification } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [user] = useUser();
    const { call } = useEventManager();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);
    const [properties, setProperties] = useState(formatModel(initialProperties));
    const title = contactID ? c('Title').t`Edit contact details` : c('Title').t`Add new contact`;
    const upgradeModalRef = useRef(false);

    const hasRequirement = (field) => {
        if (['fn', 'email'].includes(field) || user.hasPaidMail) {
            return true;
        }

        if (!upgradeModalRef.current) {
            upgradeModalRef.current = true;
            createModal(
                <UpgradeModal
                    onConfirm={() => {
                        upgradeModalRef.current = false;
                    }}
                    onClose={() => {
                        upgradeModalRef.current = false;
                    }}
                />
            );
        }

        return false;
    };

    const handleRemove = (propertyUID) => {
        const { field } = properties.find(({ uid }) => uid === propertyUID) || {};

        if (hasRequirement(field)) {
            setProperties(properties.filter(({ uid }) => uid !== propertyUID));
        }
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
        setProperties([...properties, { field, value: '', uid: generateUID(UID_PREFIX) }]);
    };

    const handleSubmit = async () => {
        const notEditableProperties = initialProperties.filter(({ field }) => !editableFields.includes(field));
        const Contacts = await prepareContacts([properties.concat(notEditableProperties)], userKeysList[0]);
        await api(addContacts({ Contacts, Overwrite: +!!contactID, Labels: 0 }));
        await call();
        rest.onClose();
        createNotification({ text: c('Success').t`Contact saved` });
    };

    const handleChange = ({ uid: propertyUID, value, key = 'value' }) => {
        const { field } = properties.find(({ uid }) => uid === propertyUID) || {};
        const newProperties = properties.map((property) => {
            if (property.uid === propertyUID) {
                return {
                    ...property,
                    [key]: value
                };
            }
            return property;
        });

        if (hasRequirement(field)) {
            setProperties(newProperties);
        }
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
            loading={loading || loadingUserKeys}
            onSubmit={() => {
                setLoading(true);
                handleSubmit()
                    .then(() => setLoading(false))
                    .catch(() => setLoading(false));
            }}
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
            <ContactModalProperties
                properties={properties}
                field="tel"
                onChange={handleChange}
                onRemove={handleRemove}
                onAdd={handleAdd('tel')}
            />
            <ContactModalProperties
                properties={properties}
                field="adr"
                onChange={handleChange}
                onRemove={handleRemove}
                onAdd={handleAdd('adr')}
            />
            <ContactModalProperties
                properties={properties}
                onChange={handleChange}
                onRemove={handleRemove}
                onAdd={handleAdd()}
            />
        </FormModal>
    );
};

ContactModal.propTypes = {
    contactID: PropTypes.string,
    properties: PropTypes.array,
    onClose: PropTypes.func
};

ContactModal.defaultProps = {
    properties: []
};

export default ContactModal;
