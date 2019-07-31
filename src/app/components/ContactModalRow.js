import React from 'react';
import PropTypes from 'prop-types';
import { Row, OrderableHandle, Icon, Field, DropdownActions, useModals } from 'react-components';
import { c } from 'ttag';

import { clearType, getType } from '../helpers/property';
import ContactFieldProperty from './ContactFieldProperty';
import ContactModalLabel from './ContactModalLabel';
import ContactImageModal from './ContactImageModal';

const ContactModalRow = ({ property, onChange, onRemove, onMoveUp, onMoveDown, first, last, isOrderable }) => {
    const { createModal } = useModals();
    const { field, uid } = property;
    const type = clearType(getType(property.type));
    const canDelete = !['fn'].includes(field);
    const canMoveUp = ['email'].includes(field) && !first;
    const canMoveDown = ['email'].includes(field) && !last;
    const canClear = ['photo', 'logo'].includes(field) && property.value;
    const canEdit = ['photo', 'logo'].includes(field);

    const list = [
        canDelete && {
            text: c('Action').t`Delete`,
            onClick() {
                onRemove(property.uid);
            }
        },
        canMoveUp && { text: c('Action').t`Move up`, onClick: onMoveUp },
        canMoveDown && { text: c('Action').t`Move down`, onClick: onMoveDown },
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

    return (
        <Row>
            {isOrderable && (
                <OrderableHandle key="icon">
                    <div style={{ cursor: 'row-resize' }} className="mr0-5 flex flex-items-center">
                        <Icon name="text-justify" />
                    </div>
                </OrderableHandle>
            )}
            <ContactModalLabel field={field} type={type} uid={property.uid} onChange={onChange} />
            <Field>
                <ContactFieldProperty field={field} value={property.value} uid={property.uid} onChange={onChange} />
            </Field>
            {list.length > 0 && (
                <div className="ml1 flex flex-items-end">
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
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    first: PropTypes.bool,
    last: PropTypes.bool,
    isOrderable: PropTypes.bool
};

ContactModalRow.defaultProps = {
    first: false,
    last: false,
    isOrderable: false
};

export default ContactModalRow;
