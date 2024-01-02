// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '../../../hooks';

interface RemainingTimeCounterProps {
  dayCounter: number;
  hourCounter: number;
  minCounter: number;
  secCounter: number;
}

export default function RemainingTime({ delayInSecond }: { delayInSecond: number }): React.ReactElement {
  const { t } = useTranslation();

  const [remainingTimeCounter, setRemainingTimeCounter] = useState<RemainingTimeCounterProps>();
  const [remainingSecondsToKickAll, setRemainingSecondsToKickAll] = useState<number>(delayInSecond);// in seconds

  const remainingTime = useCallback((seconds: number) => {
    const dayCounter = Math.floor(seconds / (3600 * 24));
    const hourCounter = Math.floor(seconds % (3600 * 24) / 3600);
    const minCounter = Math.floor(seconds % 3600 / 60);
    const secCounter = Math.floor(seconds % 60);

    return ({
      dayCounter,
      hourCounter,
      minCounter,
      secCounter
    });
  }, []);

  useEffect(() => {
    if (!remainingSecondsToKickAll) {
      return;
    }

    setTimeout(() => setRemainingSecondsToKickAll(remainingSecondsToKickAll - 1), 1000);
    setRemainingTimeCounter(remainingTime(remainingSecondsToKickAll));
  }, [remainingSecondsToKickAll, remainingTime]);

  return (
    <Grid container justifyContent='center' my='25px'>
      {(remainingTimeCounter?.dayCounter ?? 0) > 0 &&
        <Typography fontSize='32px' fontWeight={500} textAlign='center'>
          {(remainingTimeCounter?.dayCounter ?? 0) > 1
            ? t<string>('days and')
            : t<string>('day and')}
        </Typography>
      }
      <Typography fontSize='32px' fontWeight={500} px='2px' textAlign='center'>
        {remainingTimeCounter?.hourCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}
      </Typography>
      <Typography fontSize='32px' fontWeight={500} px='2px' textAlign='center'>
        :
      </Typography>
      <Typography fontSize='32px' fontWeight={500} px='2px' textAlign='center'>
        {remainingTimeCounter?.minCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}
      </Typography>
      <Typography fontSize='32px' fontWeight={500} px='2px' textAlign='center'>
        :
      </Typography>
      <Typography fontSize='32px' fontWeight={500} px='2px' textAlign='center'>
        {remainingTimeCounter?.secCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}
      </Typography>
    </Grid>
  );
}
