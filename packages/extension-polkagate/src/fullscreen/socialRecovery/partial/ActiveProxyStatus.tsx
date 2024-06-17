// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { Progress, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import type { WithdrawInfo } from '../util/types';

interface Props {
  api: ApiPromise | undefined;
  style?: SxProps<Theme> | undefined;
  withdrawInfo: WithdrawInfo | undefined;
}

export default function ActiveProxyStatus({ api, style, withdrawInfo }: Props): React.ReactElement {
  const { t } = useTranslation();

  const assets: { label: string; amount: BN | Balance }[] = [];

  withdrawInfo?.availableBalance && !withdrawInfo?.availableBalance.isZero() && assets.push({ amount: withdrawInfo.availableBalance, label: 'Transferable' });
  withdrawInfo?.reserved && !withdrawInfo?.reserved.isZero() && assets.push({ amount: withdrawInfo.reserved, label: 'Reserved' });
  withdrawInfo?.soloStaked && !withdrawInfo?.soloStaked.isZero() && assets.push({ amount: withdrawInfo.soloStaked, label: 'Solo Stake' });
  withdrawInfo?.poolStaked && !withdrawInfo?.poolStaked.amount.isZero() && assets.push({ amount: withdrawInfo.poolStaked.amount, label: 'Pool Stake' });
  withdrawInfo?.redeemable && !withdrawInfo?.redeemable.amount.isZero() && assets.push({ amount: withdrawInfo.redeemable.amount, label: 'Staking Redeemable' });
  withdrawInfo?.poolRedeemable && !withdrawInfo?.poolRedeemable.amount.isZero() && assets.push({ amount: withdrawInfo.poolRedeemable.amount, label: 'Pool Redeemable' });
  withdrawInfo?.soloUnlock && !withdrawInfo?.soloUnlock.amount.isZero() && assets.push({ amount: withdrawInfo.soloUnlock.amount, label: 'Solo Unstaking' });
  withdrawInfo?.poolUnlock && !withdrawInfo?.poolUnlock.amount.isZero() && assets.push({ amount: withdrawInfo.poolUnlock.amount, label: 'Pool Unstaking' });

  return (
    <Grid container direction='column' item sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', display: 'block', mt: '20px', p: '20px', ...style }}>
      {!withdrawInfo
        ? <Progress pt='0px' size={100} title={t('Checking the lost account information...')} />
        : <Grid container item sx={{ '> div:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' } }}>
          {assets.map((item, index) => (
            <Grid container item justifyContent='space-between' key={index} sx={{ fontSize: '18px', fontWeight: 500, p: '8px' }}>
              <Typography fontSize='18px' fontWeight={400}>
                {t<string>(item.label)}
              </Typography>
              <ShowBalance
                api={api}
                balance={item.amount}
                decimalPoint={4}
              />
            </Grid>))}
        </Grid>
      }
    </Grid>
  );
}
