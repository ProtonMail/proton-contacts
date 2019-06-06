import React from 'react';
import PropTypes from 'prop-types';
import { Row, Field, DropdownActions } from 'react-components';
import { c } from 'ttag';

import ContactFieldProperty from './ContactFieldProperty';
import ContactLabelProperty from './ContactLabelProperty';
import { clearType, getType } from '../helpers/property';

const ContactRowProperty = ({ property, onChange, onAdd, onDelete, onMoveUp, onMoveDown, first, last }) => {
    const { field } = property;
    const type = clearType(getType(property.type));
    const containsMultiple = first !== last;
    const canAdd = ['tel', 'email', 'adr'].includes(field) && last;
    const canDelete = ['tel', 'email', 'adr'].includes(field) && containsMultiple;
    const canMoveUp = ['email'].includes(field) && !first;
    const canMoveDown = ['email'].includes(field) && !last;

    const list = [
        canAdd && { text: c('Action').t`Add`, onClick: onAdd },
        canDelete && { text: c('Action').t`Delete`, onClick: onDelete },
        canMoveUp && { text: c('Action').t`Move up`, onClick: onMoveUp },
        canMoveDown && { text: c('Action').t`Move down`, onClick: onMoveDown }
    ].filter(Boolean);

    return (
        <Row>
            <ContactLabelProperty field={field} type={type} />
            <Field>
                <ContactFieldProperty field={field} value={property.value} onChange={onChange} />
            </Field>
            {list.length ? (
                <div className="ml1 flex flex-items-end">
                    <DropdownActions list={list} />
                </div>
            ) : null}
        </Row>
    );
};

ContactRowProperty.propTypes = {
    property: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    first: PropTypes.bool,
    last: PropTypes.bool
};

ContactRowProperty.defaultProps = {
    first: false,
    last: false
};

export default ContactRowProperty;
