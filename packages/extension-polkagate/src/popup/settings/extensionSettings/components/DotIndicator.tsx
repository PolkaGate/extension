// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';

const COLORS = {
  GREEN: '#82FFA5',
  GREEN_BG: '#82FFA526',
  GREEN_OFF: '#6B9B7880',
  YELLOW: '#FFCE4F',
  YELLOW_BG: '#FFCE4F26',
  YELLOW_OFF: '#FFCE4F80',
  // eslint-disable-next-line sort-keys
  RED: '#FF4FB9',
  RED_BG: '#FF4FB926',
  RED_OFF: '#FF4FB980',
  // eslint-disable-next-line sort-keys
  DEFAULT: '#AA83DC',
  DEFAULT_BG: '#AA83DC26',
  DEFAULT_OFF: '#AA83DC66'
};

const TOTAL_DOTS = 4;

function DotIndicator({ delay }: { delay: number | null | undefined }): React.ReactElement {
  const [colorCode, dotsInColor]: [colorCode: keyof typeof COLORS, dotsInColor: number] = useMemo(() => {
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

  return (
    <Grid alignItems='center' container item sx={{ bgcolor: COLORS[`${colorCode}_BG`], borderRadius: '8px', height: '18px', width: 'fit-content' }}>
      <Typography color={COLORS[colorCode]} fontFamily='Inter' fontSize='20px' letterSpacing='-3.5px' sx={{ lineHeight: '18px', pl: '5px' }}>
        {'•'.repeat(dotsInColor)}
      </Typography>
      <Typography color={COLORS[`${colorCode}_OFF`]} fontFamily='Inter' fontSize='20px' letterSpacing='-3.5px' sx={{ lineHeight: '18px', pr: '5px' }}>
        {'•'.repeat(TOTAL_DOTS - dotsInColor)}
      </Typography>
      <Typography color={COLORS[colorCode]} fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ bgcolor: COLORS[`${colorCode}_BG`], borderRadius: '7px', height: '16px', px: '5px' }}>
        {delay ?? 0}ms
      </Typography>
    </Grid>

  );
}

export default React.memo(DotIndicator);
