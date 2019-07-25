import { useContext } from 'react';
import { getContact } from 'proton-shared/lib/api/contacts';
import { useCachedModelResult, useApi } from 'react-components';

import ContactProviderContext from '../containers/ContactProviderContext';

const useContact = (contactID) => {
    const cache = useContext(ContactProviderContext);
    const api = useApi();

    return useCachedModelResult(cache, contactID, () => {
        return api(getContact(contactID)).then(({ Contact }) => Contact);
    });
};

export default useContact;
