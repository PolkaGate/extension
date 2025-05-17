// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Container, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { FormatBalance2, GradientDivider } from '../../../components';
import { useTranslation } from '../../../hooks';

interface Props {
  feeValue: Balance | undefined;
  token: string | undefined;
  decimal: number | undefined;
}

export default function FeeValue ({ decimal, feeValue, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack direction='column' sx={{ rowGap: '8px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <Typography color='text.highlight' variant='B-1'>
          {t('Fee')}
        </Typography>
        {feeValue
          ? (
            <FormatBalance2
              decimalPoint={4}
              decimals={[decimal ?? 0]}
              style={{
                color: theme.palette.text.primary,
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 500,
                width: 'max-content'
              }}
              tokens={[token ?? '']}
              value={feeValue}
            />)
          : (
            <Skeleton
              animation='wave'
              height='12px'
              sx={{ borderRadius: '50px', fontWeight: 'bold', transform: 'none', width: '70px' }}
              variant='text'
            />
          )
        }
      </Container>
      <GradientDivider />
    </Stack>
  );
}
