import React from 'react';
import { c } from 'ttag';
import { AppLink, RelatedSettingsSection, SettingsPropsShared } from 'react-components';
import { APPS } from 'proton-shared/lib/constants';
import { getAppName } from 'proton-shared/lib/apps/helper';
import PrivateMainSettingsAreaWithPermissions from '../components/PrivateMainSettingsAreaWithPermissions';
import ImportSection from '../components/settings/ImportSection';
import ExportSection from '../components/settings/ExportSection';

const calendarAppName = getAppName(APPS.PROTONCALENDAR);

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
                            <AppLink to="/settings/import" toApp={APPS.PROTONMAIL} className="button--primary mtauto">
                                {c('Action').t`Import mailbox`}
                            </AppLink>
                        ),
                    },
                    {
                        icon: 'calendar',
                        text: c('Info').t`Import your entire calendar or individual events into ${calendarAppName}.`,
                        link: (
                            <AppLink
                                to="/settings/calendars"
                                toApp={APPS.PROTONCALENDAR}
                                className="button--primary mtauto"
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
