import React, { ComponentProps } from 'react';
import { c } from 'ttag';

import { OrderableTableBody, OrderableTableRow, TableRow, DropdownActions } from 'react-components';
import { ContactFormatted } from 'proton-shared/lib/interfaces/contacts';

import NameTableCell from './NameTableCell';

interface Props extends Omit<ComponentProps<typeof OrderableTableBody>, 'colSpan'> {
    contacts: ContactFormatted[];
    highlightedID: string;
    isChecked: { [ID: string]: boolean };
    beDeleted: { [ID: string]: boolean };
    onClickCheckbox: (ID: string) => void;
    onClickDetails: (ID: string) => void;
    onToggleDelete: (ID: string) => void;
}

const MergeTableBody = ({
    contacts,
    highlightedID,
    isChecked,
    beDeleted,
    onClickCheckbox,
    onClickDetails,
    onToggleDelete,
    ...rest
}: Props) => {
    return (
        <OrderableTableBody colSpan={4} {...rest}>
            {contacts.map(({ ID, Name, emails }, j) => {
                const deleted = beDeleted[ID];
                const options = [
                    !deleted && {
                        text: c('Action').t`View`,
                        onClick() {
                            onClickDetails(ID);
                        },
                    },
                    {
                        text: deleted ? c('Action').t`Unmark for deletion` : c('Action').t`Mark for deletion`,
                        onClick() {
                            onToggleDelete(ID);
                        },
                    },
                ].filter(Boolean) as { text: string; onClick: () => void }[];
                const cells = [
                    <NameTableCell
                        key="name"
                        name={Name}
                        contactID={ID}
                        highlightedID={highlightedID}
                        checked={isChecked[ID]}
                        deleted={deleted}
                        greyedOut={deleted}
                        emails={emails}
                        onToggle={onClickCheckbox}
                    />,
                    <DropdownActions key="options" size="small" list={options} />,
                ];

                return deleted ? (
                    <TableRow key={`${ID}`} cells={[null, ...cells]} />
                ) : (
                    <OrderableTableRow key={`${ID}`} index={j} cells={cells} />
                );
            })}
        </OrderableTableBody>
    );
};

export default MergeTableBody;
