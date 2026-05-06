// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { DisplayAmount } from '@polkadot/extension-polkagate/src/partials';

import { useIsDark, useTranslation } from '../../../../hooks';

interface Props {
  amount: string | undefined;
  genesisHash: string | undefined;
  token: string | undefined;
  isExtension?: boolean;
}

export default function EasyStakeReviewHeader({ amount, genesisHash, isExtension, token }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();

  const color = useMemo(() => isExtension ? theme.palette.text.highlight : '#AA83DC', [isExtension, theme.palette.text.highlight]);
  const extensionCardStyle = isExtension
    ? {
      bgcolor: isDark ? '#110F2A' : '#FFFFFF',
      border: isDark ? 'none' : '1px solid #DDE3F4',
      boxShadow: isDark ? 'none' : '0 14px 28px rgba(133, 140, 176, 0.12)',
      py: '20px'
    }
    : {
      bgcolor: 'transparent',
      py: 0
    };

  return (
    <Stack sx={{ alignItems: 'center', borderRadius: '14px', ...extensionCardStyle }}>
      <Typography color={color} variant='B-2'>
        {t('Start Staking')}
      </Typography>
      <DisplayAmount
        amount={amount}
        differentValueColor={color}
        genesisHash={genesisHash}
        isExtension={isExtension}
        token={token}
      />
    </Stack>
  );
}
