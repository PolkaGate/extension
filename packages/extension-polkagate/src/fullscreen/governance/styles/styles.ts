// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

import type { CSSProperties } from 'react';

import { type SxProps, type Theme, useTheme } from '@mui/material';

import { pgBoxShadow } from '../../../util/utils';

interface Output {
  allReferendaStatsContainer: SxProps<Theme>;
  referendaStats: SxProps<Theme>;
  treasuryStats: SxProps<Theme>;
  trackStatsContainer: SxProps<Theme>;
  trackStatsChild: SxProps<Theme>;
  curveContainer: SxProps<Theme>;
  accordionStyle: CSSProperties;
}

export default function useStyles(firstBreakpoint?: boolean, secondBreakpoint?: boolean): Output {
  const theme = useTheme();

  return ({
    /* AllReferendaStats.tsx */
    allReferendaStatsContainer: {
      alignItems: 'start',
      bgcolor: 'background.paper',
      borderRadius: '10px',
      display: 'flex',
      boxShadow: pgBoxShadow(theme),
      overflow: 'hidden',
      justifyContent: 'space-around',
      p: '15px'
    },
    referendaStats: {
      boxSizing: 'content-box',
      maxWidth: secondBreakpoint ? '100%' : firstBreakpoint ? '400px' : '292px',
      minWidth: ' 225px',
      width: secondBreakpoint ? '100%' : firstBreakpoint ? '40%' : 'auto'
    },
    treasuryStats: {
      justifyContent: firstBreakpoint ? 'initial' : 'space-around',
      maxWidth: secondBreakpoint ? '100%' : firstBreakpoint ? '500px' : '730px',
      minWidth: secondBreakpoint ? '100%' : firstBreakpoint ? '365px' : '635px',
      width: secondBreakpoint ? '100%' : firstBreakpoint ? '52%' : '65%'
    },

    /* TrackStats.tsx */
    trackStatsContainer: {
      justifyContent: 'space-between',
      maxWidth: secondBreakpoint ? '100%' : firstBreakpoint ? '550px' : '730px',
      minWidth: firstBreakpoint ? '290px' : '585px',
      width: secondBreakpoint ? '100%' : '52%'
    },
    trackStatsChild: {
      width: firstBreakpoint ? '100%' : '48%'
    },
    curveContainer: {
      marginBlockStart: 'auto',
      marginInlineEnd: secondBreakpoint ? 'auto' : 0,
      maxWidth: secondBreakpoint ? '75%' : '350px',
      minWidth: '290px',
      p: '8px',
      width: secondBreakpoint ? '100%' : '40%'
    },
    accordionStyle: {
      background: theme.palette.background.paper,
      borderRadius: '10px',
      boxShadow: theme.palette.mode === 'light' ? pgBoxShadow(theme) : undefined,
      marginBlock: '10px',
      paddingInline: '3%',
      position: 'unset',
      width: 'inherit'
    }
  });
}
