import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon } from 'react-components';

const MergeErrorContent = ({ errorOnLoad = true }) => {
    return errorOnLoad ? (
        <div className="bg-global-attention p1">
            <Icon name="attention" className="mr1" />
            <span className="mr1">
                {c('Warning').t`Some of the contacts to be merged display errors. Please review them individually`}
            </span>
        </div>
    ) : (
        <div className="bg-global-attention p1">
            <Icon name="attention" className="mr1" />
            <span className="mr1">{c('Warning').t`Contacts could not be merged`}</span>
        </div>
    );
};

MergeErrorContent.propTypes = {
    errorOnLoad: PropTypes.bool
};

export default MergeErrorContent;
