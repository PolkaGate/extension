// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Cancel as CancelIcon, Check as CheckIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../hooks';

export default function FailSuccessIcon({ showLabel = true, size = 54, success }: { success: boolean, showLabel?: boolean, size?: number }) {
  const { t } = useTranslation();

  return (
    <>
      {
        success
          ? <CheckIcon
            sx={{
              bgcolor: 'success.main',
              borderRadius: '50%',
              color: 'white',
              fontSize: `${size}px`,
              mt: '20px',
              stroke: 'white'
            }}
          />
          : <CancelIcon
            sx={{
              bgcolor: '#fff',
              borderRadius: '50%',
              color: 'warning.main',
              fontSize: `${size}px`,
              mt: '20px'
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
    </>
  );
}
