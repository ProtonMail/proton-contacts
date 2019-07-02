import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Select, Label } from 'react-components';

import ContactLabelProperty from './ContactLabelProperty';

const FIELDS = ['email', 'tel', 'adr']; // List of field where we let the user change the type

const ContactModalLabel = ({ field, uid, type, onChange }) => {
    const handleChangeType = ({ target }) => onChange({ value: target.value, key: 'type', uid });
    const handleChangeField = ({ target }) => onChange({ value: target.value, key: 'field', uid });

    const OPTIONS = {
        email: [
            { text: c('Property type').t`Email`, value: '' },
            { text: c('Property type').t`Home`, value: 'home' },
            { text: c('Property type').t`Work`, value: 'work' },
            { text: c('Property type').t`Other`, value: 'other' }
        ],
        tel: [
            { text: c('Property type').t`Phone`, value: '' },
            { text: c('Property type').t`Home`, value: 'home' },
            { text: c('Property type').t`Professional`, value: 'professional' },
            { text: c('Property type').t`Other`, value: 'other' },
            { text: c('Property type').t`Mobile`, value: 'cell' },
            { text: c('Property type').t`Main`, value: 'main' },
            { text: c('Property type').t`Fax`, value: 'fax' }
        ],
        adr: [
            { text: c('Property type').t`Address`, value: '' },
            { text: c('Property type').t`Home`, value: 'home' },
            { text: c('Property type').t`Work`, value: 'work' },
            { text: c('Property type').t`Other`, value: 'other' }
        ],
        fields: [
            { text: c('Property field').t`Birthday`, value: 'bday' },
            { text: c('Property field').t`Anniversary`, value: 'anniversary' },
            { text: c('Property field').t`Gender`, value: 'gender' },
            { text: c('Property field').t`Language`, value: 'lang' },
            { text: c('Property field').t`Timezone`, value: 'tz' },
            { text: c('Property field').t`Geo`, value: 'geo' },
            { text: c('Property field').t`Title`, value: 'title' },
            { text: c('Property field').t`Role`, value: 'role' },
            { text: c('Property field').t`Logo`, value: 'logo' },
            { text: c('Property field').t`Org`, value: 'org' },
            { text: c('Property field').t`Member`, value: 'member' },
            { text: c('Property field').t`Note`, value: 'note' },
            { text: c('Property field').t`URL`, value: 'url' }
        ]
    };

    if (field === 'fn' || (OPTIONS[field] && !OPTIONS[field].map(({ value }) => value).includes(type))) {
        return <ContactLabelProperty field={field} type={type} />;
    }

    if (FIELDS.includes(field)) {
        return (
            <Label className="pt0">
                <Select value={type} options={OPTIONS[field]} onChange={handleChangeType} />
            </Label>
        );
    }

    return (
        <Label className="pt0">
            <Select value={field} options={OPTIONS.fields} onChange={handleChangeField} />
        </Label>
    );
};

ContactModalLabel.propTypes = {
    field: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    type: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

ContactModalLabel.defaultProps = {
    type: ''
};

export default ContactModalLabel;
