export const CONTACT_IMG_SIZE = 180; // size in px that we display in desktop view
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
export const PGP_INLINE = 'pgp-inline';
export const PGP_MIME = 'pgp-mime';
export const PGP_INLINE_TEXT = 'PGP/Inline';
export const PGP_MIME_TEXT = 'PGP/MIME';
export const PGP_SIGN = 1;

export const OVERWRITE = {
    // when UID conflict at contact import
    THROW_ERROR_IF_CONFLICT: 0,
    OVERWRITE_CONTACT: 1
};

export const CATEGORIES = {
    IGNORE: 0,
    INCLUDE: 1
};

// BACK-END DATA
export const API_SAFE_INTERVAL = 100; // API request limit: 100 requests / 10 seconds, so 1 request every 100 ms is safe
export const QUERY_EXPORT_MAX_PAGESIZE = 50; // in GET API route /contacts/export
// Manual limit on number of imported contacts to be sent to the API, so that the response does not take too long
export const ADD_CONTACTS_MAX_SIZE = 100;

// FRONT-END RESTRICTIONS
export const MAX_SIMULTANEOUS_CONTACTS_ENCRYPT = 5;

export const UNIX_TIME_WKD_ON = 1573509660;
