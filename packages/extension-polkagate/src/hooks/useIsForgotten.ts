// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ForgottenInfo } from '../popup/passwordManagement/types';

import { useEffect, useState } from 'react';

import { getStorage, watchStorage } from '../util';
import { STORAGE_KEY } from '../util/constants';

export default function useIsForgotten (): ForgottenInfo | undefined | null {
   const [isForgotten, setIsForgotten] = useState<ForgottenInfo | null>();

     useEffect(() => {
         watchStorage(STORAGE_KEY.IS_FORGOTTEN, setIsForgotten);
         getStorage(STORAGE_KEY.IS_FORGOTTEN).then((state) => setIsForgotten(state as ForgottenInfo ?? null)).catch(console.error);
     }, []);

     return isForgotten;
}
