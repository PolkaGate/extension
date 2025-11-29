// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { Balance, Call, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { AnyJson } from '@polkadot/types-codec/types';

export const CMD_MORTAL = 2;
export const CMD_SIGN_MESSAGE = 3;

export enum SIGN_POPUP_MODE {
  REQUEST,
  DETAIL,
  RAW_DATA,
  SIGN,
  QR
}

export interface ModeData {
  type: SIGN_POPUP_MODE;
  data?: Call | null;
  title: string;
  fee?: Balance | null;
  Icon?: Icon
}

export interface Data {
  hexBytes: string | null;
  payload: ExtrinsicPayload | null;
}

export interface Decoded {
  args: AnyJson | null;
  method: Call | null;
}