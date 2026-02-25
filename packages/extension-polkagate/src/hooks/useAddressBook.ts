// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Contact } from '../fullscreen/settings/addressBook';

import { useEffect, useState } from 'react';

import { getAndWatchStorage } from '../util';
import { STORAGE_KEY } from '../util/constants';

export default function useAddressBook() {
    const [contacts, setContacts] = useState<Contact[] | undefined>();

    useEffect(() => {
       return getAndWatchStorage(STORAGE_KEY.ADDRESS_BOOK, setContacts, undefined, []);
    }, []);

    return contacts;
}
