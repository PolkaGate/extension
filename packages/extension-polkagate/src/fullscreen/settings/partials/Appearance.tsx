// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Stack, Typography } from '@mui/material';
import { Moon, Sun1 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { useAlerts, useIsDark } from '@polkadot/extension-polkagate/src/hooks/index';
import { toTitleCase } from '@polkadot/extension-polkagate/src/util/string';

import { useTranslation } from '../../../components/translate';

export interface ItemProps{
  Icon: Icon
  label: string;
  isSelected: boolean;
}

function Item ({ Icon, isSelected, label }: ItemProps): React.ReactElement {
  const { notify } = useAlerts();
  const { t } = useTranslation();
  // const colorMode = useContext(ColorContext);

  const onClick = useCallback(() => {
  //  colorMode.toggleColorMode();
    notify(t('Coming Soon!'), 'info');
  }, [notify, t]);

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
        <Icon color={isSelected ? '#DC45A0' : '#AA83DC'} size={18} variant='Bold' />
        <Typography color='text.primary' sx={{ textAlign: 'left' }} variant='B-4'>
          {toTitleCase(label)}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function Appearance (): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();

  return (
    <Stack direction='column'>
      <Typography color='text.primary' fontSize='22px' m='40px 0 9px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('Appearance')}
      </Typography>
      <Stack columnGap='10px' direction='row' sx={{ alignItems: 'center' }}>
        <Item
          Icon={Moon}
          isSelected={isDark}
          label= {t('Dark Mode')}
        />
        <Item
          Icon={Sun1}
          isSelected={!isDark}
          label= {t('Light Mode')}
        />
      </Stack>
    </Stack>
  );
}
