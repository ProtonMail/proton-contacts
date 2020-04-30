import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { AppsSidebar, StorageSpaceStatus, Href, useDelinquent } from 'react-components';
import { c } from 'ttag';

const PrivateLayout = ({ children, title }) => {
    useDelinquent();

    useEffect(() => {
        document.title = `${title} - ProtonContacts`;
    }, [title]);

    return (
        <div className="flex flex-nowrap no-scroll">
            <AppsSidebar
                items={[
                    <StorageSpaceStatus
                        key="storage"
                        upgradeButton={
                            <Href url="/settings/subscription" target="_self" className="pm-button pm-button--primary">
                                {c('Action').t`Upgrade`}
                            </Href>
                        }
                    />
                ]}
            />
            <div className="content flex-item-fluid h100v reset4print">{children}</div>
        </div>
    );
};

PrivateLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string
};

export default PrivateLayout;
