// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyIconTheme } from '@polkadot/extension-polkagate/src/util/types';

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { watchStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { PolkaGateIdenticon } from '@polkadot/extension-polkagate/src/style/index';
import { DEFAULT_ACCOUNT_ICON_THEME, DEMO_ACCOUNT, ICON_THEME_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';
import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/util/index';

import { useTranslation } from '../../../components/translate';

export interface ItemProps{
  address?: string;
  iconTheme: MyIconTheme
  label: string;
  selectedTheme: MyIconTheme | undefined
}

function Item ({ address, iconTheme, label, selectedTheme }: ItemProps): React.ReactElement {
  const onClick = useCallback(() => {
    setStorage(ICON_THEME_NAME_IN_STORAGE, iconTheme).catch(console.error);
  }, [iconTheme]);

  const isSelected = selectedTheme === iconTheme;

  return (
    <Stack
      onClick={onClick}
      sx={{
        background: isSelected
          ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)'
          : '#BEAAD833',
        borderRadius: '12px',
        cursor: 'pointer',
        height: '44px',
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
        <PolkaGateIdenticon
          address={address}
          iconTheme={iconTheme}
          size={18}
          style={{ display: 'flex' }}
        />
        <Typography color='text.primary' sx={{ textAlign: 'left' }} variant='B-4'>
          {label}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function AccountIcon (): React.ReactElement {
  const { t } = useTranslation();
  const [selectedTheme, setSelectedTheme] = useState<MyIconTheme>();

  useEffect(() => {
    getStorage(ICON_THEME_NAME_IN_STORAGE).then((iTheme) => setSelectedTheme(iTheme as MyIconTheme | undefined ?? DEFAULT_ACCOUNT_ICON_THEME)).catch(console.error);
    const unsubscribe = watchStorage(ICON_THEME_NAME_IN_STORAGE, setSelectedTheme);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Stack direction='column'>
      <Typography color='text.primary' fontSize='22px' m='15px 0 9px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('Account Icon')}
      </Typography>
      <Stack columnGap='10px' direction='row' sx={{ alignItems: 'center' }}>
        <Item
          address={DEMO_ACCOUNT}
          iconTheme='polkasoul'
          label= {t('Polka Soul')}
          selectedTheme={selectedTheme}
        />
        <Item
          address={DEMO_ACCOUNT}
          iconTheme='polkadot'
          label= {t('Dots')}
          selectedTheme={selectedTheme}
        />
        <Item
          address={DEMO_ACCOUNT}
          iconTheme='beachball'
          label= {t('Ball')}
          selectedTheme={selectedTheme}
        />
        <Item
          address={DEMO_ACCOUNT}
          iconTheme='ethereum'
          label= {t('Cube')}
          selectedTheme={selectedTheme}
        />
      </Stack>
    </Stack>
  );
}
