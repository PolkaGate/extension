// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../hooks';

export enum INPUT_STEPS {
  SENDER = 1,
  RECIPIENT = 2,
  AMOUNT = 3,
  SUMMARY = 4
}

const StepItem = ({ inputStep, label, num, withDivider = true }: { inputStep: number, num: number, label: string, withDivider?: boolean }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isCompleted = inputStep > num;
  const isCurrent = inputStep === num;
  const isActive = inputStep >= num;

  return (
    <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start'>
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
        <Typography color={isActive ? '#EAEBF1' : isDark ? '#AA83DC' : '#7A68A4'} sx={{ textAlign: 'center' }} variant='B-3'>
          {num}
        </Typography>
      </Box>
      <Typography
        color={isCurrent ? '#FF4FB9' : isCompleted ? (isDark ? '#AA83DC' : '#9A82C7') : isDark ? '#674394' : '#7A68A4'}
        sx={{ textAlign: 'center' }}
        variant='B-2'
      >
        {label}
      </Typography>
      {withDivider &&
        <Divider
          orientation='horizontal'
          sx={{
            borderBottomWidth: 'thick',
            borderColor: isDark ? '#67439466' : '#C9B6E8',
            borderRadius: '1024px',
            mx: '8px',
            width: '16px'
          }}
        />}
    </Stack>
  );
};

export default function StepsRow({ inputStep }: { inputStep: INPUT_STEPS }): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start' sx={{ width: FULLSCREEN_WIDTH, my: '19px' }}>
      <StepItem
        inputStep={inputStep}
        label={t('Sender')}
        num={1}
      />
      <StepItem
        inputStep={inputStep}
        label={t('Recipient')}
        num={2}
      />
      <StepItem
        inputStep={inputStep}
        label={t('Amount')}
        num={3}
      />
      <StepItem
        inputStep={inputStep}
        label={t('Summary')}
        num={4}
        withDivider={false}
      />
    </Stack>

  );
}
