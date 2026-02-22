// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Stack, Typography } from '@mui/material';
import { Code1, Grid4, SidebarRight } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { setNotification } from '@polkadot/extension-polkagate/src/messaging';
import { toTitleCase } from '@polkadot/extension-polkagate/src/util/string';
import settings from '@polkadot/ui-settings';

import { useTranslation } from '../../../components/translate';

export interface ItemProps {
  Icon: Icon
  caption: string;
  label: string;
  notification: string | undefined
}

function Item({ Icon, caption, label, notification }: ItemProps): React.ReactElement {
  const value = label.toLowerCase();

  const onClick = useCallback((): void => {
    setNotification(value).catch(console.error);

    settings.set({ notification: value });
  }, [value]);

  const isSelected = notification === value;

  return (
    <Stack
      onClick={onClick}
      sx={{
        background: isSelected
          ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)'
          : '#BEAAD833',
        borderRadius: '12px',
        cursor: 'pointer',
        height: '40px',
        minWidth: '108px',
        padding: isSelected ? '2px' : '1px',
        transition: 'all 250ms ease-out',
        width: 'fit-content'
      }}
    >
      <Stack
        alignItems='center'
        columnGap='5px'
        direction='row'
        justifyContent='start'
        sx={{
          ':hover': { background: '#2D1E4A' },
          background: isSelected ? '#1A1B20' : '#1B133CB2',
          borderRadius: '10px',
          height: '40px',
          minWidth: '81px',
          padding: '8px 12px',
          transition: 'all 250ms ease-out'
        }}
      >
        <Icon color={isSelected ? '#DC45A0' : '#AA83DC'} size={18} variant='Bulk' />
        <Typography color='#EAEBF1' sx={{ textAlign: 'left' }} variant='B-4'>
          {toTitleCase(caption)}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function DappRequests(): React.ReactElement {
  const { t } = useTranslation();

  const [notification, setNotification] = useState(settings.notification);

  useEffect(() => {
    settings.on('change', (s): void => {
      setNotification(s.notification);
    });
  }, []);

  return (
    <Stack direction='column'>
      <Typography color='text.primary' fontSize='22px' m='40px 0 5px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('DApp Requests')}
      </Typography>
      <Stack columnGap='10px' direction='row' sx={{ alignItems: 'center' }}>
        <Item
          Icon={Code1}
          caption={t('PopUp')}
          label='PopUp'
          notification={notification}
        />
        <Item
          Icon={SidebarRight}
          caption={t('Extension')}
          label='Extension'
          notification={notification}
        />
        <Item
          Icon={Grid4}
          caption={t('Window')}
          label='Window'
          notification={notification}
        />
      </Stack>
    </Stack>
  );
}
