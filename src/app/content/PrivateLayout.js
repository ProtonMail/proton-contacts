import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDelinquent } from 'react-components';

const PrivateLayout = ({ children, title }) => {
    useDelinquent();

    useEffect(() => {
        document.title = `${title} - ProtonContacts`;
    }, [title]);

    return (
        <div className="flex flex-nowrap no-scroll">
            <div className="content flex-item-fluid h100v reset4print">{children}</div>
        </div>
    );
};

PrivateLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string
};

export default PrivateLayout;
