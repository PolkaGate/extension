// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { BN } from '@polkadot/util';
import type { StakingConsts, TxInfo } from '../../../../../util/types';
import type { StakingInputs } from '../../../type';

import React, {  } from 'react';

interface Props {
  address: string | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  inputs: StakingInputs;
  step: number;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  staked: BN | undefined;
  stakingConsts: StakingConsts | null | undefined;
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined;
}

export default function Review({ address, allValidatorsIdentities, inputs, setStep, setTxInfo, staked, stakingConsts, step }: Props): React.ReactElement {
  return (
    <></>
  );
}
