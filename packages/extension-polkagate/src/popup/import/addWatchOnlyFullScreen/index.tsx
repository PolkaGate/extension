// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { User } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { OnboardTitle } from '@polkadot/extension-polkagate/src/fullscreen/components/index';
import AdaptiveLayout from '@polkadot/extension-polkagate/src/fullscreen/components/layout/AdaptiveLayout';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { SELECTED_PROFILE_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';
import { switchToOrOpenTab } from '@polkadot/extension-polkagate/src/util/switchToOrOpenTab';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AddressInput, DecisionButtons, MyTextField } from '../../../components';
import { useFullscreen, useTranslation } from '../../../hooks';
import { createAccountExternal } from '../../../messaging';

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

export default function AddWatchOnlyFullScreen(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();

  const [isBusy, setIsBusy] = useState(false);
  const [realAddress, setRealAddress] = useState<string | null | undefined>();
  const [name, setName] = useState<string | null | undefined>();

  useEffect(() => {
    cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  const onAdd = useCallback(() => {
    if (name && realAddress) {
      setIsBusy(true);

      createAccountExternal(name, realAddress, undefined)
        .then(() => {
          setStorage(SELECTED_PROFILE_NAME_IN_STORAGE, PROFILE_TAGS.WATCH_ONLY).catch(console.error);
        })
        .finally(() =>
          switchToOrOpenTab('/', true)
        )
        .catch((error: Error) => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [name, realAddress]);

  const onCancel = useCallback(() => switchToOrOpenTab('/', true), []);
  const onNameChange = useCallback((name: string | null) => setName(name), []);

  return (
    <AdaptiveLayout style= {{ width: '600px' }}>
      <OnboardTitle
        label={t('Add Watch-only account')}
        labelPartInColor='Watch-only'
        url='/account/have-wallet'
      />
      <Stack direction='column' sx={{ mt: '15px', position: 'relative', width: '500px', zIndex: 1 }}>
        <Typography color='#BEAAD8' sx={{ mb: '15px', textAlign: 'left' }} variant='B-1'>
          {t('Enter the watch-only address. It can also serve as a proxied account, but without transaction signing. A proxy account in the extension is needed for signing.')}
        </Typography>
        <AddressInput
          addWithQr
          address={realAddress}
          label={t('Account ID')}
          setAddress={setRealAddress}
          style={{ m: '30px 0 0', width: '370px' }}
        />
        <MyTextField
          Icon={User}
          iconSize={18}
          onEnterPress = {onAdd}
          onTextChange={onNameChange}
          placeholder={t('Enter account name')}
          style={{ margin: '20px 0 0', width: '370px' }}
          title={t('Choose a name for this account')}
        />
        <DecisionButtons
          cancelButton
          direction='horizontal'
          disabled={!name || !realAddress}
          isBusy={isBusy}
          onPrimaryClick={onAdd}
          onSecondaryClick={onCancel}
          primaryBtnText={t('Add account')}
          secondaryBtnText={t('Cancel')}
          showChevron
          style={{ flexDirection: 'row-reverse', margin: '25px 0 0', width: '370px' }}
        />
      </Stack>
    </AdaptiveLayout>
  );
}
