// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React from 'react';

import { SUPPORT_EMAIL } from '@polkadot/extension-polkagate/src/util/constants';

import { useIsDark, useIsExtensionPopup, useTranslation } from '../../../hooks';
import AtSignIcon from '../icons/AtSign';

interface Props {
  style?: React.CSSProperties;
}

export default function ContactUs({ style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
  const isDark = useIsDark();
  const color = isDark ? 'rgba(190, 170, 216, 1)' : '#745D8B';

  return (
    <Stack direction='column' sx={{ ...style }}>
      <Typography
        color={isExtension ? 'label.secondary' : 'text.primary'}
        fontSize={!isExtension ? '22px' : undefined}
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
        variant='H-4'
      >
        {t('Contact us')}
      </Typography>
      <Grid alignItems='center' columnGap='5px' container justifyContent='flex-start' pt='7px' sx={{ flexWrap: 'nowrap' }}>
        <AtSignIcon color={color} width='14px' />
        <Typography color={color} sx={{ textAlign: 'left' }} variant='B-1'>
          {SUPPORT_EMAIL}
        </Typography>
      </Grid>
    </Stack>
  );
}
