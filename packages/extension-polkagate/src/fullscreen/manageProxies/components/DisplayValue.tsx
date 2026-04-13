// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { CanPayFee } from '../../../util/types';

import { Stack, Typography } from '@mui/material';
import React, { } from 'react';

import { DisplayBalance, Logo } from '../../../components';
import { UnableToPayFee } from '../../../partials';

interface Props {
  canPayFee?: CanPayFee;
  label: string;
  balance: BN | undefined | null;
  decimal: number | undefined;
  token: string | undefined;
}

function DisplayValue({ balance, canPayFee, decimal, label, token }: Props): React.ReactElement {
  return (
    <Stack direction='row' justifyContent='space-between'>
      <Typography color='#AA83DC' variant='B-1'>
        {label}
      </Typography>
      <Stack alignItems='center' columnGap={1} direction='row'>
        {canPayFee?.isAbleToPay === false && canPayFee?.warning &&
          <UnableToPayFee warningText={canPayFee.warning} />
        }
        <Logo size={18} token={token} />
        <DisplayBalance
          balance={balance}
          decimal={decimal}
          style={{ color: '#EAEBF1' }}
          token={token}
        />
      </Stack>
    </Stack>
  );
}

export default React.memo(DisplayValue);
