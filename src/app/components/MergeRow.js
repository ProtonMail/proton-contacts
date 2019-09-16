import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon } from 'react-components';

const MergeRow = ({ loadingUserKeys, style, onMerge, ...rest }) => {
    const boldText = <b key="boldface">{c('Info').t`Two or more contacts appear to be identical.`}</b>;

    return (
        <div style={style} className="p1 flex flex-nowrap flex-items-center bg-pm-blue color-white" {...rest}>
            <div className="mr1 flex-item-noshrink">
                <Icon name="merge" color="white" />
            </div>
            <div className="alignleft">
                <span className="mr0-5">{c('Info').jt`${boldText} Do you want to merge these contacts now?`}</span>
                <button
                    type="button"
                    className="color-white underline alignbaseline"
                    disabled={loadingUserKeys}
                    onClick={onMerge}
                >
                    {c('Action').t`Merge`}
                </button>
            </div>
        </div>
    );
};

MergeRow.propTypes = {
    style: PropTypes.object,
    onMerge: PropTypes.func,
    loadingUserKeys: PropTypes.bool
};

export default MergeRow;
