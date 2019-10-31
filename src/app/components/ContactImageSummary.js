import React, { useState, useEffect } from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { useMailSettings, useLoading, Loader, Button } from 'react-components';
import { getInitial } from 'proton-shared/lib/helpers/string';
import { isURL } from 'proton-shared/lib/helpers/validators';
import { resizeImage, toImage } from 'proton-shared/lib/helpers/image';
import { SHOW_IMAGES } from 'proton-shared/lib/constants';
import { CONTACT_IMG_SIZE } from '../constants';

const ContactImageSummary = ({ photo, name }) => {
    const [showAnyways, setShowAnyways] = useState(!isURL(photo));
    const [image, setImage] = useState({ src: photo });
    const [{ ShowImages }, loadingMailSettings] = useMailSettings();
    const [loadingResize, withLoadingResize] = useLoading();
    const loading = loadingMailSettings && loadingResize;

    useEffect(() => {
        const resize = async () => {
            const { width, height } = await toImage(photo);
            setImage((image) => ({ ...image, width, height }));

            if (width <= CONTACT_IMG_SIZE && height <= CONTACT_IMG_SIZE) {
                return setImage((image) => ({ ...image, isSmall: true }));
            }
            const resized = await resizeImage({
                original: photo,
                maxWidth: CONTACT_IMG_SIZE,
                maxHeight: CONTACT_IMG_SIZE,
                bigResize: true
            });
            setImage((image) => ({ ...image, src: resized }));
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
            backgroundImage: `url(${image.src})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        };

        if (!image.isSmall) {
            return (
                <div className="rounded50 ratio-container-square" style={style}>
                    <span className="inner-ratio-container" />
                </div>
            );
        }

        return (
            <div className="rounded50 ratio-container-square mb0">
                <span className="inner-ratio-container flex">
                    <div className="mbauto mtauto center" style={{ width: `${image.width}px` }}>
                        <div className="rounded50 ratio-container-square" style={style}>
                            <span className="inner-ratio-container" />
                        </div>
                    </div>
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
    photo: PropTypes.string,
    name: PropTypes.string
};

export default ContactImageSummary;
