import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { getKeys } from 'pmcrypto';
import moment from 'moment';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';
import { describe } from 'proton-shared/lib/keys/keysAlgorithm';
import { Table, TableHeader, TableBody, TableRow, Badge, DropdownActions } from 'react-components';

const ContactKeysTable = ({ email, publicKeys, onRemove, onMakePrimary }) => {
    const [keys, setKeys] = useState([]); // Store parsed keys
    const header = [
        c('Table header').t`Fingerprint`,
        c('Table header').t`Created`,
        c('Table header').t`Expires`,
        c('Table header').t`Type`,
        c('Table header').t`Status`,
        c('Table header').t`Actions`
    ];

    const parse = async () => {
        const parsedKeys = await Promise.all(
            publicKeys.map(async (key, index) => {
                try {
                    const [publicKey] = await getKeys(key);
                    const algoInfo = publicKey.getAlgorithmInfo();
                    const algo = describe(algoInfo);
                    const fingerprint = publicKey.getFingerprint();
                    const creationTime = publicKey.getCreationTime();
                    const expirationTime = publicKey.getExpirationTime('encrypt');
                    const isPrimary = !index;
                    return { key, publicKey, fingerprint, algo, creationTime, expirationTime, isPrimary };
                } catch (error) {
                    return false;
                }
            })
        );
        setKeys(parsedKeys.filter(Boolean));
    };

    useEffect(() => {
        parse();
    }, [publicKeys]);

    return (
        <Table>
            <TableHeader cells={header} />
            <TableBody>
                {keys.map(({ fingerprint, algo, creationTime, expirationTime, isPrimary, publicKey }, index) => {
                    const creation = moment(creationTime);
                    const expiration = moment(expirationTime);
                    const list = [
                        {
                            text: c('Action').t`Download`,
                            async onClick() {
                                const blob = new Blob([publicKey.armor()], { type: 'data:text/plain;charset=utf-8;' });
                                const filename = `publickey - ${email} - 0x${fingerprint
                                    .slice(0, 8)
                                    .toUpperCase()}.asc`;

                                downloadFile(blob, filename);
                            }
                        },
                        index > 0 && {
                            text: c('Action').t`Make primary`,
                            onClick() {
                                onMakePrimary(index);
                            }
                        },
                        {
                            text: c('Action').t`Remove`,
                            onClick() {
                                onRemove(index);
                            }
                        }
                    ].filter(Boolean);
                    const cells = [
                        <div key={fingerprint} className="flex" title={fingerprint}>
                            <span className="ellipsis">{fingerprint}</span>
                        </div>,
                        creation.isValid() ? creation.format('ll') : '-',
                        expiration.isValid() ? expiration.format('ll') : '-',
                        algo,
                        isPrimary ? <Badge key={fingerprint}>{c('Key badge').t`Primary`}</Badge> : null,
                        <DropdownActions key={fingerprint} className="pm-button--small" list={list} />
                    ];
                    return <TableRow key={fingerprint} cells={cells} />;
                })}
            </TableBody>
        </Table>
    );
};

ContactKeysTable.propTypes = {
    publicKeys: PropTypes.array,
    onRemove: PropTypes.func,
    onMakePrimary: PropTypes.func,
    email: PropTypes.string
};

export default ContactKeysTable;
