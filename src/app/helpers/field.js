import { c } from 'ttag';

export const getLabels = () => ({
    work: c('Label').t`Work`,
    home: c('Label').t`Personal`,
    cell: c('Label').t`Mobile`,
    email: c('Label').t`Email`,
    photo: c('Label').t`Photo`,
    org: c('Label').t`Organization`,
    tel: c('Label').t`Phone`,
    adr: c('Label').t`Address`,
    bday: c('Label').t`Birthday`,
    anniversary: c('Label').t`Anniversary`,
    title: c('Label').t`Title`,
    role: c('Label').t`Role`,
    note: c('Label').t`Note`,
    fn: c('Label').t`Name`,
    url: c('Label').t`URL`,
    gender: c('Label').t`Gender`,
    lang: c('Label').t`Language`,
    tz: c('Label').t`Timezone`,
    geo: c('Label').t`Geo`,
    logo: c('Label').t`Logo`,
    member: c('Label').t`Member`,
    impp: c('Label').t`IMPP`,
    related: c('Label').t`Related`,
    categories: c('Label').t`Categories`,
    sound: c('Label').t`Sound`
});

export const getIcons = () => ({
    email: 'email',
    org: 'organization',
    tel: 'phone',
    adr: 'address',
    bday: 'birthday',
    anniversary: 'anniversary',
    title: 'title',
    role: 'role',
    note: 'note',
    url: 'domains',
    gender: 'gender',
    lang: 'alias', // TODO icon missing
    tz: 'alias', // TODO icon missing
    geo: 'domains',
    logo: 'photo',
    member: 'member-contact'
});
