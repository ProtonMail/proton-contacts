import React from 'react';
// import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert, Block, Row } from 'react-components';

const ImportGroupsModalContent = () => {
    return (
        <>
            <Alert>
                {c('Description')
                    .t`We picked up at least one group/organization from the list of contacts you are importing. Take the time to review how we should import these groups.`}
            </Alert>
            <Block>
                <Row>{/* TODO */}</Row>
            </Block>
        </>
    );
};

// ImportGroupsModalContent.propTypes = {};

export default ImportGroupsModalContent;
