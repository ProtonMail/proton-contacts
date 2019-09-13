import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon } from 'react-components';

const MergeRow = ({ style, onMerge, ...rest }) => {
    return (
        <div style={style} className="p1 flex flex-nowrap flex-items-center bg-pm-blue color-white" {...rest}>
            <div className="mr1">
                <Icon name="merge" color="white" />
            </div>
            <div className="flex flex-column">
                <div className="flex flex-items-center">
                    <span className="bold">{c('Info').t`Two or more contacts appear to be identical.`}</span>
                    <span className="mr0-5">{c('Info')
                        .jt`<b key="boldface">Two or more contacts appear to be identical.</b>Do you want to merge these contacts now?`}</span>
                    <button type="button" className="color-white underline" onClick={onMerge}>
                        {c('Action').t`Merge`}
                    </button>
                </div>
            </div>
        </div>
    );
};

MergeRow.propTypes = {
    style: PropTypes.object,
    onMerge: PropTypes.func
};

export default MergeRow;
