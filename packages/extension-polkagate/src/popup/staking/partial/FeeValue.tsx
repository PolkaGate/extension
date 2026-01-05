// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Container, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { DisplayBalance, GradientDivider } from '../../../components';
import { useIsExtensionPopup, useTranslation } from '../../../hooks';

interface Props {
  feeValue: Balance | undefined | null;
  token: string | undefined;
  decimal: number | undefined;
}

export default function FeeValue ({ decimal, feeValue, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  return (
    <Stack direction='column' sx={{ rowGap: '8px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <Typography color={isExtension ? 'text.highlight' : '#AA83DC'} variant='B-1'>
          {t('Fee')}
        </Typography>
        <DisplayBalance
          balance={feeValue}
          decimal={decimal}
          skeletonStyle={{ width: '70px' }}
          style={{
            color: theme.palette.text.primary,
            width: 'max-content'
          }}
          token={token}
        />
      </Container>
      <GradientDivider />
    </Stack>
  );
}
