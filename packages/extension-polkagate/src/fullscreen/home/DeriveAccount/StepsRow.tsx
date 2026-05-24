// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DERIVATION_STEPS } from './types';

import { Box, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../hooks';

const StepItem = ({ inputStep, label, num }: { inputStep: number, num: number, label: string }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isCompleted = inputStep > num;
  const isCurrent = inputStep === num;
  const isActive = inputStep >= num;
  const numberColor = isActive
    ? isDark ? 'text.primary' : '#2D1E4A'
    : isDark ? 'primary.main' : '#6F5798';

  return (
    <Stack alignItems='center' columnGap='5px' direction='column' justifyContent='start'>
      <Box
        sx={{
          alignItems: 'center',
          background: isActive
            ? isDark
              ? theme.palette.gradient.brand
              : 'linear-gradient(262.56deg, #A86BE4 0%, #FF4FB9 55%, #A86BE4 100%)'
            : isDark
              ? '#674394'
              : '#E9DDFB',
          border: `2px solid ${isDark ? '#2D1E4A' : '#7A68A4'}`,
          borderRadius: '50%',
          display: 'flex',
          height: '32px',
          justifyContent: 'center',
          width: '32px'
        }}
      >
        <Typography color={numberColor} sx={{ textAlign: 'center' }} variant='B-3'>
          {num}
        </Typography>
      </Box>
      <Typography color={isCurrent ? '#FF4FB9' : isCompleted ? (isDark ? '#AA83DC' : '#9A82C7') : isDark ? '#674394' : '#7A68A4'} sx={{ textAlign: 'center' }} variant='B-2'>
        {label}
      </Typography>
    </Stack>
  );
};

export default function StepsRow({ inputStep }: { inputStep: DERIVATION_STEPS }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ display: 'flex', justifySelf: 'center', m: '18px 0 25px', width: '80%' }}>
      <StepItem
        inputStep={inputStep}
        label={t('Derivation path')}
        num={1}
      />
      <Box
        sx={{
          background: isDark ? '#67439466' : 'linear-gradient(90deg, rgba(255, 79, 185, 0.2) 0%, rgba(111, 87, 152, 0.28) 100%)',
          borderRadius: '1024px',
          flexGrow: 1,
          height: '4px',
          mt: '14px'
        }}
      />
      <StepItem
        inputStep={inputStep}
        label={t('Name & Password')}
        num={2}
      />
    </Box>
  );
}
