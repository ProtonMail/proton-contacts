import { normalize } from 'proton-shared/lib/helpers/string';

export const getEmails = ({ Emails = [] }) => Emails.map(({ Email = '' }) => normalize(Email)).filter(Boolean);

export const getName = ({ Name }) => Name;
