// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { ShowBalance, ShowValue } from '../../components';
import { useApi, useDecimal, useToken, useTranslation } from '../../hooks';
import { DecidingCount } from '../../hooks/useDecidingCount';
import { Track } from '../../hooks/useTracks';
import { kusama } from './tracks/kusama';
import { blockToX } from './utils/util';
import ThresholdCurves from './Chart';

interface Props {
  address: string;
  decidingCounts: DecidingCount | undefined;
  selectedSubMenu: string;
  topMenu: 'referenda' | 'fellowship';
  track: Track | undefined;
}

const findItemDecidingCount = (item: string, decidingCounts: DecidingCount[] | undefined): number | undefined => {
  if (!decidingCounts) {
    return undefined;
  }

  const filtered = decidingCounts.referenda.concat(decidingCounts.fellowship).find(([key]) =>
    key === item.toLowerCase().replace(' ', '_') ||
    key === item.toLowerCase());

  return filtered?.[1];
};

export const LabelValue = ({ label, value, noBorder, style, valueStyle = { fontSize: '18px', fontWeight: 500 }, labelStyle = { fontSize: 16, fontWeight: 400 } }
  : { label: string, labelStyle?: SxProps<Theme>, noBorder?: boolean, style?: SxProps<Theme>, value: any, valueStyle?: SxProps<Theme> }) => (
  <Grid alignItems='center' container height='35px' item justifyContent='space-between' lineHeight='35px' md={12} sx={{ borderBottom: !noBorder ? '0.5px solid' : 'none', borderBottomColor: 'rgba(0,0,0,0.2)', ...style }}>
    <Grid item sx={{ ...labelStyle }}>
      <Typography>
        {label}
      </Typography>
    </Grid>
    <Grid item sx={{ '> .MuiSkeleton-root': { display: 'block' }, ...valueStyle }}>
      <ShowValue value={value} />
    </Grid>
  </Grid>
);

export function TrackStats({ address, decidingCounts, selectedSubMenu, topMenu, track }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  return (
    <Grid alignItems='start' container justifyContent='space-between' sx={{ bgcolor: 'background.paper', border: 1, borderColor: theme.palette.mode === 'light' ? 'background.paper' : 'secondary.main', borderRadius: '10px', height: '260px', pb: '20px' }}>
      <Grid container item md={7} sx={{ mx: '3%', pt: '15px' }}>
        <Grid alignItems='baseline' container item sx={{ borderBottom: '2px solid gray', mb: '10px' }}>
          <Grid item xs={12}>
            <Typography fontSize={32} fontWeight={500}>
              {t('{{trackName}}', { replace: { trackName: selectedSubMenu || track?.[1]?.name?.split('_')?.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())?.join('  ') } })}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography color='text.disableText' fontSize={16} fontWeight={400}>
              {kusama[topMenu.toLocaleLowerCase()].find(({ name }) => name === String(track?.[1]?.name))?.text}
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
      <Grid alignItems='center' container item md sx={{ ml: '2%', p: '25px' }}>
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
