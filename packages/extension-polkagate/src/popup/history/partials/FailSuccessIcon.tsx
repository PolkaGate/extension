// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Cancel as CancelIcon, Check as CheckIcon } from '@mui/icons-material';
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
      sx={{ ...style }}
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
          : <CancelIcon
            sx={{
              bgcolor: '#fff',
              borderRadius: '50%',
              color: 'warning.main',
              fontSize: style.fontSize
            }}
          />
      }
      {showLabel && <Typography
        fontSize='16px'
        fontWeight={500}
        mt='10px'
      >
        {success ? t<string>('Completed') : t<string>('Failed')}
      </Typography>
      }
    </Container>
  );
}
