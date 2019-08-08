import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useModals, Icon } from 'react-components';

import MergeModal from './merge/MergeModal';

const MergeRow = ({ style, mergeableContacts, userKeysList, loadingUserKeys }) => {
    const { createModal } = useModals();

    const handleClick = () => {
        createModal(<MergeModal contacts={mergeableContacts} userKeysList={userKeysList} />);
    };

    return (
        <div style={style} className="p1 flex flex-nowrap flex-items-center bg-pm-blue color-white">
            <div className="mr1">
                <Icon name="merge" color="white" />
            </div>
            <div className="flex flex-column">
                <div className="bold">{c('Info').t`Two or more contacts appear to be identical.`}</div>
                <div className="flex flex-items-center">
                    <span className="mr0-5">{c('Info').t`Do you want to merge these contacts now?`}</span>
                    <button
                        type="button"
                        className="color-white underline"
                        onClick={handleClick}
                        disabled={loadingUserKeys}
                    >{c('Action').t`Merge`}</button>
                </div>
            </div>
        </div>
    );
};

MergeRow.propTypes = {
    style: PropTypes.object,
    mergeableContacts: PropTypes.array.isRequired,
    userKeysList: PropTypes.array,
    loadingUserKeys: PropTypes.bool
};

export default MergeRow;
