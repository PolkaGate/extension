// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Divider, Stack, Typography } from '@mui/material';
import React from 'react';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../hooks';

export enum INPUT_STEPS {
  SENDER = 1,
  RECIPIENT = 2,
  AMOUNT = 3,
  SUMMARY = 4
}

const StepItem = ({ inputStep, label, num, withDivider = true }: { inputStep: number, num: number, label: string, withDivider?: boolean }) => (
  <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start'>
    <Box sx={{ alignItems: 'center', background: inputStep >= num ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#674394', border: '2px solid #2D1E4A', borderRadius: '50%', display: 'flex', height: '32px', justifyContent: 'center', width: '32px' }}>
      <Typography color={inputStep >= num ? '#EAEBF1' : '#AA83DC'} sx={{ textAlign: 'center' }} variant='B-3'>
        {num}
      </Typography>
    </Box>
    <Typography color={inputStep === num ? '#FF4FB9' : inputStep > num ? '#AA83DC' : '#674394'} sx={{ textAlign: 'center' }} variant='B-2'>
      {label}
    </Typography>
    {
      withDivider &&
      <Divider orientation='horizontal' sx={{ borderBottomWidth: 'thick', borderColor: '#67439466', borderRadius: '1024px', mx: '8px', width: '16px' }} />
    }  </Stack>
);

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
