import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Row, Group, ButtonGroup, Icon, useModals, useUser, classnames, Tooltip, RemoteImage } from 'react-components';
import { c } from 'ttag';

import { clearType, getType, formatAdr } from '../helpers/property';
import ContactGroupIcon from './ContactGroupIcon';
import ContactGroupDropdown from './ContactGroupDropdown';
import ContactLabelProperty from './ContactLabelProperty';
import ContactEmailSettingsModal from './ContactEmailSettingsModal';
import TooltipCopy from './TooltipCopy';

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
    const { field, first } = property;
    const [{ hasPaidMail }] = useUser();
    const { createModal } = useModals();
    const type = clearType(getType(property.type));
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
            const date = moment(value);
            if (date.isValid()) {
                return date.format('LL');
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
                                className="pm-button pm-button--small pm-group-button"
                                contactEmails={[contactEmail]}
                            >
                                <Tooltip title={c('Title').t`Contact group`}>
                                    <Icon name="contacts-groups" />
                                </Tooltip>
                            </ContactGroupDropdown>
                        ) : null}
                        <ButtonGroup onClick={handleSettings} className="pm-button--small">
                            <Tooltip title={c('Title').t`Email settings`}>
                                <Icon name="settings-singular" />
                            </Tooltip>
                        </ButtonGroup>
                        <TooltipCopy className="pm-button--small" value={value} />
                    </Group>
                );
            }
            case 'tel':
                return <TooltipCopy className="pm-button--small" value={value} />;
            case 'adr':
                return <TooltipCopy className="pm-button--small" value={formatAdr(value)} />;
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
