// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxInfo } from '../../util/types';

import React, {  } from 'react';


interface Props {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  onBack?: () => void;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  txInfo: TxInfo | undefined
}

function Entry({ onBack, setStep, setTxInfo, step, txInfo }: Props): React.ReactElement {

     return (
       <></>
  );
}

export default React.memo(Entry);
