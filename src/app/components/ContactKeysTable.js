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
    const totalApiKeys = model.keys.api.length;

    /**
     * Extract keys info from model.keys to define table body
     */
    const parse = async () => {
        const allKeys = uniqueBy([...model.keys.api, ...model.keys.pinned], (publicKey) => publicKey.getFingerprint());
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
                    const isPrimary = !index && !isExpired && !(model.isPGPExternal && !model.encrypt);
                    const isWKD = model.isPGPExternal && index < totalApiKeys;
                    const isTrusted = index < totalApiKeys ? model.trustedFingerprints.includes(fingerprint) : true;
                    const isUploaded = index >= totalApiKeys;
                    const canBePrimary =
                        !!index && !isExpired && (index < totalApiKeys ? isTrusted : !totalApiKeys && model.encrypt);
                    const canBeTrusted = !isTrusted && !isUploaded;
                    const canBeUntrusted = isTrusted && !isUploaded;
                    return {
                        publicKey,
                        fingerprint,
                        algo,
                        creationTime,
                        isPrimary,
                        isWKD,
                        isExpired,
                        isRevoked,
                        isTrusted,
                        isUploaded,
                        canBePrimary,
                        canBeTrusted,
                        canBeUntrusted
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
    }, [model.keys, model.trustedFingerprints, model.encrypt]);

    return (
        <Table>
            <TableHeader cells={header} />
            <TableBody>
                {keys.map(
                    ({
                        fingerprint,
                        algo,
                        creationTime,
                        isPrimary,
                        isWKD,
                        publicKey,
                        isExpired,
                        isRevoked,
                        isTrusted,
                        isUploaded,
                        canBePrimary,
                        canBeTrusted,
                        canBeUntrusted
                    }) => {
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
                            canBePrimary && {
                                text: c('Action').t`Make primary`,
                                onClick() {
                                    const apiIndex = model.keys.api.findIndex(
                                        (key) => key.getFingerprint() === fingerprint
                                    );
                                    const pinnedIndex = model.keys.pinned.findIndex(
                                        (key) => key.getFingerprint() === fingerprint
                                    );
                                    const reOrderedApiKeys =
                                        apiIndex !== -1 ? move(model.keys.api, apiIndex, 0) : model.keys.api;
                                    const reOrderedPinnedKeys =
                                        pinnedIndex !== -1
                                            ? move(model.keys.pinned, pinnedIndex, 0)
                                            : model.keys.pinned;
                                    setModel({
                                        ...model,
                                        keys: { api: reOrderedApiKeys, pinned: reOrderedPinnedKeys }
                                    });
                                }
                            },
                            canBeTrusted && {
                                text: c('Action').t`Trust`,
                                onClick() {
                                    setModel({
                                        ...model,
                                        trustedFingerprints: [...model.trustedFingerprints, fingerprint]
                                    });
                                }
                            },
                            canBeUntrusted && {
                                text: c('Action').t`Untrust`,
                                onClick() {
                                    setModel({
                                        ...model,
                                        trustedFingerprints: model.trustedFingerprints.filter((f) => f !== fingerprint)
                                    });
                                }
                            },
                            isUploaded && {
                                text: c('Action').t`Remove`,
                                onClick() {
                                    setModel({
                                        ...model,
                                        keys: {
                                            ...model.keys,
                                            pinned: model.keys.pinned.filter(
                                                (publicKey) => publicKey.getFingerprint() !== fingerprint
                                            )
                                        }
                                    });
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
                                {isPrimary ? <Badge>{c('Key badge').t`Primary`}</Badge> : null}
                                {isWKD ? <Badge>{c('Key badge').t`WKD`}</Badge> : null}
                                {isTrusted ? <Badge>{c('Key badge').t`Trusted`}</Badge> : null}
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
