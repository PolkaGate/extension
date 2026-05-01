// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React from 'react';

import { useTranslation } from '../../../hooks';

interface Props {
  children?: React.ReactNode;
  description?: string | undefined
  failureText: string | undefined;
  isBlueish?: boolean;
  success: boolean;
  showLabel?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

export default function FailSuccessIcon({ children, description, failureText, isBlueish, showLabel = true, style = {}, success }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const successColor = isDark ? '#82FFA5' : '#43A867';
  const iconBg = isDark ? '#000' : '#F3F6FD';

  return (
    <Stack sx={{ alignItems: 'center', mt: '-5px', ...style }}>
      <Grid
        container
        item
        sx={{
          backdropFilter: 'blur(4px)',
          border: '8px solid',
          borderColor: isDark ? '#00000033' : '#E9DDFB',
          borderRadius: '999px',
          overflow: 'hidden',
          width: 'fit-content'
        }}
      >
        {success
          ? <TickCircle color={successColor} size='50' style={{ background: iconBg, borderRadius: '999px', margin: '-4px' }} variant='Bold' />
          : <CloseCircle color='#FF4FB9' size='50' style={{ background: iconBg, borderRadius: '999px', margin: '-4px' }} variant='Bold' />
        }
      </Grid>
      {showLabel &&
        <Typography
          color={isBlueish ? 'text.highlight' : 'primary.main'}
          sx={{
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            maxWidth: '360px',
            overflow: 'hidden',
            padding: '8px 5px 0',
            textOverflow: 'ellipsis'
          }}
          textTransform='capitalize'
          variant={failureText ? 'B-1' : 'B-2'}
        >
          {failureText || description ||
            (success
              ? t('Completed')
              : t('Failed'))
          }
        </Typography>
      }
      {children}
    </Stack>
  );
}
