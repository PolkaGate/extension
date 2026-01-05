// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { DisplayAmount } from '@polkadot/extension-polkagate/src/partials';

import { useTranslation } from '../../../../hooks';

interface Props {
  amount: string | undefined;
  genesisHash: string | undefined;
  token: string | undefined;
  isExtension?: boolean;
}

export default function EasyStakeReviewHeader ({ amount, genesisHash, isExtension, token }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const color = useMemo(() => isExtension ? theme.palette.text.highlight : '#AA83DC', [isExtension, theme.palette.text.highlight]);

  return (
    <Stack sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : 'transparent', borderRadius: '14px', py: isExtension ? '20px' : 0 }}>
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
