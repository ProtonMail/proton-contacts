import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon, Button } from 'react-components';

const MergeRow = ({ loadingUserKeys, style, onMerge, ...rest }) => {
    const boldText = <b key="boldface">{c('Info').t`Two or more contacts appear to be identical.`}</b>;

    return (
        <div style={style} className="p1 flex flex-nowrap flex-align-items-center bg-primary color-white" {...rest}>
            <div className="mr1 flex-item-noshrink">
                <Icon name="merge" color="white" />
            </div>
            <div className="text-left">
                <span className="mr0-5">{c('Info').jt`${boldText} Do you want to merge these contacts now?`}</span>
                <Button
                    className="button--small button--primary button--whiteborder align-baseline"
                    disabled={loadingUserKeys}
                    onClick={onMerge}
                >
                    {c('Action').t`Merge`}
                </Button>
            </div>
        </div>
    );
};

MergeRow.propTypes = {
    style: PropTypes.object,
    onMerge: PropTypes.func,
    loadingUserKeys: PropTypes.bool,
};

export default MergeRow;
