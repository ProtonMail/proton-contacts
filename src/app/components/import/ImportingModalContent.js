import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { Alert, useApi } from 'react-components';

import DynamicProgress from '../DynamicProgress';

import { addContacts } from 'proton-shared/lib/api/contacts';
import { extractVcards, parse as parseVcard } from '../../helpers/vcard';
import { prepareContact } from '../../helpers/encrypt';
import { percentageProgress } from '../../helpers/progress';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE } from '../../constants';
import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE, INCLUDE } = CATEGORIES;
const { CLEAR_TEXT } = CONTACT_CARD_TYPE;

const [PARSING, ENCRYPTING, IMPORTING, FINISHED] = [1, 2, 3, 4];

const ImportingModalContent = ({
    fileType,
    file,
    vcardContacts,
    onSetVcardContacts,
    loadingKeys,
    privateKey,
    onEncryptingDone
}) => {
    const api = useApi();

    const [step, setStep] = useState(PARSING);
    const [track, setTrack] = useState({
        total: 0,
        encrypted: [],
        failedOnParse: 0,
        failedOnEncrypt: [],
        imported: 0
    });

    const parseFileIfNeeded = async () => {
        if (fileType === 'text/vcard') {
            const vcards = extractVcards(file);
            setTrack((track) => ({ ...track, total: vcards.length }));
            const parsedVcards = [];
            for (const vcard of vcards) {
                try {
                    parsedVcards.push(parseVcard(vcard));
                } catch {
                    setTrack((track) => ({ ...track, failedOnParse: track.failedOnParse + 1 }));
                }
            }
            onSetVcardContacts(parsedVcards);
        } else {
            // in the case of a csv file, the parsing has occurred in the previous step
            setTrack((track) => ({ ...track, total: vcardContacts.length }));
        }
        setStep(ENCRYPTING);
    };

    const encryptContacts = async () => {
        const publicKey = privateKey.toPublic();
        for (const vcardContact of vcardContacts) {
            try {
                const contactEncrypted = await prepareContact(vcardContact, privateKey, publicKey);
                setTrack((track) => ({ ...track, encrypted: [...track.encrypted, contactEncrypted] }));
            } catch (error) {
                setTrack((track) => ({ ...track, failedOnEncrypt: [...track.failed, vcardContact] }));
            }
        }
        onEncryptingDone();
        setStep(IMPORTING);
    };

    const importContacts = async (contacts) => {
        // split encrypted contacts depending on having the CATEGORIES property
        const withCategories = contacts.filter(({ Cards }) =>
            Cards.some(({ Type, Data }) => Type === CLEAR_TEXT && Data.includes('CATEGORIES'))
        );
        const withoutCategories = contacts.filter(({ Cards }) =>
            Cards.every(({ Type, Data }) => Type !== CLEAR_TEXT || !Data.includes('CATEGORIES'))
        );

        // send encrypted contacts to API
        const responses = (await api(
            addContacts({ Contacts: withCategories, Overwrite: OVERWRITE_CONTACT, Labels: INCLUDE })
        )).Responses.concat(
            (await api(addContacts({ Contacts: withoutCategories, Overwrite: OVERWRITE_CONTACT, Labels: IGNORE })))
                .Responses
        ).map(({ Response }) => Response);

        const imported = responses.reduce((acc, { Code }) => {
            if (Code === SUCCESS_IMPORT_CODE) {
                return acc + 1;
            }
            return acc;
        }, 0);
        setTrack((track) => ({ ...track, imported }));
        setStep(FINISHED);
    };

    useEffect(() => {
        if (step === PARSING) {
            parseFileIfNeeded();
        }
        if (step === ENCRYPTING) {
            !loadingKeys && encryptContacts();
        }
        if (step === IMPORTING) {
            importContacts(track.encrypted);
        }
    }, [step, loadingKeys]);

    return (
        <>
            <Alert>
                {c('Description')
                    .t`Encrypting and importing contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-import-contacts"
                alt="contact-loader"
                value={percentageProgress(
                    track.encrypted.length,
                    track.failedOnParse + track.failedOnEncrypt.length,
                    track.total
                )}
                displayEnd={c('Progress bar description').ngettext(
                    msgid`${track.imported} out of ${track.total} contact successfully imported.`,
                    `${track.imported} out of ${track.total} contacts successfully imported.`,
                    track.imported
                )}
                endPostponed={step !== FINISHED}
            />
        </>
    );
};

ImportingModalContent.propTypes = {
    fileType: PropTypes.oneOf(['text/csv', 'text/vcard']),
    file: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ headers: PropTypes.array, contacts: PropTypes.array })
    ]).isRequired,
    vcardContacts: PropTypes.array.isRequired,
    onSetVcardContacts: PropTypes.func,
    loadingKeys: PropTypes.bool,
    privateKey: PropTypes.object.isRequired,
    encryptingDone: PropTypes.bool,
    onEncryptingDone: PropTypes.func
};

export default ImportingModalContent;
