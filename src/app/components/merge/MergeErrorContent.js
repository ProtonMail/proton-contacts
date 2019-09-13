import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-components';

const MergeErrorContent = ({ error }) => {
    return (
        <div className="bg-global-attention p1">
            <Icon name="attention" className="mr1" />
            <span className="mr1">{error}</span>
        </div>
    );
};

MergeErrorContent.propTypes = {
    error: PropTypes.string
};

export default MergeErrorContent;
