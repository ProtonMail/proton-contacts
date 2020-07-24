import { c } from 'ttag';
import React from 'react';
import { Alert } from 'react-components';
import { ImportContactsModel } from '../../interfaces/Import';
import ErrorDetails from './ErrorDetails';

interface Props {
    model: ImportContactsModel;
}

const WarningModalContent = ({ model }: Props) => {
    const contactsDiscarded = model.errors;
    const totalSupported = model.parsedVcardContacts.length;
    const totalContactsDiscarded = contactsDiscarded.length;
    const totalContacts = totalSupported + totalContactsDiscarded;

    const forNow = <span key="for-now" className="bold">{c('Import contacts warning').t`for now`}</span>;
    const summary =
        totalContactsDiscarded === totalContacts
            ? c('Import warning').t`No contact can be imported. Click for details`
            : c('Import warning')
                  .t`${totalContactsDiscarded} out of ${totalContacts} contacts will not be imported. Click for details`;

    return (
        <>
            <Alert type="warning">
                <div>{c('Import contacts warning').jt`ProtonContacts does not support ${forNow}:`}</div>
                <ul>
                    <li>{c('Import calendar warning').t`vCard versions < 4.0`}</li>
                </ul>
            </Alert>
            <ErrorDetails summary={summary} errors={model.errors} />
        </>
    );
};

export default WarningModalContent;
