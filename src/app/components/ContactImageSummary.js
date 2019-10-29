import React, { useState } from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { useMailSettings, Button } from 'react-components';
import { getInitial } from 'proton-shared/lib/helpers/string';
import { isURL } from 'proton-shared/lib/helpers/validators';
import { SHOW_IMAGES } from 'proton-shared/lib/constants';

const ContactImageSummary = ({ src, name }) => {
    const [{ ShowImages }, loading] = useMailSettings();
    const [showAnyways, setShowAnyways] = useState(!isURL(src));

    if (!src) {
        return (
            <div className="rounded50 bordered bg-white ratio-container-square mb0">
                <span className="inner-ratio-container flex">
                    <span className="mauto color-global-border h1">{getInitial(name)}</span>
                </span>
            </div>
        );
    }

    const handleClick = () => setShowAnyways(true);

    if ((!loading && ShowImages & SHOW_IMAGES.REMOTE) || showAnyways) {
        return (
            <div className="rounded50 ratio-container-square">
                <span className="inner-ratio-container">
                    <img src={src} className="rounded50 h100 w100" />
                </span>
            </div>
        );
    }

    return (
        <div className="rounded50 bordered bg-white ratio-container-square mb0">
            <span className="inner-ratio-container flex">
                <span className="mauto color-global-border">
                    <Button onClick={handleClick}>{c('Action').t`Load photo`}</Button>
                </span>
            </span>
        </div>
    );
};
ContactImageSummary.propTypes = {
    src: PropTypes.string,
    name: PropTypes.string
};

export default ContactImageSummary;
