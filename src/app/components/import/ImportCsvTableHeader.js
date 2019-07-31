import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { TableCell, Button, Icon } from 'react-components';

const ImportCsvTableHeader = ({ disabledPrevious, disabledNext, onPrevious, onNext, ...rest }) => {
    return (
        <thead {...rest}>
            <tr>
                <TableCell type="header" className="w15 aligncenter">
                    {c('TableHeader').t`IMPORT`}
                </TableCell>
                <TableCell type="header" className="aligncenter">{c('TableHeader').t`CSV FIELD`}</TableCell>
                <TableCell type="header">{c('TableHeader').t`VCARD FIELD`}</TableCell>
                <TableCell type="header">
                    <span className="mr0-5">{c('TableHeader').t`VALUES`}</span>
                    <span>
                        <Button
                            disabled={disabledPrevious}
                            icon={<Icon name="caret" className="flex-item-noshrink rotateZ-90" />}
                            onClick={onPrevious}
                        />
                        <Button
                            disabled={disabledNext}
                            icon={<Icon name="caret" className="flex-item-noshrink rotateZ-270" />}
                            onClick={onNext}
                        />
                    </span>
                </TableCell>
            </tr>
        </thead>
    );
};

ImportCsvTableHeader.propTypes = {
    disabledPrevious: PropTypes.bool,
    disabledNext: PropTypes.bool,
    onPrevious: PropTypes.func,
    onNext: PropTypes.func
};

ImportCsvTableHeader.defaultPropTypes = {
    disabledPrevious: true,
    disabledNext: true
};

export default ImportCsvTableHeader;
