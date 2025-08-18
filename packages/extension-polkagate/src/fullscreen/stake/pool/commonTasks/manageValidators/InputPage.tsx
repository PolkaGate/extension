// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo, StakingConsts } from '@polkadot/extension-polkagate/src/util/types';
import type { BN } from '@polkadot/util';
import type { StakingInputs } from '../../../type';

import React, {  } from 'react';

interface Props {
  address: string | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<StakingInputs | undefined>>;
  inputs: StakingInputs | undefined;
  pool: MyPoolInfo | null | undefined;
  staked: BN | undefined;
  stakingConsts: StakingConsts | null | undefined;
}

export default function InputPage({ address, inputs, pool, setInputs, setStep, staked, stakingConsts }: Props): React.ReactElement {
  return (
   <></>
  );
}
