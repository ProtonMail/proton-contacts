import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { useInstance, useEventManager } from 'react-components';
import createCache from 'proton-shared/lib/helpers/cache';
import createLRU from 'proton-shared/lib/helpers/lru';
import { EVENT_ACTIONS } from 'proton-shared/lib/constants';
import { STATUS } from 'proton-shared/lib/models/cache';

import ContactProviderContext from './ContactProviderContext';

/**
 * The purpose of this provider is to synchronize individual contact fetches with updates from the event manager,
 * and to have a separate LRU cache for it.
 */
const ContactProvider = ({ children }) => {
    const { subscribe } = useEventManager();
    const cache = useInstance(() => {
        return createCache(createLRU({ max: 10 }));
    });

    useLayoutEffect(() => {
        return subscribe(({ Contacts }) => {
            if (!Array.isArray(Contacts)) {
                return;
            }
            for (const { ID, Action, Contact } of Contacts) {
                // Ignore updates for non-fetched contacts.
                if (!cache.has(ID)) {
                    continue;
                }
                if (Action === EVENT_ACTIONS.DELETE) {
                    cache.delete(ID);
                }
                if (Action === EVENT_ACTIONS.UPDATE) {
                    // The contact is always received in full, so we can ignore if the contact would be currently fetching (to merge the old data)
                    cache.set(ID, { value: Contact, status: STATUS.RESOLVED });
                }
            }
        });
    }, []);

    return <ContactProviderContext.Provider value={cache}>{children}</ContactProviderContext.Provider>;
};

ContactProvider.propTypes = {
    children: PropTypes.node
};

export default ContactProvider;
