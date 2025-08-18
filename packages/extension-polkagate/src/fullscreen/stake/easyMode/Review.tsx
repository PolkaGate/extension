// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { BalancesInfo, TxInfo } from '../../../util/types';
import type { StakingInputs } from '../type';

import React, {  } from 'react';



interface Props {
  address: string | undefined;
  balances: BalancesInfo | undefined;
  inputs: StakingInputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>
}

export default function Review({ address, balances, inputs, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {

  
  return (
  <></>
  );
}
