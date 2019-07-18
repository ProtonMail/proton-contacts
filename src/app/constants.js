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

export const OVERWRITE = {
    // when UID conflict at contact import
    THROW_ERROR: 0,
    OVERWRITE_CONTACT: 1
};

export const CATEGORIES = {
    IGNORE: 0,
    INCLUDE: 1
};

export const SUCCESS_IMPORT_CODE = 1000; // in POST API route /contacts
