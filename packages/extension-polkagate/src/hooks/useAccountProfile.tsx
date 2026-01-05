// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { useMemo } from 'react';

import { PROFILE_TAGS } from '../util/constants';

/**
 * @description returns the profile of an account
 */
export default function useAccountProfile (account: AccountWithChildren | undefined) {
  return useMemo(() => {
    if (!account) {
      return '';
    }

    if (account.isHardware) {
      return PROFILE_TAGS.LEDGER;
    }

    if (!account.isExternal) {
      return PROFILE_TAGS.LOCAL;
    }

    if (account.isQR) {
      return PROFILE_TAGS.QR_ATTACHED;
    }

    if (account.isExternal) { // && !isQR && !isHardware
      return PROFILE_TAGS.WATCH_ONLY;
    }

    return account.profile;
  }, [account]);
}
