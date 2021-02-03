import React from 'react';
import PropTypes from 'prop-types';
import { classnames } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

const EmailsTableCell = ({ contactID, emails = [], highlightedID, greyedOut }) => {
    return (
        <div
            className={classnames([
                'flex',
                'flex-align-items-center',
                'max-w100',
                opaqueClassName(greyedOut),
                contactID === highlightedID && 'text-bold',
            ])}
        >
            <span className="inline-block text-ellipsis">{emails.map((email) => `<${email}>`).join(', ')}</span>
        </div>
    );
};

EmailsTableCell.propTypes = {
    emails: PropTypes.arrayOf(PropTypes.string),
    contactID: PropTypes.string.isRequired,
    highlightedID: PropTypes.string,
    greyedOut: PropTypes.bool,
};

export default EmailsTableCell;
