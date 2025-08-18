// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


/**
 * @description
 * this component opens unlock review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { BN } from '@polkadot/util';
import type { Lock } from '../../../hooks/useAccountLocks';

import React, {  } from 'react';



interface Props {
  address: string | undefined;
  api: ApiPromise;
  classToUnlock: Lock[] | undefined
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  totalLocked: BN | null | undefined;
  unlockableAmount: BN | undefined;
}

export default function Review({ address, api, classToUnlock, setDisplayPopup, setRefresh, show, totalLocked, unlockableAmount }: Props): React.ReactElement {
  return (
    <></>
  );
}
