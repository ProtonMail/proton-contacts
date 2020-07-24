// BACK-END DATA
import { BASE_SIZE } from 'proton-shared/lib/constants';

export const API_SAFE_INTERVAL = 100; // API request limit: 100 requests / 10 seconds, so 1 request every 100 ms is safe
export const QUERY_EXPORT_MAX_PAGESIZE = 50; // in GET API route /contacts/export
// Manual limit on number of imported contacts to be sent to the API, so that the response does not take too long
export const ADD_CONTACTS_MAX_SIZE = 100;

// FRONT-END RESTRICTIONS
export const MAX_SIMULTANEOUS_CONTACTS_ENCRYPT = 5;

export const MAX_IMPORT_CONTACTS = 10000;
export const MAX_IMPORT_CONTACTS_STRING = "10'000";
export const MAX_IMPORT_FILE_SIZE = 10 * BASE_SIZE ** 2;
export const MAX_IMPORT_FILE_SIZE_STRING = '10 MB';
export const MAX_UID_CHARS_DISPLAY = 43;
export const MAX_FILENAME_CHARS_DISPLAY = 100;
