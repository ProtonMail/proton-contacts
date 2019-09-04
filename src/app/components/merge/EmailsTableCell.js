import React from 'react';
import PropTypes from 'prop-types';
import { classnames } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

const EmailsTableCell = ({ contactID, emails = [], highlightedID, greyedOut }) => {
    return (
        <span
            className={classnames([
                'flex',
                'flex-items-center',
                'mw100',
                'inbl',
                'ellipsis',
                opaqueClassName(greyedOut),
                contactID === highlightedID && 'bold'
            ])}
        >
            {emails.map((email) => `<${email}>`).join(', ')}
        </span>
    );
};

EmailsTableCell.propTypes = {
    emails: PropTypes.arrayOf(PropTypes.string),
    contactID: PropTypes.string.isRequired,
    highlightedID: PropTypes.string,
    greyedOut: PropTypes.bool
};

export default EmailsTableCell;
