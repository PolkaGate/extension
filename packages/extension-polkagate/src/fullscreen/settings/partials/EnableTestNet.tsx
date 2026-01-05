// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { MySwitch } from '@polkadot/extension-polkagate/src/components/index';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { useIsExtensionPopup } from '@polkadot/extension-polkagate/src/hooks';
import { ExtensionPopups, STORAGE_KEY, TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { useTranslation } from '../../../components/translate';
import useIsTestnetEnabled from '../../../hooks/useIsTestnetEnabled';
import { tieAccount } from '../../../messaging';
import Warning from './Warning';

export default function EnableTestNet (): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const isTestnetEnabled = useIsTestnetEnabled();
  const isExtension = useIsExtensionPopup();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const onEnableTestNetClick = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    checked
      ? extensionPopupOpener(ExtensionPopups.WARNING)()
      : setStorage(STORAGE_KEY.TEST_NET_ENABLED, false).catch(console.error);
  }, [extensionPopupOpener]);

  const onEnableTestDone = useCallback(() => {
    extensionPopupCloser();

    setStorage(STORAGE_KEY.TEST_NET_ENABLED, true).catch(console.error);
    accounts?.forEach(({ address, genesisHash }) => {
      if (genesisHash && TEST_NETS.includes(genesisHash)) {
        // NO TIE ANYMORE IN NEW DESIGN
        tieAccount(address, null).catch(console.error);
      }
    });
  }, [accounts, extensionPopupCloser]);

  return (
    <Stack direction='column'>
      <Typography
        color={isExtension ? 'label.secondary' : 'text.primary'}
        fontSize={isExtension ? undefined : '22px'}
        m={isExtension ? '5px 0 12px' : '40px 0 15px'}
        sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }}
        variant='H-4'
      >
        {t('Test Networks')}
      </Typography>
      <MySwitch
        checked={Boolean(isTestnetEnabled)}
        columnGap='8px'
        label={t('Show Test Networks')}
        onChange={onEnableTestNetClick}
      />
      <Warning
        onClose={extensionPopupCloser}
        onConfirm={onEnableTestDone}
        open={extensionPopup === ExtensionPopups.WARNING}
      />
    </Stack>
  );
}
