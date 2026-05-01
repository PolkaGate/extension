// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DERIVATION_STEPS } from './types';

import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../hooks';

const StepItem = ({ inputStep, label, num }: { inputStep: number, num: number, label: string }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isCompleted = inputStep > num;
  const isCurrent = inputStep === num;
  const isActive = inputStep >= num;

  return (
    <Stack alignItems='center' columnGap='5px' direction='column' justifyContent='start'>
      <Box
        sx={{
          alignItems: 'center',
          background: isActive
            ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)'
            : isDark
              ? '#674394'
              : '#E9DDFB',
          border: `2px solid ${isDark ? '#2D1E4A' : '#4F3779'}`,
          borderRadius: '50%',
          display: 'flex',
          height: '32px',
          justifyContent: 'center',
          width: '32px'
        }}
      >
        <Typography color={isActive ? 'text.primary' : isDark ? 'primary.main' : '#7A68A4'} sx={{ textAlign: 'center' }} variant='B-3'>
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
      <Box sx={{ flexGrow: 1, mt: '14px' }}>
        <Divider
          orientation='horizontal'
          sx={{
            backgroundColor: isDark ? '#67439466' : '#C9B6E8',
            borderBottomWidth: 'thick',
            borderRadius: '1024px',
            height: '2px'
          }}
        />
      </Box>
      <StepItem
        inputStep={inputStep}
        label={t('Name & Password')}
        num={2}
      />
    </Box>
  );
}
