import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableRow, Badge, DropdownActions, useActiveBreakpoint, classnames } from 'react-components';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { isValid, format } from 'date-fns';

import { move, uniqueBy } from 'proton-shared/lib/helpers/array';
import { dateLocale } from 'proton-shared/lib/i18n';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';
import { describe } from 'proton-shared/lib/keys/keysAlgorithm';

import KeyWarningIcon from './KeyWarningIcon';

const ContactKeysTable = ({ model, setModel }) => {
    const [keys, setKeys] = useState([]);
    const { isNarrow, isTinyMobile } = useActiveBreakpoint();

    const totalApiKeys = model.keys.api.length;

    /**
     * Extract keys info from model.keys to define table body
     */
    const parse = async () => {
        const allKeys = model.isPGPInternal ? [...model.keys.api] : [...model.keys.api, ...model.keys.pinned];
        const uniqueKeys = uniqueBy(allKeys, (publicKey) => publicKey.getFingerprint());
        const parsedKeys = await Promise.all(
            uniqueKeys.map(async (publicKey, index) => {
                try {
                    const fingerprint = publicKey.getFingerprint();
                    const creationTime = publicKey.getCreationTime();
                    const expirationTime = await publicKey.getExpirationTime('encrypt');
                    const algoInfo = publicKey.getAlgorithmInfo();
                    const algo = describe(algoInfo);
                    const isTrusted = model.trustedFingerprints.has(fingerprint);
                    const isExpired = model.expiredFingerprints.has(fingerprint);
                    const isRevoked = model.revokedFingerprints.has(fingerprint);
                    const isVerificationOnly = model.verifyOnlyFingerprints.has(fingerprint);
                    const isActive =
                        !index &&
                        !isExpired &&
                        !isRevoked &&
                        !isVerificationOnly &&
                        (totalApiKeys ? true : model.encrypt);
                    const isWKD = model.isPGPExternal && index < totalApiKeys;
                    const isUploaded = index >= totalApiKeys;
                    const canBeActive =
                        !!index &&
                        !isExpired &&
                        !isRevoked &&
                        !isVerificationOnly &&
                        (index < totalApiKeys ? isTrusted : !totalApiKeys && model.encrypt);
                    const canBeTrusted = !isTrusted && !isUploaded;
                    const canBeUntrusted = isTrusted && !isUploaded;
                    return {
                        publicKey,
                        fingerprint,
                        algo,
                        creationTime,
                        expirationTime,
                        isActive,
                        isWKD,
                        isExpired,
                        isRevoked,
                        isTrusted,
                        isVerificationOnly,
                        isUploaded,
                        canBeActive,
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
        <Table className="pm-simple-table--has-actions">
            <thead>
                <tr>
                    <th scope="col" className="ellipsis">{c('Table header').t`Fingerprint`}</th>
                    {!isNarrow && <th scope="col" className="ellipsis">{c('Table header').t`Created`}</th>}
                    {!isTinyMobile && <th scope="col" className="ellipsis">{c('Table header').t`Expires`}</th>}
                    {!isNarrow && <th scope="col" className="ellipsis">{c('Table header').t`Type`}</th>}
                    <th scope="col" className="ellipsis">{c('Table header').t`Status`}</th>
                    <th scope="col" className={classnames(['ellipsis', isNarrow && 'w40'])}>{c('Table header')
                        .t`Actions`}</th>
                </tr>
            </thead>
            <TableBody>
                {keys.map(
                    ({
                        fingerprint,
                        algo,
                        creationTime,
                        expirationTime,
                        isActive,
                        isWKD,
                        publicKey,
                        isExpired,
                        isRevoked,
                        isTrusted,
                        isVerificationOnly,
                        isUploaded,
                        canBeActive,
                        canBeTrusted,
                        canBeUntrusted
                    }) => {
                        const creation = new Date(creationTime);
                        const expiration = new Date(expirationTime);
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
                            canBeActive && {
                                text: c('Action').t`Use for sending`,
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
                                    const trustedFingerprints = new Set(model.trustedFingerprints);
                                    trustedFingerprints.add(fingerprint);
                                    setModel({ ...model, trustedFingerprints });
                                }
                            },
                            canBeUntrusted && {
                                text: c('Action').t`Untrust`,
                                onClick() {
                                    const trustedFingerprints = new Set(model.trustedFingerprints);
                                    trustedFingerprints.delete(fingerprint);
                                    setModel({ ...model, trustedFingerprints });
                                }
                            },
                            isUploaded && {
                                text: c('Action').t`Remove`,
                                onClick() {
                                    const trustedFingerprints = new Set(model.trustedFingerprints);
                                    const expiredFingerprints = new Set(model.expiredFingerprints);
                                    const revokedFingerprints = new Set(model.revokedFingerprints);
                                    trustedFingerprints.delete(fingerprint);
                                    expiredFingerprints.delete(fingerprint);
                                    revokedFingerprints.delete(fingerprint);
                                    setModel({
                                        ...model,
                                        trustedFingerprints,
                                        expiredFingerprints,
                                        revokedFingerprints,
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
                                    email={model.email}
                                />
                                <span className="flex-item-fluid ellipsis">{fingerprint}</span>
                            </div>,
                            !isNarrow && (isValid(creation) ? format(creation, 'PP', { locale: dateLocale }) : '-'),
                            !isTinyMobile &&
                                (isValid(expiration) ? format(expiration, 'PP', { locale: dateLocale }) : '-'),
                            !isNarrow && algo,
                            <React.Fragment key={fingerprint}>
                                {isActive ? <Badge>{c('Key badge').t`Active`}</Badge> : null}
                                {isVerificationOnly ? (
                                    <Badge type="warning">{c('Key badge').t`Verification only`}</Badge>
                                ) : null}
                                {isWKD ? <Badge>{c('Key badge').t`WKD`}</Badge> : null}
                                {isTrusted ? <Badge>{c('Key badge').t`Trusted`}</Badge> : null}
                                {isRevoked ? <Badge type="error">{c('Key badge').t`Revoked`}</Badge> : null}
                                {isExpired ? <Badge type="error">{c('Key badge').t`Expired`}</Badge> : null}
                            </React.Fragment>,
                            <DropdownActions key={fingerprint} className="pm-button--small" list={list} />
                        ].filter(Boolean);
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
