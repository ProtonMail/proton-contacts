export const CONTACT_IMG_SIZE = 128;
export const POST_BOX = 0;
export const EXTENDED = 1;
export const STREET = 2;
export const LOCALITY = 3;
export const REGION = 4;
export const POSTAL_CODE = 5;
export const COUNTRY = 6;

// List of fields display in the bottom section for contact view
export const OTHER_INFORMATION_FIELDS = [
    'bday',
    'anniversary',
    'gender',
    'lang',
    'tz',
    'geo',
    'title',
    'role',
    'photo',
    'logo',
    'org',
    'member',
    'note',
    'url'
];

export const VCARD_KEY_FIELDS = ['key', 'x-pm-mimetype', 'x-pm-encrypt', 'x-pm-sign', 'x-pm-scheme', 'x-pm-tls'];
export const CLEAR_FIELDS = ['version', 'prodid', 'categories'];
export const SIGNED_FIELDS = ['version', 'prodid', 'fn', 'uid', 'email'].concat(VCARD_KEY_FIELDS);

export const SIGNATURE_NOT_VERIFIED = 1;
export const FAIL_TO_READ = 2;
export const FAIL_TO_LOAD = 3;
export const FAIL_TO_DECRYPT = 4;
export const PGP_INLINE = 'PGP/Inline';
export const PGP_MIME = 'PGP/MIME';

// Import steps are numbered according to the order in which they can appear
export const IMPORT_STEPS = {
    ATTACHING: 1,
    ATTACHED: 2,
    CHECKING_CSV: 3,
    IMPORTING: 4,
    IMPORT_GROUPS: 5
};

export const CUSTOMIZABLE_VCARD_FIELDS = [
    'fn',
    'n',
    'nickname',
    'photo',
    'bday',
    'anniversary',
    'gender',
    'adr',
    'tel',
    'email',
    'impp',
    'lang',
    'tz',
    'geo',
    'title',
    'role',
    'logo',
    'org',
    'member',
    'related',
    'categories',
    'note',
    'prodid',
    'rev',
    'sound',
    'uid',
    'clientpidmap',
    'url',
    'version',
    'key',
    'fburl',
    'caladruri',
    'caluri'
];

export const CUSTOMIZABLE_VCARD_TYPES = {
    // the empty string denotes no type available
    fn: ['Main', 'Yomi'],
    n: [''],
    nickname: [''],
    photo: [''],
    bday: [''],
    anniversary: [''],
    gender: [''],
    adr: ['Home', 'Work', 'Other'],
    tel: ['Phone', 'Home', 'Work', 'Other', 'Mobile', 'Main', 'Fax'],
    email: ['Home', 'Work', 'Other'],
    impp: [''],
    lang: [''],
    tz: [''],
    geo: [''],
    title: [''],
    role: [''],
    logo: [''],
    org: [''],
    member: [''],
    related: [''],
    categories: [''],
    note: [''],
    prodid: [''],
    rev: [''],
    sound: [''],
    uid: [''],
    clientpidmap: [''],
    url: [''],
    version: [''],
    key: [''],
    fburl: [''],
    caladruri: [''],
    caluri: ['']
};
