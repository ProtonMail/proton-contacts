import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Row, Group, ButtonGroup, Copy, useModals, useUser, useContactEmails } from 'react-components';
import { normalize } from 'proton-shared/lib/helpers/string';
import { c } from 'ttag';

import { clearType, getType, formatAdr } from '../helpers/property';
import ContactGroupIcon from './ContactGroupIcon';
import ContactGroupDropdown from './ContactGroupDropdown';
import ContactLabelProperty from './ContactLabelProperty';
import ContactEmailSettingsModal from './ContactEmailSettingsModal';

const ContactViewProperty = ({ property, properties, contactID }) => {
    const { field, first } = property;
    const [{ hasPaidMail }] = useUser();
    const { createModal } = useModals();
    const [contactEmails] = useContactEmails();
    const type = clearType(getType(property.type));
    const value = property.value;

    const getContent = () => {
        switch (field) {
            case 'email': {
                return (
                    <>
                        <a className="mr0-5" href={`mailto:${value}`} title={value}>
                            {value}
                        </a>
                        {property.contactGroups.length
                            ? property.contactGroups.map(({ Name, Color, ID }) => (
                                  <ContactGroupIcon key={ID} name={Name} color={Color} />
                              ))
                            : null}
                    </>
                );
            }
            case 'url':
                return (
                    <a href={value} target="_blank" rel="noopener noreferrer">
                        {value}
                    </a>
                );
            case 'tel':
                return <a href={`tel:${value}`}>{value}</a>;
            case 'bday':
            case 'anniversary': {
                const date = moment(value);
                if (date.isValid()) {
                    return date.format('LL');
                }
                return value;
            }
            case 'photo':
            case 'logo':
                return <img src={value} alt={field} />;
            case 'adr':
                return formatAdr(value);
            default:
                return value;
        }
    };

    const getActions = () => {
        switch (field) {
            case 'email': {
                const contactEmail = contactEmails.find(({ Email = '' }) => Email === normalize(value));

                if (!contactEmail) {
                    return null;
                }

                const handleSettings = () => {
                    createModal(
                        <ContactEmailSettingsModal
                            contactID={contactID}
                            contactEmail={contactEmail}
                            properties={properties}
                        />
                    );
                };

                return (
                    <Group>
                        {hasPaidMail ? (
                            <>
                                <ContactGroupDropdown
                                    className="pm-button pm-button--small pm-group-button"
                                    contactEmails={[contactEmail]}
                                >{c('Contact group dropdown').t`Group`}</ContactGroupDropdown>
                                <ButtonGroup onClick={handleSettings} className="pm-button--small">{c('Action')
                                    .t`Settings`}</ButtonGroup>
                            </>
                        ) : null}
                        <Copy className="pm-button--small pm-group-button" value={value} />
                    </Group>
                );
            }
            case 'tel':
                return <Copy className="pm-button--small" value={value} />;
            case 'adr':
                return <Copy className="pm-button--small" value={formatAdr(value)} />;
            default:
                return null;
        }
    };

    return (
        <Row>
            <ContactLabelProperty field={field} type={type} first={first} />
            <div className="flex flex-nowrap flex-items-center w100">
                <span className="mr0-5 ellipsis">{getContent()}</span>
                <span className="flex-item-noshrink">{getActions()}</span>
            </div>
        </Row>
    );
};

ContactViewProperty.propTypes = {
    property: PropTypes.object.isRequired,
    properties: PropTypes.array,
    contactID: PropTypes.string
};

export default ContactViewProperty;
