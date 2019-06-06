import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Row, Field, Group, ButtonGroup, Copy, useModals } from 'react-components';
import { c } from 'ttag';

import { clearType, getType, formatAdr } from '../helpers/property';
import ContactGroupIcon from './ContactGroupIcon';
import ContactGroupDropdown from './ContactGroupDropdown';
import ContactLabelProperty from './ContactLabelProperty';

const ContactViewProperty = ({ property }) => {
    const { field, first } = property;
    const { createModal } = useModals();
    const type = clearType(getType(property.type));
    const value = Array.isArray(property.value) ? property.value.join(', ') : property.value;

    const getContent = () => {
        switch (field) {
            case 'email': {
                return (
                    <>
                        <a className="mr0-5" href={`mailto:${value}`}>
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
                const handleSettings = () => {
                    createModal();
                };

                return (
                    <Group>
                        <ContactGroupDropdown className="pm-button--small pm-group-button" />
                        <ButtonGroup onClick={handleSettings} className="pm-button--small">{c('Action')
                            .t`Settings`}</ButtonGroup>
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
            <Field className="w100 pt0-5">
                <span className="mr0-5">{getContent()}</span>
                {getActions()}
            </Field>
        </Row>
    );
};

ContactViewProperty.propTypes = {
    property: PropTypes.object.isRequired
};

export default ContactViewProperty;
