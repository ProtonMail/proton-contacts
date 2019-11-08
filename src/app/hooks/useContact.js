import { useContext, useCallback } from 'react';
import { getContact } from 'proton-shared/lib/api/contacts';
import { useCachedModelResult, useApi } from 'react-components';

import ContactProviderContext from '../containers/ContactProviderContext';

const useContact = (contactID) => {
    const cache = useContext(ContactProviderContext);
    const api = useApi();

    const miss = useCallback(() => {
        return api(getContact(contactID)).then(({ Contact }) => Contact);
    }, []);

    return useCachedModelResult(cache, contactID, miss);
};

export default useContact;
