// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { useTranslation } from '../../../hooks';
import { ActiveRecoveryFor } from '../../../hooks/useActiveRecoveries';
import { pgBoxShadow } from '../../../util/utils';

interface RecoveryOptionButtonType {
  activeLost: ActiveRecoveryFor | null | undefined;
  icon: unknown;
  title: string;
  description: string;
  onClickFunction: () => void;
}

export default function RecoveryOptionButton({ activeLost, description, icon, onClickFunction, title }: RecoveryOptionButtonType) {
  const { t } = useTranslation();
  const theme = useTheme();

  const isDisabled = !!activeLost;
  const buttonColors = useMemo(() =>
    isDisabled
      ? theme.palette.secondary.contrastText
      : theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.light
    , [isDisabled, theme]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' onClick={activeLost ? undefined : onClickFunction} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: isDisabled ? theme.palette.secondary.contrastText : 'secondary.light', borderRadius: '7px', boxShadow: pgBoxShadow(theme), cursor: activeLost ? 'default' : 'pointer', height: '125px', p: '25px', position: 'relative' }}>
      {activeLost &&
        <Grid sx={{ bgcolor: 'rgba(116, 116, 116, 0.2)', borderRadius: '5px', height: '123px', position: 'absolute', right: 0, top: 0, width: '670px', zIndex: 10 }}>
        </Grid>
      }
      <Grid alignItems='center' container item width='75px'>
        {icon}
      </Grid>
      <Grid alignItems='flex-start' container direction='column' gap='10px' item xs={9}>
        <Typography color={buttonColors} fontSize='18px' fontWeight={500}>
          {t<string>(title)}
        </Typography>
        <Typography fontSize='13px' fontWeight={400} sx={{ color: isDisabled ? theme.palette.secondary.contrastText : '' }}>
          {t<string>(description)}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item width='50px'>
        <ArrowForwardIosIcon
          sx={{ color: buttonColors, fontSize: '40px', m: 'auto', stroke: buttonColors, strokeWidth: '2px' }}
        />
      </Grid>
    </Grid>
  )
};
