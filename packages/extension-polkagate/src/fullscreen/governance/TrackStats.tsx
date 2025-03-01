// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import type { DecidingCount } from '../../hooks/useDecidingCount';
import type { Track } from './utils/types';

import { Container, Divider, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import { ShortAddress, ShowBalance, ShowValue } from '../../components';
import { useInfo, useTranslation } from '../../hooks';
import useStyles from './styles/styles';
import { kusama } from './tracks/kusama';
import { polkadot } from './tracks/polkadot';
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

const findItemDecidingCount = (item: string, decidingCounts: DecidingCount | undefined): number => {
  if (!decidingCounts) {
    return 0;
  }

  const filtered = decidingCounts.referenda.concat(decidingCounts.fellowship).find(([key]) =>
    key === item.toLowerCase().replaceAll(' ', '_') ||
    key === item.toLowerCase());

  return filtered?.[1] || 0;
};

export const LabelValue = ({ asShortAddress, label, labelStyle = { fontSize: '16px', fontWeight: 400 }, noBorder, style, value, valueStyle = { fontSize: '18px', fontWeight: 500 } }: { asShortAddress?: boolean, label: string, labelStyle?: SxProps<Theme>, noBorder?: boolean, style?: SxProps<Theme>, value: unknown, valueStyle?: SxProps<Theme> }) => {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container height='35px' item justifyContent='space-between' lineHeight='35px' md={12}
      sx={{
        borderBottom: !noBorder ? '0.5px solid' : 'none',
        borderBottomColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : theme.palette.text.disabled}`, ...style
      }}>
      <Grid item sx={{ ...labelStyle }}>
        <Typography>
          {label}
        </Typography>
      </Grid>
      <Grid item sx={{ '> .MuiSkeleton-root': { display: 'block' }, ...valueStyle }}>
        {asShortAddress
          ? <ShortAddress address={value as string} charsCount={30} showCopy />
          : <ShowValue value={value as string | number} />
        }
      </Grid>
    </Grid>
  );
};

export function TrackStats({ address, decidingCounts, selectedSubMenu, topMenu, track }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const { api, decimal, token } = useInfo(address);

  const chainGovInfo = token === 'KSM' ? kusama : polkadot;
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
                {chainGovInfo[topMenu.toLocaleLowerCase()].find(({ name }) => name === snakeCaseTrackName)?.text}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent='space-between'>
            <Grid container item sx={styles.trackStatsChild}>
              <LabelValue
                label={t('Remaining Slots')}
                value={decidingCounts && track?.[1]?.maxDeciding && `${track[1].maxDeciding as unknown as number - findItemDecidingCount(selectedSubMenu, decidingCounts)} out of ${track?.[1]?.maxDeciding as unknown as number}`}
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
