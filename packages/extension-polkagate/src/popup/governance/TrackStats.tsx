// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import { Container, Divider, Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import { ShortAddress, ShowBalance, ShowValue } from '../../components';
import { useApi, useDecimal, useToken, useTranslation } from '../../hooks';
import { DecidingCount } from '../../hooks/useDecidingCount';
import { Track } from '../../hooks/useTracks';
import useStyles from './styles/styles';
import { kusama } from './tracks/kusama';
import { blockToX, toSnakeCase, toTitleCase } from './utils/util';
import { Separator } from './AllReferendaStats';
import ThresholdCurves from './Curves';

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

export const LabelValue = ({ asShortAddress, label, value, noBorder, style, valueStyle = { fontSize: '18px', fontWeight: 500 }, labelStyle = { fontSize: '16px', fontWeight: 400 } }
  : { asShortAddress?: boolean, label: string, labelStyle?: SxProps<Theme>, noBorder?: boolean, style?: SxProps<Theme>, value: any, valueStyle?: SxProps<Theme> }) => {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container height='35px' item justifyContent='space-between' lineHeight='35px' md={12}
      sx={{
        borderBottom: !noBorder ? '0.5px solid' : 'none',
        borderBottomColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : theme.palette.text.disabled}`, ...style
      }}>
      <Grid item sx={{ ...labelStyle }}>
        <Typography >
          {label}
        </Typography>
      </Grid>
      <Grid item sx={{ '> .MuiSkeleton-root': { display: 'block' }, ...valueStyle }}>
        {asShortAddress
          ? <ShortAddress address={value} showCopy charsCount={30} />
          : <ShowValue value={value} />
        }
      </Grid>
    </Grid>
  );
};

export function TrackStats({ address, decidingCounts, selectedSubMenu, topMenu, track }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const api = useApi(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const firstBreakpoint = !useMediaQuery('(min-width:1000px)');
  const secondBreakpoint = !useMediaQuery('(min-width:675px)');
  const styles = useStyles(firstBreakpoint, secondBreakpoint);

  // TODO: needs to work on 'whitelisted caller' and 'fellowship admin' which are placed in fellowship menu
  const snakeCaseTrackName = toSnakeCase(selectedSubMenu) || String(track?.[1]?.name);

  return (
    <Container disableGutters sx={{ px: '8px' }}>
      <Grid container sx={styles.allReferendaStatsContainer}>
        <Grid container item sx={styles.trackStatsContainer}>
          <Grid alignItems='baseline' container item sx={{ borderBottom: '2px solid gray', mb: '10px' }}>
            <Grid container item>
              <Typography fontSize={32} fontWeight={500}>
                {t('{{trackName}}', { replace: { trackName: toTitleCase(snakeCaseTrackName) } })}
              </Typography>
            </Grid>
            <Grid container item>
              <Typography color='text.disableText' fontSize={16} fontWeight={400}>
                {kusama[topMenu.toLocaleLowerCase()].find(({ name }) => name === snakeCaseTrackName)?.text}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent='space-between'>
            <Grid container item sx={styles.trackStatsChild}>
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
                noBorder={!secondBreakpoint}
                value={blockToX(track?.[1]?.decisionPeriod)}
              />
            </Grid>
            <Divider flexItem orientation='vertical' />
            <Grid container item sx={styles.trackStatsChild}>
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
                noBorder
                value={<ShowBalance api={api} balance={track?.[1]?.decisionDeposit} decimal={decimal} decimalPoint={2} token={token} />}
              />
            </Grid>
          </Grid>
        </Grid>
        <Separator changeOrientation={secondBreakpoint} m={secondBreakpoint ? 20 : 0} />
        <Grid container item sx={styles.curveContainer}>
          <Typography align='left' fontSize={18} fontWeight={400}>
            {t('Threshold Curves')}
          </Typography>
          <ThresholdCurves trackInfo={track?.[1]} />
        </Grid>
      </Grid>
    </Container>
  );
}
