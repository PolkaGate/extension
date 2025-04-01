// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BalancesInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { BN } from '@polkadot/util';

import { Box, Grid, Tooltip, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/components/translate';
import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { BN_HUNDRED, BN_ZERO } from '@polkadot/util';

interface Props {
  availableBalance: BN | undefined;
  unlockingAmount: BN | undefined;
  redeemable: BN | undefined;
  staked: BN | undefined;
  balances: BalancesInfo | undefined
}

export default function StakedBar ({ availableBalance, balances, redeemable, staked, unlockingAmount }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const total = useMemo(() => getValue('total', balances), [balances]);

  const stakedPercent = useMemo(() => total ? Number(staked) * 100 / Number(total) : undefined, [staked, total]);
  const redeemablePercent = useMemo(() => total && redeemable ? Number(redeemable) * 100 / Number(total) : undefined, [redeemable, total]);
  const unlockingPercent = useMemo(() => total && unlockingAmount ? Number(unlockingAmount) * 100 / Number(total) : undefined, [total, unlockingAmount]);
  const availablePercent = useMemo(() => total && availableBalance ? Number(availableBalance) * 100 / Number(total) : undefined, [availableBalance, total]);
  const reminderPercent = useMemo(() =>
    Number((total || BN_HUNDRED).sub((availableBalance || BN_ZERO).add(staked || BN_ZERO).add(redeemable || BN_ZERO).add(unlockingAmount || BN_ZERO))) * 100 / Number(total)
  , [availableBalance, redeemable, staked, total, unlockingAmount]);

  const Bar = ({ bgcolor, percent, tooltipText }: { bgcolor?: string, tooltipText?: string, percent?: number }) => (
    <Tooltip placement='top-end' title={tooltipText || ''}>
      <Box bgcolor={bgcolor} height='5px' width={percent ? `${percent}%` : undefined} />
    </Tooltip>
  );

  return (
    <Grid container item sx={{ flexWrap: 'nowrap' }}>
      <Bar
        bgcolor={theme.palette.aye.main}
        percent={stakedPercent}
        tooltipText={t('Staked')}
      />
      <Bar
        bgcolor={theme.palette.approval.main}
        percent={redeemablePercent}
        tooltipText={t('Redeemable')}
      />
      <Bar
        bgcolor={theme.palette.support.main}
        percent={unlockingPercent}
        tooltipText={t('Unstaking')}
      />
      <Bar
        bgcolor={theme.palette.warning.main}
        percent={availablePercent}
        tooltipText={t('Available to stake')}
      />
      <Bar
        bgcolor={theme.palette.action.disabled}
        percent={reminderPercent}
        tooltipText={t('Others')}
      />
    </Grid>
  );
}
