import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon } from 'react-components';

const MergeRow = ({ key, style }) => {
    const handleClick = () => {
        // TODO start merge process
    };

    return (
        <div key={key} style={style} className="p1 flex flex-nowrap flex-items-center bg-pm-blue color-white">
            <div className="mr1">
                <Icon name="merge" color="white" />
            </div>
            <div className="flex flex-column">
                <div className="bold">{c('Info').t`Two or more contacts appears to be identical.`}</div>
                <div className="flex flex-items-center">
                    <span className="mr0-5">{c('Info').t`Do you want to merge these contacts now?`}</span>
                    <button type="button" className="color-white underline" onClick={handleClick}>{c('Action')
                        .t`Merge`}</button>
                </div>
            </div>
        </div>
    );
};

MergeRow.propTypes = {
    key: PropTypes.string,
    index: PropTypes.number,
    style: PropTypes.string
};

export default MergeRow;
