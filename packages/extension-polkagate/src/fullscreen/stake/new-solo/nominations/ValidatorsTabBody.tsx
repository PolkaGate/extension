// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SoloStakingInfo } from '../../../../hooks/useSoloStakingInfo';

import React from 'react';
import { useParams } from 'react-router-dom';

import { Motion } from '../../../../components';
import ValidatorDetails from '../ValidatorDetails';
import Nominations from './Nominations';

interface Props {
  stakingInfo: SoloStakingInfo | undefined;
}

export default function ValidatorsTabBody ({ stakingInfo }: Props): React.ReactElement {
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();

  return (
    <Motion variant='slide'>
      {stakingInfo?.isValidator
        ? <ValidatorDetails
          address={address}
          genesisHash={genesisHash}
          />
        : <Nominations
          address={address}
          genesisHash={genesisHash}
          stakingInfo={stakingInfo}
          />}
    </Motion>
  );
}
