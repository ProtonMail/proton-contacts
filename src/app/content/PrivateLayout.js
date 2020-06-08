import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { TopBanners } from 'react-components';

const PrivateLayout = ({ children, title }) => {
    useEffect(() => {
        document.title = `${title} - ProtonContacts`;
    }, [title]);

    return (
        <div className="flex flex-column flex-nowrap no-scroll">
            <TopBanners />
            <div className="content flex-item-fluid-auto reset4print">{children}</div>
        </div>
    );
};

PrivateLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string
};

export default PrivateLayout;
