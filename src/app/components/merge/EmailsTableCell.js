import React from 'react';
import PropTypes from 'prop-types';

import { opaqueClassName } from '../../helpers/css';

const EmailsTableCell = ({ emails = [], greyedOut }) => {
    return (
        <span className={`flex flex-items-center mw100 inbl ellipsis ${opaqueClassName(greyedOut)}`}>
            {emails.join(', ')}
        </span>
    );
};

EmailsTableCell.propTypes = {
    emails: PropTypes.arrayOf(PropTypes.string),
    greyedOut: PropTypes.bool
};

export default EmailsTableCell;
