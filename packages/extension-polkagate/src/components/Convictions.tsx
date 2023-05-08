// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TFunction } from 'i18next';
import type { Time } from '@polkadot/util/types';

import { Grid } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { BN, BN_MAX_INTEGER, BN_ZERO, bnMin, extractTime } from '@polkadot/util';

import { useApi, useBlockInterval, useTranslation } from '../hooks';
import { CONVICTIONS } from '../popup/governance/utils/consts';
import { Select } from '.';

interface Props {
  address: string | undefined;
  children?: React.ReactElement;
  conviction: number;
  setConviction: React.Dispatch<React.SetStateAction<number>>;
}

type Result = [blockInterval: number, timeStr: string, time: Time];

export function calcBlockTime(blockTime: BN, blocks: BN, t: TFunction): Result {
  // in the case of excessively large locks, limit to the max JS integer value
  const value = bnMin(BN_MAX_INTEGER, blockTime.mul(blocks)).toNumber();

  // time calculations are using the absolute value (< 0 detection only on strings)
  const time = extractTime(Math.abs(value));
  const { days, hours, minutes, seconds } = time;

  return [
    blockTime.toNumber(),
    `${value < 0 ? '+' : ''}${[
      days
        ? (days > 1)
          ? t<string>('{{days}} days', { replace: { days } })
          : t<string>('1 day')
        : null,
      hours
        ? (hours > 1)
          ? t<string>('{{hours}} hrs', { replace: { hours } })
          : t<string>('1 hr')
        : null,
      minutes
        ? (minutes > 1)
          ? t<string>('{{minutes}} mins', { replace: { minutes } })
          : t<string>('1 min')
        : null,
      seconds
        ? (seconds > 1)
          ? t<string>('{{seconds}} s', { replace: { seconds } })
          : t<string>('1 s')
        : null
    ]
      .filter((s): s is string => !!s)
      .slice(0, 2)
      .join(' ')}`,
    time
  ];
}

function createOptions(blockTime: BN | undefined, voteLockingPeriod: BN | undefined, t: TFunction): { text: string; value: number }[] | undefined {
  return blockTime && voteLockingPeriod && [
    { text: t<string>('0.1x voting balance, no lockup period'), value: 0.1 },
    ...CONVICTIONS.map(([value, duration, durationBn]): { text: string; value: number } => ({
      text: t<string>('{{value}}x voting balance, locked for {{duration}}x duration{{period}}', {
        replace: {
          duration,
          period: voteLockingPeriod && voteLockingPeriod.gt(BN_ZERO)
            ? ` (${calcBlockTime(blockTime, durationBn.mul(voteLockingPeriod), t)[1]})`
            : '',
          value
        }
      }),
      value
    }))
  ];
}

export default function Convictions({ address, children, conviction, setConviction }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const blockTime = useBlockInterval(address);
  const voteLockingPeriod = api && api.consts.convictionVoting.voteLockingPeriod;

  const convictionOptions = useMemo(() => blockTime && voteLockingPeriod && createOptions(blockTime, voteLockingPeriod, t), [blockTime, t, voteLockingPeriod]);

  const onChangeConviction = useCallback((conviction: number): void => {
    setConviction(conviction);
  }, [setConviction]);

  return (
    <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative' }}>
      {convictionOptions &&
        <>
          <Select
            _mt='15px'
            defaultValue={convictionOptions?.[0]?.value}
            label={t<string>('Vote Multiplier')}
            onChange={onChangeConviction}
            options={convictionOptions}
            value={conviction || convictionOptions?.[0]?.value}
          />
          {children}
        </>
      }
    </Grid>
  );
}
