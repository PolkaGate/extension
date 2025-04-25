// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ColorSwatch, Eye, Folder, type Icon, KeySquare, ScanBarcode, UserOctagon } from 'iconsax-react';
import { useMemo } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

interface IconInfo {
  Icon: Icon;
  bgcolor?: string;
  color?: string
}

export default function useProfileInfo (label?: string | null): IconInfo {
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

      default:
        return {
          Icon: Folder,
          bgcolor: '#C6AECC26',
          color: '#AA83DC'
        };
    }
  }, [label]);
}
