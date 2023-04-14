// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Paper, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { ShowBalance, ShowValue } from '../../components';
import { useApi, useDecimal, useToken, useTranslation } from '../../hooks';
import { DecidingCount } from '../../hooks/useDecidingCount';
import { Tracks } from '../../hooks/useTracks';
import { kusama } from './tracks/kusama';
import ThresholdCurves from './Chart';
import { findItemDecidingCount } from './ReferendaMenu';

interface Props {
  address: string;
  selectedSubMenu: string;
  track: Tracks | undefined;
  decidingCounts: DecidingCount[] | undefined;
}

export const LabelValue = ({ label, value }: { label: string, value: any }) => (
  <Grid alignItems='center' container height='30px' item justifyContent='space-between' md={12} my='2px' sx={{ borderBottom: '0.05px solid #4B4B4B' }}>
    <Grid item sx={{ height: '25px' }}>
      <Typography fontSize={16} fontWeight={400}>
        {label}
      </Typography>
    </Grid>
    <Grid item sx={{ fontSize: '18px', fontWeight: 500 }}>
      <ShowValue value={value} />
    </Grid>
  </Grid>
);

export function TrackStats({ address, decidingCounts, selectedSubMenu, track }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const api = useApi(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  const blockToX = useCallback((block: number | BN | undefined) => {
    if (!block) {
      return undefined;
    }

    const b = Number(block);
    const dayAsBlock = 24 * 60 * 10;
    const hoursAsBlock = 60 * 10;
    const minsAsBlock = 10;
    const mayBeDays = b / dayAsBlock;

    if (mayBeDays >= 1) {
      return `${mayBeDays} day${mayBeDays > 1 ? 's' : ''}`;
    }

    const mayBeHours = b / hoursAsBlock;

    if (mayBeHours >= 1) {
      return `${mayBeHours} hour${mayBeHours > 1 ? 's' : ''}`;
    }

    const mayBeMins = b / minsAsBlock;

    if (mayBeMins >= 1) {
      return `${mayBeMins} min${mayBeMins > 1 ? 's' : ''}`;
    }

    console.log('mayBeHours', mayBeMins)
  }, []);

  return (
    <Grid alignItems='start' container justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '10px', height: '260px', pb: '20px' }}>
      <Grid container item md={7} sx={{ mx: '3%', pt: '15px' }}>
        <Grid alignItems='baseline' container item sx={{ borderBottom: '2px solid gray', mb: '10px' }}>
          <Grid item xs={12}>
            <Typography fontSize={32} fontWeight={500}>
              {t('{{trackName}}', { replace: { trackName: track?.[1]?.name?.split('_')?.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())?.join('  ') } })}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography color='text.disableText' fontSize={16} fontWeight={400}>
              {kusama.referenda.find(({ name }) => name === track?.[1]?.name)?.text}
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent='space-between' sx={{ mr: '3%', mt: '30px' }}>
          <Grid container item xs={5.5}>
            <LabelValue
              label={t('Remaining Slots')}
              value={decidingCounts && track?.[1]?.maxDeciding && `${track[1].maxDeciding - findItemDecidingCount(selectedSubMenu, decidingCounts)} out of ${track?.[1]?.maxDeciding}`}
            />
            <LabelValue
              label={t('Prepare Period')}
              value={blockToX(track?.[1]?.preparePeriod)}
            />
            <LabelValue
              label={t('Decision Period')}
              value={blockToX(track?.[1]?.decisionPeriod)}
            />
          </Grid>
          <Divider flexItem orientation='vertical' sx={{ mx: '3%' }} />
          <Grid container item xs={5.5}>
            <LabelValue
              label={t('Confirm Period')}
              value={blockToX(track?.[1]?.confirmPeriod)}
            />
            <LabelValue
              label={t('Min Enactment Period')}
              value={blockToX(track?.[1]?.minEnactmentPeriod)}
            />
            <LabelValue
              label={t('Decision deposit')}
              value={<ShowBalance api={api} balance={track?.[1]?.decisionDeposit} decimal={decimal} decimalPoint={2} token={token} />}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item md sx={{ ml: '4%', t: '10px', p: '10px' }}>
        <Typography align='left' fontSize={18} fontWeight={400}>
          {t('Threshold Curves')}
        </Typography>
        {track &&
          <ThresholdCurves trackInfo={track?.[1]} />
        }
      </Grid>
    </Grid>
  );
}
