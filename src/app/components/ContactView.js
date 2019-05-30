import React from 'react';
import PropTypes from 'prop-types';

const ContactView = ({ match }) => {
    return <div>ContactView {match.params.id}</div>;
};

ContactView.propTypes = {
    match: PropTypes.object
};

export default ContactView;
