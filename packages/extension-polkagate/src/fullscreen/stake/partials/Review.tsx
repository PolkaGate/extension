// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


/**
 * @description
 * this component opens review page
 * */

import type { TxInfo } from '../../../util/types';
import type { StakingInputs } from '../type';

import React, {  } from 'react';

interface Props {
  address: string | undefined;
  step: number;
  inputs: StakingInputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  onClose?: () => void
}

export default function Review({ address, inputs, onClose, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
  return (
<></>
  );
}
