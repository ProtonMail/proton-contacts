import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon, PrimaryButton, OrderableContainer, OrderableElement } from 'react-components';
import { move } from 'proton-shared/lib/helpers/array';

import ContactModalRow from './ContactModalRow';
import { OTHER_INFORMATION_FIELDS } from '../constants';
import EncryptedIcon from './EncryptedIcon';

const ICONS = {
    fn: 'contact',
    email: 'email',
    tel: 'phone',
    adr: 'address',
    other: 'info'
};

const ContactModalProperties = ({ properties: allProperties, field, onChange, onOrderChange, onAdd, onRemove }) => {
    const TITLES = {
        fn: c('Title').t`Display name`,
        email: c('Title').t`Email addresses`,
        tel: c('Title').t`Phone numbers`,
        adr: c('Title').t`Addresses`,
        other: c('Title').t`Other information`
    };

    const title = field ? TITLES[field] : TITLES.other;
    const iconName = field ? ICONS[field] : ICONS.other;
    const fields = field ? [field] : OTHER_INFORMATION_FIELDS;
    const properties = allProperties.filter(({ field }) => fields.includes(field));
    const canAdd = !fields.includes('fn');
    const rows = useMemo(
        () =>
            properties.map((property) => (
                <ContactModalRow
                    key={property.uid}
                    property={property}
                    onChange={onChange}
                    onRemove={onRemove}
                    onAdd={onAdd}
                    isOrderable={!!onOrderChange}
                />
            )),
        [properties, onChange, onRemove, onAdd, !!onOrderChange]
    );

    const handleSortEnd = useCallback(
        ({ newIndex, oldIndex }) => {
            const orderedProperties = move(properties, oldIndex, newIndex);
            onOrderChange(field, orderedProperties);
        },
        [properties, field]
    );

    return (
        <div className="border-bottom mb1">
            <h3 className="mb1 flex flex-nowrap flex-items-center flex-item-noshrink">
                <Icon className="mr0-5 flex-item-noshrink" name={iconName} />
                <span className="mr0-5">{title}</span>
                {['fn', 'email'].includes(field) ? null : <EncryptedIcon scrollContainerClass="pm-modalContentInner" />}
            </h3>
            {onOrderChange ? (
                <OrderableContainer helperClass="row--orderable" onSortEnd={handleSortEnd} useDragHandle>
                    <div>
                        {rows.map((row, index) => (
                            <OrderableElement key={row.key} index={index}>
                                {row}
                            </OrderableElement>
                        ))}
                    </div>
                </OrderableContainer>
            ) : (
                rows
            )}
            {canAdd ? <PrimaryButton className="mb1" onClick={onAdd}>{c('Action').t`Add`}</PrimaryButton> : null}
        </div>
    );
};

ContactModalProperties.propTypes = {
    field: PropTypes.string,
    properties: PropTypes.array,
    onChange: PropTypes.func,
    onOrderChange: PropTypes.func,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func
};

export default ContactModalProperties;
