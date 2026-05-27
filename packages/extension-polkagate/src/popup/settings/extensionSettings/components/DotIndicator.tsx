// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

const COLORS = {
  RED: '#FF4FB9',
  RED_BG: '#FF4FB926',
  RED_OFF: '#FF4FB980',
  // eslint-disable-next-line sort-keys
  DEFAULT: '#AA83DC',
  DEFAULT_BG: '#AA83DC26',
  DEFAULT_OFF: '#AA83DC66'
};

const TOTAL_DOTS = 4;

type LatencyColorCode = 'GREEN' | 'YELLOW' | 'RED' | 'DEFAULT';
type LatencyColorKey = LatencyColorCode | `${LatencyColorCode}_BG` | `${LatencyColorCode}_OFF`;

function DotIndicator({ delay }: { delay: number | null | undefined }): React.ReactElement {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors: Record<LatencyColorKey, string> = useMemo(() => ({
    ...COLORS,
    GREEN: theme.palette.success.main,
    GREEN_BG: isDark ? '#82FFA526' : theme.palette.success.light,
    GREEN_OFF: isDark ? '#6B9B7880' : '#9BDCB7',
    YELLOW: isDark ? theme.palette.warning.light : '#FF8A35',
    YELLOW_BG: isDark ? '#FFCE4F26' : '#FFF0E4',
    YELLOW_OFF: isDark ? '#FFCE4F80' : '#FFC78E'
  }), [isDark, theme.palette.success.light, theme.palette.success.main, theme.palette.warning.light]);

  const [colorCode, dotsInColor]: [colorCode: LatencyColorCode, dotsInColor: number] = useMemo(() => {
    if (!delay) {
      return ['DEFAULT', 0];
    }

    if (delay < 100) {
      return ['GREEN', 3];
    }

    if (delay < 200) {
      return ['YELLOW', 2];
    }

    return ['RED', 1];
  }, [delay]);
  const bgColorKey = `${colorCode}_BG` as const;
  const offColorKey = `${colorCode}_OFF` as const;

  return (
    <Grid alignItems='center' container item sx={{ bgcolor: colors[bgColorKey], borderRadius: '8px', height: '18px', width: 'fit-content' }}>
      <Typography color={colors[colorCode]} fontFamily='Inter' fontSize='20px' letterSpacing='-3.5px' sx={{ lineHeight: '18px', pl: '5px' }}>
        {'•'.repeat(dotsInColor)}
      </Typography>
      <Typography color={colors[offColorKey]} fontFamily='Inter' fontSize='20px' letterSpacing='-3.5px' sx={{ lineHeight: '18px', pr: '5px' }}>
        {'•'.repeat(TOTAL_DOTS - dotsInColor)}
      </Typography>
      <Typography color={colors[colorCode]} fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ bgcolor: colors[bgColorKey], borderRadius: '7px', height: '16px', px: '5px' }}>
        {delay ?? 0}ms
      </Typography>
    </Grid>

  );
}

export default React.memo(DotIndicator);
