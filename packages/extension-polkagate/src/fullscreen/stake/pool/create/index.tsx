// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { StakingInputs } from '../../type';

import React, {  } from 'react';



interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<StakingInputs | undefined>>;
  inputs: StakingInputs | undefined;
}

export default function CreatePool({ inputs, setInputs, setStep }: Props): React.ReactElement {

  return (
  
<></>  );
}
