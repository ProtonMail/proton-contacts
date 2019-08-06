import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'react-components';
import { c } from 'ttag';

import { POST_BOX, EXTENDED, STREET, LOCALITY, REGION, POSTAL_CODE, COUNTRY } from '../constants';

const ContactAdrField = ({ value, onChange }) => {
    const [address, setAddress] = useState(value);

    const handleChange = (index) => ({ target }) => {
        const newAddress = [...address];
        newAddress[index] = target.value;
        setAddress(newAddress);
        onChange(newAddress);
    };

    return (
        <>
            <div>
                <label className="small opacity-50" htmlFor="street">{c('Label').t`Street address`}</label>
                <Input id="street" value={address[STREET]} onChange={handleChange(STREET)} />
            </div>
            <div>
                <label className="small opacity-50" htmlFor="locality">{c('Label').t`City`}</label>
                <Input id="locality" value={address[LOCALITY]} onChange={handleChange(LOCALITY)} />
            </div>
            <div>
                <label className="small opacity-50" htmlFor="region">{c('Label').t`Region`}</label>
                <Input id="region" value={address[REGION]} onChange={handleChange(REGION)} />
            </div>
            <div>
                <label className="small opacity-50" htmlFor="postalCode">{c('Label').t`Postal code`}</label>
                <Input id="postalCode" value={address[POSTAL_CODE]} onChange={handleChange(POSTAL_CODE)} />
            </div>
            <div>
                <label className="small opacity-50" htmlFor="country">{c('Label').t`Country`}</label>
                <Input id="country" value={address[COUNTRY]} onChange={handleChange(COUNTRY)} />
            </div>
            {address[POST_BOX] ? (
                <div>
                    <label className="small opacity-50" htmlFor="postBox">{c('Label').t`Post office box`}</label>
                    <Input id="postBox" value={address[POST_BOX]} onChange={handleChange(POST_BOX)} />
                </div>
            ) : null}
            {address[EXTENDED] ? (
                <div>
                    <label className="small opacity-50" htmlFor="extended">{c('Label').t`Extended address`}</label>
                    <Input id="extended" value={address[EXTENDED]} onChange={handleChange(EXTENDED)} />
                </div>
            ) : null}
        </>
    );
};

ContactAdrField.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};

export default ContactAdrField;
