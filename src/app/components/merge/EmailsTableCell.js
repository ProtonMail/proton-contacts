import React from 'react';
import PropTypes from 'prop-types';
import { classnames } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

const EmailsTableCell = ({ contactID, emails = [], highlightedID, greyedOut }) => {
    return (
        <div
            className={classnames([
                'flex',
                'flex-items-center',
                'mw100',
                opaqueClassName(greyedOut),
                contactID === highlightedID && 'bold'
            ])}
        >
            <span className="inbl ellipsis">{emails.map((email) => `<${email}>`).join(', ')}</span>
        </div>
    );
};

EmailsTableCell.propTypes = {
    emails: PropTypes.arrayOf(PropTypes.string),
    contactID: PropTypes.string.isRequired,
    highlightedID: PropTypes.string,
    greyedOut: PropTypes.bool
};

export default EmailsTableCell;
