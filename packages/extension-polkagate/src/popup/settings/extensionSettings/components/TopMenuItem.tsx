// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Icon } from 'iconsax-react';

import { Divider, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { useLocation } from 'react-router';

import { noop } from '@polkadot/util';

import { ActionContext } from '../../../../components/contexts';

interface Props {
  Icon: Icon
  label: string;
  path: string;
}

function TopMenuItem ({ Icon, label, path }: Props): React.ReactElement {
  const onAction = useContext(ActionContext);
  const { pathname } = useLocation();

  const isSelected = pathname === `/settings-extension/${path}`;
  const onClick = useCallback(() => onAction(`/settings-extension/${path}`), [onAction, path]);

  return (
    <Stack direction='column' onClick={onClick} sx={{ cursor: 'pointer' }}>
      <Stack columnGap='4px' direction='row'>
        <Icon color={isSelected ? '#EAEBF1' : '#AA83DC'} onClick={noop} size='18' style={{ cursor: 'pointer' }} variant='Bulk' />
        <Typography color={isSelected ? '#EAEBF1' : '#AA83DC'} variant='B-2'>
          {label}
        </Typography>
      </Stack>
      {isSelected &&
        <Divider
          orientation='horizontal'
          sx={{
            background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
            border: 'none',
            height: '2px',
            ml: '',
            mt: '5px',
            width: '100%'
          }}
        />}
    </Stack>
  );
}

export default React.memo(TopMenuItem);
