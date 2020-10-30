import React from 'react';
import { c } from 'ttag';
import { AppLink, RelatedSettingsSection, SettingsPropsShared } from 'react-components';
import { APPS } from 'proton-shared/lib/constants';
import PrivateMainSettingsAreaWithPermissions from '../components/PrivateMainSettingsAreaWithPermissions';
import ImportSection from '../components/settings/ImportSection';
import ExportSection from '../components/settings/ExportSection';

export const getImportExportPage = () => {
    return {
        to: '/settings/import',
        icon: 'import',
        text: c('Title').t`Import & export`,
        subsections: [
            {
                text: c('Title').t`Import`,
                id: 'import',
            },
            {
                text: c('Title').t`Export`,
                id: 'export',
            },
            {
                text: c('Title').t`Related features`,
                id: 'related-features',
                hide: true,
            },
        ],
    };
};

const SettingsImportExportPage = ({ setActiveSection, location }: SettingsPropsShared) => {
    return (
        <PrivateMainSettingsAreaWithPermissions
            config={getImportExportPage()}
            location={location}
            setActiveSection={setActiveSection}
        >
            <ImportSection />
            <ExportSection />
            <RelatedSettingsSection
                list={[
                    {
                        icon: 'email',
                        text: c('Info').t`Import your old messages and folders into ProtonMail.`,
                        link: (
                            <AppLink
                                to="/import"
                                toApp={APPS.PROTONMAIL_SETTINGS}
                                className="pm-button--primary mtauto"
                            >
                                {c('Action').t`Import mailbox`}
                            </AppLink>
                        ),
                    },
                    {
                        icon: 'calendar',
                        text: c('Info').t`Import your entire calendar or individual events into ProtonCalendar.`,
                        link: (
                            <AppLink
                                to="/settings/calendars"
                                toApp={APPS.PROTONCALENDAR}
                                className="pm-button--primary mtauto"
                            >
                                {c('Action').t`Import calendar`}
                            </AppLink>
                        ),
                    },
                ]}
            />
        </PrivateMainSettingsAreaWithPermissions>
    );
};

export default SettingsImportExportPage;
