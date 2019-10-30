import React, { useState, useEffect } from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { useMailSettings, useLoading, Loader, Button } from 'react-components';
import { getInitial } from 'proton-shared/lib/helpers/string';
import { isURL } from 'proton-shared/lib/helpers/validators';
import { SHOW_IMAGES } from 'proton-shared/lib/constants';
import { resizeImage } from 'proton-shared/lib/helpers/image';

const ContactImageSummary = ({ photo, name }) => {
    const [showAnyways, setShowAnyways] = useState(!isURL(photo));
    const [src, setSrc] = useState(photo);
    const [{ ShowImages }, loadingMailSettings] = useMailSettings();
    const [loadingResize, withLoadingResize] = useLoading();
    const loading = loadingMailSettings && loadingResize;

    useEffect(() => {
        const resize = async () => {
            const resizedImage = await resizeImage({
                original: photo,
                maxWidth: 180,
                maxHeight: 180,
                smallResize: true
            });
            setSrc(resizedImage);
        };
        withLoadingResize(resize());
    }, [photo]);

    if (!photo) {
        return (
            <div className="rounded50 bordered bg-white ratio-container-square mb0">
                <span className="inner-ratio-container flex">
                    <span className="mauto color-global-border h1">{getInitial(name)}</span>
                </span>
            </div>
        );
    }

    const handleClick = () => setShowAnyways(true);

    if (ShowImages & SHOW_IMAGES.REMOTE || showAnyways) {
        if (loading) {
            return <Loader />;
        }

        const style = {
            backgroundImage: `url(${src})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        };

        return (
            <div className="rounded50 ratio-container-square" style={style}>
                <span className="inner-ratio-container"></span>
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
    photo: PropTypes.string,
    name: PropTypes.string
};

export default ContactImageSummary;
