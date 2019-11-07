import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, Badge, DropdownActions } from 'react-components';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { isValid, format } from 'date-fns';

import { move, uniqueBy } from 'proton-shared/lib/helpers/array';
import { dateLocale } from 'proton-shared/lib/i18n';
import { serverTime } from 'pmcrypto/lib/serverTime';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';
import { describe } from 'proton-shared/lib/keys/keysAlgorithm';

import KeyWarningIcon from './KeyWarningIcon';

const ContactKeysTable = ({ model, setModel }) => {
    const [keys, setKeys] = useState([]);
    const header = [
        c('Table header').t`Fingerprint`,
        c('Table header').t`Created`,
        c('Table header').t`Type`,
        c('Table header').t`Status`,
        c('Table header').t`Actions`
    ];

    /**
     * Extract keys info from model.keys to define table body
     */
    const parse = async () => {
        // for external users, we allow "double counting" of WKD keys re-uploaded by the user
        const allKeys = uniqueBy([...model.keys.pinned, ...model.keys.api], (publicKey) => publicKey.getFingerprint());

        const parsedKeys = await Promise.all(
            allKeys.map(async (publicKey, index) => {
                try {
                    const date = +serverTime();
                    const creationTime = publicKey.getCreationTime();
                    const expirationTime = await publicKey.getExpirationTime('encrypt');
                    const isExpired = !(creationTime <= date && date <= expirationTime);
                    const isRevoked = await publicKey.isRevoked();
                    const algoInfo = publicKey.getAlgorithmInfo();
                    const algo = describe(algoInfo);
                    const fingerprint = publicKey.getFingerprint();
                    const isWKD = model.isPGPExternal && index >= model.keys.pinned.length;
                    const isPrimary = !index && !isExpired;
                    const isTrusted = model.trustedFingerprints.includes(fingerprint);
                    return {
                        publicKey,
                        fingerprint,
                        algo,
                        creationTime,
                        isPrimary,
                        isExpired,
                        isRevoked,
                        isTrusted,
                        isWKD
                    };
                } catch (error) {
                    return false;
                }
            })
        );
        setKeys(parsedKeys.filter(Boolean));
    };

    useEffect(() => {
        parse();
    }, [model.keys, model.trustedFingerprints]);

    return (
        <Table>
            <TableHeader cells={header} />
            <TableBody>
                {keys.map(
                    (
                        {
                            fingerprint,
                            algo,
                            creationTime,
                            isPrimary,
                            publicKey,
                            isExpired,
                            isRevoked,
                            isTrusted,
                            isWKD
                        },
                        index
                    ) => {
                        const creation = new Date(creationTime);
                        const list = [
                            {
                                text: c('Action').t`Download`,
                                async onClick() {
                                    const blob = new Blob([publicKey.armor()], {
                                        type: 'data:text/plain;charset=utf-8;'
                                    });
                                    const filename = `publickey - ${model.email} - 0x${fingerprint
                                        .slice(0, 8)
                                        .toUpperCase()}.asc`;

                                    downloadFile(blob, filename);
                                }
                            },
                            index > 0 &&
                                !isExpired &&
                                isTrusted && {
                                    text: c('Action').t`Make primary`,
                                    onClick() {
                                        setModel({
                                            ...model,
                                            keys: { ...model.keys, pinned: move(model.keys.pinned, index, 0) }
                                        });
                                    }
                                },
                            (model.isPGPInternal || model.isPGPExternalWithWKDKeys) &&
                                !isTrusted && {
                                    text: c('Action').t`Trust`,
                                    onClick() {
                                        setModel({
                                            ...model,
                                            trustedFingerprints: [...model.trustedFingerprints, fingerprint]
                                        });
                                    }
                                },
                            (model.isPGPInternal || model.isPGPExternalWithWKDKeys) &&
                                isTrusted && {
                                    text: c('Action').t`Untrust`,
                                    onClick() {
                                        setModel({
                                            ...model,
                                            trustedFingerprints: model.trustedFingerprints.filter(
                                                (f) => f !== fingerprint
                                            )
                                        });
                                    }
                                },
                            model.isPGPExternal &&
                                !isWKD && {
                                    text: c('Action').t`Remove`,
                                    onClick() {
                                        const copy = [...model.keys.pinned];
                                        copy.splice(index, 1);
                                        setModel({ ...model, keys: { ...model.keys, pinned: copy } });
                                    }
                                }
                        ].filter(Boolean);
                        const cells = [
                            <div key={fingerprint} title={fingerprint} className="flex flex-nowrap">
                                <KeyWarningIcon
                                    className="mr0-5 flex-item-noshrink"
                                    publicKey={publicKey}
                                    isExpired={isExpired}
                                    isRevoked={isRevoked}
                                    email={model.email}
                                />
                                <span className="flex-item-fluid ellipsis">{fingerprint}</span>
                            </div>,
                            isValid(creation) ? format(creation, 'PP', { locale: dateLocale }) : '-',
                            algo,
                            <React.Fragment key={fingerprint}>
                                {isPrimary && <Badge>{c('Key badge').t`Primary`}</Badge>}
                                {isTrusted && <Badge>{c('Key badge').t`Trusted`}</Badge>}
                                {isWKD && <Badge>{c('Key badge').t`WKD`}</Badge>}
                            </React.Fragment>,
                            <DropdownActions key={fingerprint} className="pm-button--small" list={list} />
                        ];
                        return <TableRow key={fingerprint} cells={cells} />;
                    }
                )}
            </TableBody>
        </Table>
    );
};

ContactKeysTable.propTypes = {
    model: PropTypes.object,
    setModel: PropTypes.func
};

export default ContactKeysTable;
