// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { Container, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../hooks';

interface Props {
  success: boolean;
  showLabel?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

//@ts-ignore
export default function FailSuccessIcon ({ showLabel = true, style = { fontSize: '54px', mt: '20px' }, success }: Props) {
  const { t } = useTranslation();

  return (
    <Container
      disableGutters
      sx={{ height: '105px', ...style }}
    >
      {
        success
          ? <CheckIcon
            sx={{
              bgcolor: 'success.main',
              borderRadius: '50%',
              color: 'white',
              fontSize: style.fontSize,
              stroke: 'white'
            }}
          />
          : <CloseIcon
            sx={{
              bgcolor: 'warning.main',
              borderRadius: '50%',
              color: '#fff',
              fontSize: style.fontSize,
              stroke: 'white'
            }}
          />
      }
      {showLabel &&
        <Typography
          fontSize='16px'
          fontWeight={500}>
          {success ? t('Completed') : t('Failed')}
        </Typography>
      }
    </Container>
  );
}
