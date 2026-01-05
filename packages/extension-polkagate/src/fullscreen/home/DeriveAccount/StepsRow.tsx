// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DERIVATION_STEPS } from './types';

import { Box, Divider, Stack, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../hooks';

const StepItem = ({ inputStep, label, num }: { inputStep: number, num: number, label: string }) => (
  <Stack alignItems='center' columnGap='5px' direction='column' justifyContent='start'>
    <Box sx={{ alignItems: 'center', background: inputStep >= num ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#674394', border: '2px solid #2D1E4A', borderRadius: '50%', display: 'flex', height: '32px', justifyContent: 'center', width: '32px' }}>
      <Typography color={inputStep >= num ? 'text.primary' : 'primary.main'} sx={{ textAlign: 'center' }} variant='B-3'>
        {num}
      </Typography>
    </Box>
    <Typography color={inputStep === num ? '#FF4FB9' : inputStep > num ? '#AA83DC' : '#674394'} sx={{ textAlign: 'center' }} variant='B-2'>
      {label}
    </Typography>
  </Stack>
);

export default function StepsRow ({ inputStep }: { inputStep: DERIVATION_STEPS }): React.ReactElement {
  const { t } = useTranslation();

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
            backgroundColor: '#67439466',
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
