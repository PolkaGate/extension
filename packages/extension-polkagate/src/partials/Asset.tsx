// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows ..
 * */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { BalancesInfo } from '../util/types';

import { Grid, type SxProps, type Theme, useTheme } from '@mui/material';
import React from 'react';

import { ChainLogo } from '../components';
import { useChain, useTranslation } from '../hooks';
import BalanceFee from '../popup/send/partial/BalanceFee';

interface Props {
  address?: string;
  api: ApiPromise | undefined;
  balance?: BN | null;
  balances?: BalancesInfo | null | undefined;
  balanceLabel: string;
  balanceType?: string;
  fee: Balance | undefined;
  style?: SxProps<Theme> | undefined;
}

function Asset({ address, api, balance, balanceLabel, balanceType, balances, fee, style = { pt: '10px' } }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const chain = useChain(address);

  return (
    <Grid container item sx={style} xs={12}>
      <div style={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }}>
        {t('Asset')}
      </div>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ border: 1, borderColor: 'primary.light', borderRadius: '5px', background: `${theme.palette.background.paper}`, p: '5px 10px' }}>
        <Grid container item xs={1.5}>
          <ChainLogo genesisHash={chain?.genesisHash} size={31} />
        </Grid>
        <Grid container direction='column' item justifyContent='flex-start' sx={{ fontSize: '16px', fontWeight: 300 }} xs={5}>
          <Grid item width='fit-content'>
            {balanceLabel}
          </Grid>
          <Grid item width='fit-content'>
            {t('Fee')}
          </Grid>
        </Grid>
        <Grid container item justifyContent='flex-end' xs>
          <BalanceFee
            address={address}
            api={api}
            balance={balance}
            balances={balances}
            fee={fee}
            type={balanceType}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(Asset);
