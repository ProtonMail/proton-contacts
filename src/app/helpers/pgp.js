import { RECIPIENT_TYPE, KEY_FLAGS } from 'proton-shared/lib/constants';

const { TYPE_INTERNAL } = RECIPIENT_TYPE;
const { ENABLE_ENCRYPTION } = KEY_FLAGS;

export const isInternalUser = ({ RecipientType }) => RecipientType === TYPE_INTERNAL;
export const isDisabledUser = (config) =>
    isInternalUser(config) && config.Keys.every(({ Flags }) => !(Flags & ENABLE_ENCRYPTION));
