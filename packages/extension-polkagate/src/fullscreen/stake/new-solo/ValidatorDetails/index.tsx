// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraInfo } from '@polkadot/extension-polkagate/src/hooks/useSoloStakingInfo';

import { Stack } from '@mui/material';
import React from 'react';

import useValidatorDetails from '@polkadot/extension-polkagate/src/hooks/useValidatorDetails';

import { Motion } from '../../../../components';
import Nominators from './Nominators';
import Summary from './Summary';

interface Props {
  address: string | undefined;
  eraInfo: EraInfo | undefined;
  genesisHash: string | undefined;
}

export default function ValidatorDetails({ address, eraInfo, genesisHash }: Props): React.ReactElement {
  const details = useValidatorDetails(address, genesisHash);

  return (
    <Motion>
      <Stack direction='column' sx={{ width: '100%' }}>
        <Summary
          details={details}
          eraInfo={eraInfo}
          genesisHash={genesisHash}
        />
        <Nominators
          genesisHash={genesisHash}
          nominators={details?.nominators}
          total={details?.total}
        />
      </Stack>
    </Motion>
  );
}
