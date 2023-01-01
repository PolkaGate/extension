// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import { Container, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../hooks';

interface Props {
  success: boolean;
  showLabel?: boolean;
  size?: number;
  style?: SxProps<Theme>;
}

export default function FailSuccessIcon({ showLabel = true, style = { fontSize: '54px', mt: '20px' }, success }: Props) {
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
              stroke: 'white',
              fontSize: style.fontSize
            }}
          />
          : <CloseIcon
            sx={{
              borderRadius: '50%',
              bgcolor: 'warning.main',
              color: '#fff',
              fontSize: style.fontSize,
              stroke: 'white'
            }}
          />
      }
      {showLabel && <Typography
        fontSize='16px'
        fontWeight={500}
      // mt='10px'
      >
        {success ? t<string>('Completed') : t<string>('Failed')}
      </Typography>
      }
    </Container>
  );
}
