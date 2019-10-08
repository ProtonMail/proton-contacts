import React from 'react';
import PropTypes from 'prop-types';
import { Row, OrderableHandle, Icon, Field, DropdownActions, useModals, classnames } from 'react-components';
import { c } from 'ttag';

import { clearType, getType } from '../helpers/property';
import ContactFieldProperty from './ContactFieldProperty';
import ContactModalLabel from './ContactModalLabel';
import ContactImageModal from './ContactImageModal';

const ContactModalRow = ({ property, onChange, onRemove, isOrderable = false }) => {
    const { createModal } = useModals();
    const { field, uid } = property;
    const type = clearType(getType(property.type));
    const canDelete = !['fn'].includes(field);
    const canClear = ['photo', 'logo'].includes(field) && property.value;
    const canEdit = ['photo', 'logo'].includes(field);

    const list = [
        canDelete && {
            text: c('Action').t`Delete`,
            onClick() {
                onRemove(property.uid);
            }
        },
        canClear && {
            text: c('Action').t`Clear`,
            onClick() {
                onChange({ uid, value: '' });
            }
        },
        canEdit && {
            text: c('Action').t`Edit`,
            onClick() {
                const handleSubmit = (value) => onChange({ uid, value });
                createModal(<ContactImageModal url={property.value} onSubmit={handleSubmit} />);
            }
        }
    ].filter(Boolean);

    const classNameActions = classnames(['ml1 flex ', canEdit ? 'flex-items-start' : 'flex-items-end']);

    return (
        <Row>
            {isOrderable && (
                <OrderableHandle key="icon">
                    <div className="cursor-row-resize mr0-5 flex flex-items-center">
                        <Icon name="text-justify" />
                    </div>
                </OrderableHandle>
            )}
            <ContactModalLabel field={field} type={type} uid={property.uid} onChange={onChange} />
            <Field className={classnames([field === 'adr' && 'pm-field-container--address'])}>
                <ContactFieldProperty field={field} value={property.value} uid={property.uid} onChange={onChange} />
            </Field>
            {list.length > 0 && (
                <div className={classNameActions}>
                    <DropdownActions list={list} />
                </div>
            )}
        </Row>
    );
};

ContactModalRow.propTypes = {
    property: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    isOrderable: PropTypes.bool
};

export default ContactModalRow;
