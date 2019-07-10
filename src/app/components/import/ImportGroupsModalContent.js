import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert, Block, Row, Select } from 'react-components';

const ImportGroupsModalContent = () => {
    return (
        <>
            <Alert>
                {c('Description')
                    .t`We picked up at least one group/organization from the list of contacts you are importing. Take the time to review how we should import these groups.`}
            </Alert>
            <Block>
                <Row>
                    {c('jurrr').t`Family (5 contacts)`}
                    <Select
                        value={1}
                        options={[{ text: 'uno', value: 1 }, { text: 'dos', value: 2 }, { text: 'tres', value: 3 }]}
                    />
                    <Select
                        value={2}
                        options={[{ text: 'uno', value: 1 }, { text: 'dos', value: 2 }, { text: 'tres', value: 3 }]}
                    />
                </Row>
            </Block>
        </>
    );
};

ImportGroupsModalContent.propTypes = {};

export default ImportGroupsModalContent;
