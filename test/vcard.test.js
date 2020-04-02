import { parse } from 'proton-shared/lib/contacts/vcard';

const vcard = `BEGIN:VCARD
FN:edu
END:VCARD`;

describe('vcard', () => {
    it('should parse a vcard', () => {
        const [{ field, value }] = parse(vcard);
        expect(field).toBe('fn');
        expect(value).toBe('edu');
    });
});
