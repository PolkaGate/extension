// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Book, ColorSwatch, Data2, Eye, Folder, type Icon, KeySquare, ScanBarcode, UserOctagon } from 'iconsax-react';
import { useMemo } from 'react';

import { ADDRESS_BOOK_LABEL } from '@polkadot/extension-polkagate/src/hooks/useCategorizedAccountsInProfiles';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

import { PROXIED_PROFILE_LABEL } from '../settings/importProxied/ProxiedAccount';

interface IconInfo {
  Icon: Icon;
  bgcolor?: string;
  color?: string
}

export default function useProfileInfo(label?: string | null): IconInfo {
  return useMemo(() => {
    switch (label) {
      case PROFILE_TAGS.ALL:
        return {
          Icon: UserOctagon
        };
      case PROFILE_TAGS.LOCAL:
        return {
          Icon: KeySquare,
          bgcolor: '#5FBFD526',
          color: '#5FBFD5'
        };
      case PROFILE_TAGS.LEDGER:
        return {
          Icon: ColorSwatch,
          bgcolor: '#A7DFB726',
          color: '#A7DFB7'
        };
      case PROFILE_TAGS.WATCH_ONLY:
        return {
          Icon: Eye,
          bgcolor: '#97949B26',
          color: '#97949B'
        };
      case PROFILE_TAGS.QR_ATTACHED:
        return {
          Icon: ScanBarcode,
          bgcolor: '#3988FF26',
          color: '#3988FF'
        };
      case ADDRESS_BOOK_LABEL:
        return {
          Icon: Book,
          bgcolor: '#74687626',
          color: '#746876'
        };

      case PROXIED_PROFILE_LABEL:
        return {
          Icon: Data2,
          bgcolor: '#ff398826',
          color: '#ff3988'
        };

      default:
        return {
          Icon: Folder,
          bgcolor: '#C6AECC26',
          color: '#AA83DC'
        };
    }
  }, [label]);
}
