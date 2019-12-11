import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { classnames, Input } from 'react-components';
import { c } from 'ttag';

import { POST_BOX, EXTENDED, STREET, LOCALITY, REGION, POSTAL_CODE, COUNTRY } from '../constants';

const initialAddress = (address) => {
    const addressArray = Array.isArray(address) ? address : address.split(',');
    return Array.from({ length: 7 }).map((_, i) => addressArray[i] || '');
};

const ContactAdrField = ({ value, onChange }) => {
    const [address, setAddress] = useState(initialAddress(value));

    const handleChange = (index) => ({ target }) => {
        const newAddress = [...address];
        newAddress[index] = target.value;
        setAddress(newAddress);
        onChange(newAddress);
    };

    return (
        <>
            <div className="mb1">
                <Input
                    id="street"
                    value={address[STREET]}
                    placeholder={c('Label').t`Street address`}
                    onChange={handleChange(STREET)}
                />
            </div>
            <div className="mb1">
                <Input
                    id="locality"
                    value={address[LOCALITY]}
                    placeholder={c('Label').t`City`}
                    onChange={handleChange(LOCALITY)}
                />
            </div>
            <div className="mb1">
                <label className="small opacity-50" htmlFor="region"></label>
                <Input
                    id="region"
                    value={address[REGION]}
                    placeholder={c('Label').t`Region`}
                    onChange={handleChange(REGION)}
                />
            </div>
            <div className="mb1">
                <Input
                    id="postalCode"
                    value={address[POSTAL_CODE]}
                    placeholder={c('Label').t`Postal code`}
                    onChange={handleChange(POSTAL_CODE)}
                />
            </div>
            <div className={classnames([(address[POST_BOX] || address[EXTENDED]) && 'mb1'])}>
                <Input
                    id="country"
                    value={address[COUNTRY]}
                    placeholder={c('Label').t`Country`}
                    onChange={handleChange(COUNTRY)}
                />
            </div>
            {address[POST_BOX] ? (
                <div className={classnames([address[EXTENDED] && 'mb1'])}>
                    <Input
                        id="postBox"
                        value={address[POST_BOX]}
                        placeholder={c('Label').t`Post office box`}
                        onChange={handleChange(POST_BOX)}
                    />
                </div>
            ) : null}
            {address[EXTENDED] ? (
                <div>
                    <Input
                        id="extended"
                        value={address[EXTENDED]}
                        placeholder={c('Label').t`Extended address`}
                        onChange={handleChange(EXTENDED)}
                    />
                </div>
            ) : null}
        </>
    );
};

ContactAdrField.propTypes = {
    value: PropTypes.oneOfType(PropTypes.arrayOf(PropTypes.string), PropTypes.string),
    onChange: PropTypes.func
};

export default ContactAdrField;
