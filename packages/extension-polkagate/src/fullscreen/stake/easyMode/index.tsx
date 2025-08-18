// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BalancesInfo } from '../../../util/types';
import type { StakingInputs } from '../type';

import React, {  } from 'react';



interface Props {
  address: string | undefined;
  balances: BalancesInfo | undefined;
  inputs: StakingInputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<StakingInputs | undefined>>
}

export default function EasyMode ({ address, balances, inputs, setInputs, setStep }: Props): React.ReactElement {


  return (
<></>
  );
}
