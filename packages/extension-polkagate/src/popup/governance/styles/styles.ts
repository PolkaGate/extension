// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SxProps, Theme, useTheme } from '@mui/material';

interface Output {
  allReferendaStatsContainer: SxProps<Theme>;
  referendaStats: SxProps<Theme>;
  treasuryStats: SxProps<Theme>;
  trackStatsContainer: SxProps<Theme>;
  trackStatsChild: SxProps<Theme>;
  curveContainer: SxProps<Theme>;
}

export default function useStyles(firstBreakpoint?: boolean, secondBreakpoint?: boolean, thirdBreakpoint?: boolean): Output {
  const theme = useTheme();

  return ({
    /* AllReferendaStats.tsx */
    allReferendaStatsContainer: {
      alignItems: 'start',
      bgcolor: 'background.paper',
      border: 1,
      borderColor: theme.palette.mode === 'light' ? 'background.paper' : 'secondary.main',
      borderRadius: '10px',
      boxShadow: '2px 3px 4px rgba(255, 255, 255, 0.1)',
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
    }
  });
}
