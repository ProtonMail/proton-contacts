import React from 'react';
import PropTypes from 'prop-types';
import { Row, OrderableHandle, Icon, Field, DropdownActions, useModals } from 'react-components';
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

    return (
        <Row>
            <span className="w30 flex flex-nowrap mr1">
                {isOrderable ? (
                    <OrderableHandle key="icon">
                        <div className="cursor-row-resize mr0-5 flex mt1r">
                            <Icon name="text-justify" />
                        </div>
                    </OrderableHandle>
                ) : (
                    <div className="mr0-5 flex flex-items-center">
                        <Icon name="text-justify nonvisible" />
                    </div>
                )}
                <ContactModalLabel field={field} type={type} uid={property.uid} onChange={onChange} />
            </span>
            <span className="w50">
                <Field>
                    <ContactFieldProperty field={field} value={property.value} uid={property.uid} onChange={onChange} />
                </Field>
            </span>
            <span className="w20">
                {list.length > 0 && (
                    <div className="ml1 flex flex-item-noshrink flex-items-start">
                        <DropdownActions list={list} />
                    </div>
                )}
            </span>
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
