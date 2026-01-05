// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useIsDark, useIsExtensionPopup, useTranslation } from '../../../hooks';
import { Docs, Web } from '../icons';
import SocialIcon from '../partials/SocialIcon';

interface Props {
  style?: React.CSSProperties;
}

export default function Resources ({ style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const isExtension = useIsExtensionPopup();

  return (
    <Stack direction='column' sx={{ ...style }}>
      <Typography
        color={isExtension ? 'label.secondary' : 'text.primary'}
        fontSize={!isExtension ? '22px' : undefined}
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }}
        variant='H-4'
      >
        {t('Resources')}
      </Typography>
      <Grid columnGap='8px' container justifyContent={'flex-start'}>
        <SocialIcon Icon={<Docs color={theme.palette.icon.secondary} width='18px' />} bgColor ={isDark ? undefined : '#CCD2EA'} link='https://docs.polkagate.xyz/' />
        <SocialIcon Icon={<Web color={theme.palette.icon.secondary} width='18px' />} bgColor ={isDark ? undefined : '#CCD2EA'} link='https://polkagate.xyz/' />
      </Grid>
    </Stack>
  );
}
