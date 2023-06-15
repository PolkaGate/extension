// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Grid, Skeleton, Typography } from '@mui/material';
import React from 'react';

import { BN, BN_MAX_INTEGER } from '@polkadot/util';

import { useCurrentBlockNumber, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { Lock } from '../../../../hooks/useAccountLocks';
import { amountToHuman, remainingTime } from '../../../../util/utils';

interface Props {
  address: string | undefined;
  accountLocks: Lock[] | undefined
}

export function getAlreadyLockedValue(allBalances: DeriveBalancesAll | undefined): BN | undefined {
  const LOCKS_ORDERED = ['pyconvot', 'democrac', 'phrelect'];
  const sortedLocks = allBalances?.lockedBreakdown
    // first sort by amount, so greatest value first
    .sort((a, b) =>
      b.amount.cmp(a.amount)
    )
    // then sort by the type of lock (we try to find relevant)
    .sort((a, b): number => {
      if (!a.id.eq(b.id)) {
        for (let i = 0; i < LOCKS_ORDERED.length; i++) {
          const lockName = LOCKS_ORDERED[i];

          if (a.id.eq(lockName)) {
            return -1;
          } else if (b.id.eq(lockName)) {
            return 1;
          }
        }
      }

      return 0;
    })
    .map(({ amount }) => amount);

  return sortedLocks?.[0] || allBalances?.lockedBalance;
}

function AlreadyLockedTooltipText({ accountLocks, address }: Props): React.ReactElement {
  const { t } = useTranslation();
  const currentBlock = useCurrentBlockNumber(address);
  const token = useToken(address);
  const decimal = useDecimal(address);

  const getLockedUntil = (endBlock: BN, currentBlock: number) => {
    if (endBlock.eq(BN_MAX_INTEGER)) {
      return 'underway';
    }

    return remainingTime(endBlock.toNumber() - currentBlock);
  };

  return (
    <Typography variant='body2'>
      <Grid container spacing={2}>
        <Grid item xs={2.5}>
          {t('Ref.')}
        </Grid>
        <Grid item xs={3.6}>
          {t('Amount')}
        </Grid>
        <Grid item xs={2.9}>
          {t('Multiplier')}
        </Grid>
        <Grid item xs={3}>
          {t('Expires')}
        </Grid>
        {currentBlock && accountLocks?.map((lock, index) => (
          <React.Fragment key={index}>
            <Grid item xs={2.5}>
              {lock.refId.toNumber()}
            </Grid>
            <Grid item xs={3.6}>
              {amountToHuman(lock.total, decimal)} {token}
            </Grid>
            <Grid item xs={2.9}>
              {lock.locked === 'None' ? 'N/A' : lock.locked.replace('Locked', '')}
            </Grid>
            <Grid item xs={3}>
              {getLockedUntil(lock.endBlock, currentBlock)}
            </Grid>
          </React.Fragment>
        ))
        }
      </Grid>
    </Typography>
  );
}

export default React.memo(AlreadyLockedTooltipText);
