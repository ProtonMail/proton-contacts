import React from 'react';
import { NavMenu, useModals, PrimaryButton } from 'react-components';
import { c } from 'ttag';
import PropTypes from 'prop-types';

import ContactModal from '../components/ContactModal';

import ContactGroupModal from '../components/ContactGroupModal';
import ContactGroupsModal from '../components/ContactGroupsModal';
import ImportModal from '../components/import/ImportModal';
import ExportModal from '../components/ExportModal';

const PrivateSidebar = ({ contactGroups }) => {
    const { createModal } = useModals();

    const list = [
        {
            icon: 'contacts',
            isActive(match, location) {
                if (!match) {
                    return false;
                }
                const params = new URLSearchParams(location.search);
                const contactGroupID = params.get('contactGroupID');
                return !contactGroupID;
            },
            text: c('Link').t`Contacts`,
            link: '/contacts'
        },
        {
            icon: 'import',
            text: c('Action').t`Import`,
            type: 'button',
            onClick() {
                createModal(<ImportModal />);
            }
        },
        {
            icon: 'export',
            text: c('Action').t`Export`,
            type: 'button',
            onClick() {
                createModal(<ExportModal />);
            }
        },
        {
            icon: 'merge',
            text: c('Action').t`Merge`,
            type: 'button',
            onClick() {}
        },
        {
            icon: 'contacts-group',
            text: c('Link').t`Group`,
            type: 'button',
            className: 'alignleft',
            onClick() {
                createModal(<ContactGroupsModal />);
            }
        }
    ].concat(
        contactGroups.map(({ Name: text, Color: color, ID: contactGroupID }) => ({
            icon: 'contacts-groups',
            isActive(match, location) {
                const params = new URLSearchParams(location.search);
                return params.get('contactGroupID') === contactGroupID;
            },
            color,
            text,
            link: `/contacts?contactGroupID=${contactGroupID}`
        }))
    );

    list.push({
        icon: 'add',
        text: c('Link').t`Add group`,
        type: 'button',
        className: 'alignleft',
        onClick() {
            createModal(<ContactGroupModal />);
        }
    });

    return (
        <div className="sidebar flex flex-column noprint">
            <div className="pl1 pr1">
                <PrimaryButton className="w100" onClick={() => createModal(<ContactModal />)}>{c('Action')
                    .t`Add contact`}</PrimaryButton>
            </div>
            <nav className="navigation mw100 flex-item-fluid scroll-if-needed mb1">
                <NavMenu list={list} />
            </nav>
        </div>
    );
};

PrivateSidebar.propTypes = {
    contactGroups: PropTypes.array
};

export default PrivateSidebar;
