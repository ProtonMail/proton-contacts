import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { ConfirmModal, Alert } from 'react-components';
import { redirectTo } from 'proton-shared/lib/helpers/browser';

const UpgradeModal = ({ onConfirm, onClose }) => {
    return (
        <ConfirmModal
            title={c('Title').t`Upgrade required`}
            onConfirm={() => {
                redirectTo('/settings/subscription');
                onConfirm && onConfirm();
            }}
            onClose={onClose}
            confirm={c('Action').t`Upgrade`}
        >
            <Alert type="warning">{c('Warning').t`This feature requires a paid Proton account`}</Alert>
        </ConfirmModal>
    );
};

UpgradeModal.propTypes = {
    onConfirm: PropTypes.func,
    onClose: PropTypes.func
};

export default UpgradeModal;
