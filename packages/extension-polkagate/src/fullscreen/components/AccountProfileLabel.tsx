// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../hooks';
import useProfileInfo from '../homeFullScreen/useProfileInfo';

interface Props {
  label: string | undefined;
  style?: React.CSSProperties;
}

function AccountProfileLabel ({ label, style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { Icon, bgcolor, color } = useProfileInfo(label);

  return (
    <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' sx={{ bgcolor, borderRadius: '9px', height: '24px', m: '10px 0 7px 10px', p: '0 7px 0 5px', width: 'fit-content', ...style }}>
      <Icon color={color} size='18' variant='Bulk' />
      <Typography color={color} variant='B-2'>
        {label ? t(label) : ''}
      </Typography>
    </Stack>
  );
}

export default React.memo(AccountProfileLabel);
