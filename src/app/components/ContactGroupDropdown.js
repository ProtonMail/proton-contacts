import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown,
    SmallButton,
    Icon,
    SearchInput,
    Checkbox,
    useContactGroups,
    useModals,
    useApi,
    Tooltip,
    useNotifications,
    useEventManager
} from 'react-components';
import { c, msgid } from 'ttag';
import { normalize } from 'proton-shared/lib/helpers/string';

import ContactGroupModal from './ContactGroupModal';
import { labelContactEmails, unLabelContactEmails } from 'proton-shared/lib/api/contacts';

const UNCHECKED = 0;
const CHECKED = 1;
const INDETERMINATE = 2;

const getModel = (contactGroups = [], contactEmails = []) => {
    if (!contactEmails.length || !contactGroups.length) {
        return Object.create(null);
    }

    return contactGroups.reduce((acc, { ID }) => {
        const inGroup = contactEmails.filter(({ LabelIDs = [] }) => {
            return LabelIDs.includes(ID);
        });
        acc[ID] = inGroup.length ? (contactEmails.length === inGroup.length ? CHECKED : INDETERMINATE) : UNCHECKED;
        return acc;
    }, Object.create(null));
};

const ContactGroupDropdown = ({ children, className, contactEmails, disabled }) => {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef();
    const { createNotification } = useNotifications();
    const { call } = useEventManager();
    const api = useApi();
    const { createModal } = useModals();
    const normalizedKeyword = normalize(keyword);
    const [contactGroups] = useContactGroups();
    const [model, setModel] = useState(getModel(contactGroups, contactEmails));
    const groups = normalizedKeyword.length
        ? contactGroups.filter(({ Name }) => normalize(Name).includes(normalizedKeyword))
        : contactGroups;

    const handleAdd = () => createModal(<ContactGroupModal />);
    const handleCheck = (contactGroupID) => ({ target }) => setModel({ ...model, [contactGroupID]: +target.checked });

    const handleApply = async () => {
        try {
            setLoading(true);
            const groupEntries = Object.entries(model);
            await Promise.all(
                groupEntries.map(([contactGroupID, isChecked]) => {
                    if (isChecked === INDETERMINATE) {
                        return Promise.resolve();
                    }

                    if (isChecked === CHECKED) {
                        const toLabel = contactEmails
                            .filter(({ LabelIDs = [] }) => !LabelIDs.includes(contactGroupID))
                            .map(({ ID }) => ID);
                        return api(labelContactEmails({ LabelID: contactGroupID, ContactEmailIDs: toLabel }));
                    }

                    const toUnlabel = contactEmails
                        .filter(({ LabelIDs = [] }) => LabelIDs.includes(contactGroupID))
                        .map(({ ID }) => ID);
                    return api(unLabelContactEmails({ LabelID: contactGroupID, ContactEmailIDs: toUnlabel }));
                })
            );
            await call();
            createNotification({
                text: c('Info').ngettext(msgid`Contact group apply`, `Contact groups apply`, groupEntries.length)
            });
            dropdownRef.current.close();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    return (
        <Dropdown
            caret
            disabled={disabled}
            className={className}
            content={children}
            autoClose={false}
            ref={dropdownRef}
        >
            <div className="flex flex-spacebetween pt1 pl1 pr1 mb1">
                <strong>{c('Label').t`Add to group`}</strong>
                <Tooltip title={c('Info').t`Create a new contact group`}>
                    <SmallButton className="pm-button--primary pm-button--for-icon" onClick={handleAdd}>
                        <Icon name="contacts-groups" fill="light" />+
                    </SmallButton>
                </Tooltip>
            </div>
            <div className="pl1 pr1 mb1">
                <SearchInput
                    value={keyword}
                    onChange={setKeyword}
                    autoFocus={true}
                    placeholder={c('Placeholder').t`Filter groups`}
                />
            </div>
            <div className="mb1">
                <ul className="unstyled m0 dropDown-contentInner">
                    {groups.map(({ ID, Name, Color }) => {
                        return (
                            <li
                                key={ID}
                                className="flex flex-spacebetween flex-nowrap border-bottom border-bottom--dashed pt0-5 pb0-5"
                            >
                                <label htmlFor={ID} className="flex flex-nowrap">
                                    <Icon name="contacts-groups" className="mr0-5" color={Color} />
                                    <span className="ellipsis" title={Name}>
                                        {Name}
                                    </span>
                                </label>
                                <Checkbox
                                    id={ID}
                                    checked={model[ID] === CHECKED}
                                    indeterminate={model[ID] === INDETERMINATE}
                                    onChange={handleCheck(ID)}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="aligncenter mb1">
                <SmallButton loading={loading} className="pm-button--primary" onClick={handleApply}>{c('Action')
                    .t`Apply`}</SmallButton>
            </div>
        </Dropdown>
    );
};

ContactGroupDropdown.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    contactEmails: PropTypes.arrayOf(PropTypes.object)
};

export default ContactGroupDropdown;
