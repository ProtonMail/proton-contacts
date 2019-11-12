import React from 'react';
import PropTypes from 'prop-types';
import {
    Row,
    Group,
    ButtonGroup,
    Icon,
    Copy,
    useModals,
    useUser,
    classnames,
    Tooltip,
    RemoteImage
} from 'react-components';
import { c } from 'ttag';
import { parseISO, isValid, format } from 'date-fns';

import { dateLocale } from 'proton-shared/lib/i18n';
import { clearType, getType, formatAdr } from '../helpers/property';
import { getTypeLabels } from '../helpers/types';

import ContactGroupIcon from './ContactGroupIcon';
import ContactGroupDropdown from './ContactGroupDropdown';
import ContactLabelProperty from './ContactLabelProperty';
import ContactEmailSettingsModal from './ContactEmailSettingsModal';

const ContactViewProperty = ({
    property,
    properties,
    contactID,
    contactEmail,
    contactGroups = [],
    userKeysList,
    leftBlockWidth = 'w30',
    rightBlockWidth = 'w70'
}) => {
    const [{ hasPaidMail }] = useUser();
    const { createModal } = useModals();
    const types = getTypeLabels();

    const { field, first } = property;
    const cleanType = clearType(getType(property.type));
    const type = types[cleanType] || cleanType;
    const value = property.value;

    const getContent = () => {
        if (field === 'email') {
            return (
                <>
                    <a className="mr0-5" href={`mailto:${value}`} title={value}>
                        {value}
                    </a>
                    {contactGroups.map(({ ID, Name, Color }) => (
                        <ContactGroupIcon key={ID} name={Name} color={Color} />
                    ))}
                </>
            );
        }
        if (field === 'url') {
            return (
                <a href={value} target="_blank" rel="noopener noreferrer">
                    {value}
                </a>
            );
        }
        if (field === 'tel') {
            return <a href={`tel:${value}`}>{value}</a>;
        }
        if (['bday', 'anniversary'].includes(field)) {
            const [date] = [parseISO(value), new Date(value)].filter(isValid);
            if (date) {
                return format(date, 'PP', { locale: dateLocale });
            }
            return value;
        }
        if (field === 'logo') {
            return <RemoteImage src={value} />;
        }
        if (field === 'adr') {
            return formatAdr(value);
        }
        return value;
    };

    const getActions = () => {
        switch (field) {
            case 'email': {
                if (!contactEmail) {
                    return null;
                }

                const handleSettings = () => {
                    createModal(
                        <ContactEmailSettingsModal
                            userKeysList={userKeysList}
                            contactID={contactID}
                            emailProperty={property}
                            properties={properties}
                        />
                    );
                };

                return (
                    <Group>
                        {hasPaidMail ? (
                            <ContactGroupDropdown
                                className="pm-button pm-button--for-icon pm-group-button"
                                contactEmails={[contactEmail]}
                            >
                                <Tooltip title={c('Title').t`Contact group`}>
                                    <Icon name="contacts-groups" />
                                </Tooltip>
                            </ContactGroupDropdown>
                        ) : null}
                        <ButtonGroup onClick={handleSettings} className="pm-button--for-icon">
                            <Tooltip title={c('Title').t`Email settings`}>
                                <Icon name="settings-singular" />
                            </Tooltip>
                        </ButtonGroup>
                        <Copy className="pm-button--for-icon pm-group-button" value={value} />
                    </Group>
                );
            }
            case 'tel':
                return <Copy className="pm-button--for-icon" value={value} />;
            case 'adr':
                return <Copy className="pm-button--for-icon" value={formatAdr(value)} />;
            default:
                return null;
        }
    };

    return (
        <Row>
            <div className={classnames(['flex flex-items-center', leftBlockWidth])}>
                <ContactLabelProperty field={field} type={type} first={first} />
            </div>
            <div className={classnames(['flex flex-nowrap flex-items-center pl1', rightBlockWidth])}>
                <span className={classnames(['mr0-5 flex-item-fluid', !['note'].includes(field) && 'ellipsis'])}>
                    {getContent()}
                </span>
                <span className="flex-item-noshrink">{getActions()}</span>
            </div>
        </Row>
    );
};

ContactViewProperty.propTypes = {
    property: PropTypes.object.isRequired,
    properties: PropTypes.array,
    contactID: PropTypes.string.isRequired,
    contactEmail: PropTypes.object,
    contactGroups: PropTypes.arrayOf(PropTypes.object),
    userKeysList: PropTypes.array,
    leftBlockWidth: PropTypes.string,
    rightBlockWidth: PropTypes.string
};

export default ContactViewProperty;
