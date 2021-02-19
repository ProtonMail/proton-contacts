import React, { CSSProperties, ChangeEvent, DragEvent } from 'react';
import { c } from 'ttag';
import { classnames, Checkbox, ContactGroupLabels } from 'react-components';
import { DENSITY } from 'proton-shared/lib/constants';
import { UserSettings } from 'proton-shared/lib/interfaces';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import { ContactGroup } from 'proton-shared/lib/interfaces/contacts';
import { addPlus, getInitials } from 'proton-shared/lib/helpers/string';
import ItemCheckbox from './ItemCheckbox';
import { FormattedContact } from '../interfaces/FormattedContact';

interface Props {
    checked: boolean;
    userSettings: UserSettings;
    onClick: (ID: string) => void;
    onCheck: (event: ChangeEvent) => void;
    style: CSSProperties;
    contactID: string;
    hasPaidMail: boolean;
    contactGroupsMap: SimpleMap<ContactGroup>;
    contact: FormattedContact;
    onDragStart: (event: DragEvent, contact: FormattedContact) => void;
    onDragEnd: (event: DragEvent) => void;
    dragged: boolean;
}

const ContactRow = ({
    checked,
    style,
    userSettings,
    contactID,
    hasPaidMail,
    contactGroupsMap,
    contact,
    onClick,
    onCheck,
    onDragStart,
    onDragEnd,
    dragged,
}: Props) => {
    const { ID, Name, LabelIDs = [], emails = [] } = contact;
    const isCompactView = userSettings.Density === DENSITY.COMPACT;

    const contactGroups = contact.LabelIDs.map((ID) => contactGroupsMap[ID] as ContactGroup);

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
            style={style}
            key={ID}
            onClick={() => onClick(ID)}
            draggable
            onDragStart={(event) => onDragStart(event, contact)}
            onDragEnd={onDragEnd}
            className={classnames([
                'item-container item-contact flex cursor-pointer bg-global-white',
                contactID === ID && 'item-is-selected',
                dragged && 'item-dragging',
            ])}
        >
            <div className="flex flex-nowrap w100 h100 mtauto mbauto flex-align-items-center">
                {isCompactView ? (
                    <Checkbox
                        className="item-icon-compact"
                        checked={checked}
                        onChange={onCheck}
                        labelOnClick={(event) => event.stopPropagation()}
                        data-contact-id={ID}
                        aria-describedby={ID}
                    />
                ) : (
                    <ItemCheckbox
                        checked={checked}
                        onChange={onCheck}
                        onClick={(event) => event.stopPropagation()}
                        data-contact-id={ID}
                    >
                        {getInitials(Name)}
                    </ItemCheckbox>
                )}

                <div className="flex-item-fluid pl1 flex flex-column flex-justify-space-between conversation-titlesender">
                    <div className="flex flex-nowrap flex-align-items-center item-firstline max-w100">
                        <div className={classnames(['flex flex-item-fluid w0', !!LabelIDs.length && 'pr1'])}>
                            <span className="text-bold inline-block max-w100 text-ellipsis" id={ID}>
                                {Name}
                            </span>
                        </div>
                        {hasPaidMail && contactGroups && <ContactGroupLabels contactGroups={contactGroups} />}
                    </div>
                    <div
                        className="flex flex-align-items-center item-secondline max-w100 text-ellipsis item-sender--smaller"
                        title={emails.join(', ')}
                    >
                        {emails.length ? (
                            addPlus(emails as any)
                        ) : (
                            <span className="placeholder">{c('Info').t`No email address`}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactRow;
