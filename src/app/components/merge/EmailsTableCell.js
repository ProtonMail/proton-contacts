import React from 'react';
import PropTypes from 'prop-types';
import { classnames } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

const EmailsTableCell = ({ emails = [], index, greyedOut }) => {
    return (
        <span
            className={classnames([
                'flex',
                'flex-items-center',
                'mw100',
                'inbl',
                'ellipsis',
                opaqueClassName(greyedOut),
                index === 0 && 'bold'
            ])}
        >
            {emails.map((email) => `<${email}>`).join(', ')}
        </span>
    );
};

EmailsTableCell.propTypes = {
    emails: PropTypes.arrayOf(PropTypes.string),
    index: PropTypes.number.isRequired,
    greyedOut: PropTypes.bool
};

export default EmailsTableCell;
