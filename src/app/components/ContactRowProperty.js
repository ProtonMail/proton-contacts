import React from 'react';
import PropTypes from 'prop-types';
import { Row, Label, Field, Input } from 'react-components';
import { getLabels } from '../helpers/field';
import { getValue } from '../helpers/property';

const ContactRowProperty = ({ property }) => {
    const LABELS = getLabels();
    return (
        <Row>
            <Label>{LABELS[property.field]}</Label>
            <Field>
                <Input value={getValue(property.values)} />
            </Field>
        </Row>
    );
};

ContactRowProperty.propTypes = {
    property: PropTypes.object.isRequired
};

export default ContactRowProperty;
