// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React from 'react';

import useValidatorDetails from '@polkadot/extension-polkagate/src/hooks/useValidatorDetails';

import { Motion } from '../../../../components';
import Nominators from './Nominators';
import Summary from './Summary';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

export default function ValidatorDetails ({ address, genesisHash }: Props): React.ReactElement {
  const details = useValidatorDetails(address, genesisHash);

  return (
    <Motion>
      <Stack direction='column' sx={{ width: '100%' }}>
        <Summary
          details={details}
          genesisHash={genesisHash}
        />
        <Nominators
          genesisHash={genesisHash}
          nominators={details?.nominators}
        />
      </Stack>
    </Motion>
  );
}
