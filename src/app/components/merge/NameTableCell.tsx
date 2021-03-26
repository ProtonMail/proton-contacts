import React from 'react';
import { Checkbox, classnames } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

interface Props {
    contactID: string;
    emails: string[];
    highlightedID: string;
    checked: boolean;
    deleted: boolean;
    greyedOut: boolean;
    name: string;
    onToggle: (ID: string) => void;
}

const NameTableCell = ({
    name,
    contactID,
    emails = [],
    highlightedID,
    checked,
    deleted,
    greyedOut,
    onToggle,
}: Props) => {
    const handleToggle = () => onToggle(contactID);

    const emailsDisplay = emails.map((email) => `<${email}>`).join(', ');
    const listMailID = `${contactID}_mail`; // need an unique id for proper linking between checkbox/labels

    return (
        <div className="flex flex-nowrap flex-align-items-center">
            <Checkbox
                checked={checked}
                onChange={handleToggle}
                className={`flex flex-align-items-center flex-item-noshrink mr0-5 ${
                    deleted ? 'visibility-hidden' : ''
                }`}
                aria-labelledby={`${contactID} ${listMailID}`}
            />
            <div className={classnames([opaqueClassName(greyedOut), contactID === highlightedID && 'text-bold'])}>
                <div id={contactID} className="text-ellipsis" title={name}>
                    {name}
                </div>
                <div id={listMailID} className="text-ellipsis" title={emailsDisplay}>
                    {emailsDisplay}
                </div>
            </div>
        </div>
    );
};

export default NameTableCell;
