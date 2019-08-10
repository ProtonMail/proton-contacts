import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert } from 'react-components';

const MergeModalContent = ({ children }) => {
    const boldNot = <b key="boldface">{c('Description').t`not`}</b>;

    return (
        <>
            <Alert>
                {c('Description')
                    .jt`Use Drag and Drop to rank merging priority between contacts. Uncheck the contacts you do ${boldNot} want to merge`}
            </Alert>
            <Alert type="warning">
                {c('Description')
                    .t`You can mark for deletion the contacts that you do not want neither to merge nor to keep.
                    Deletion will only take place after the merge button is clicked.`}
            </Alert>
            {children}
        </>
    );
};

MergeModalContent.propTypes = {
    children: PropTypes.node
};

export default MergeModalContent;
