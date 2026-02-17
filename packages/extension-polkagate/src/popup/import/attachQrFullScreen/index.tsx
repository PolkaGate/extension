// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { Grid, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { Camera, User, Warning2 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { OnboardTitle } from '@polkadot/extension-polkagate/src/fullscreen/components/index';
import AdaptiveLayout from '@polkadot/extension-polkagate/src/fullscreen/components/layout/AdaptiveLayout';
import { PROFILE_TAGS, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { switchToOrOpenTab } from '@polkadot/extension-polkagate/src/util/switchToOrOpenTab';
import { QrScanAddress } from '@polkadot/react-qr';

import { ActionButton, Address, DecisionButtons, MyTextField } from '../../../components';
import { useFullscreen, useTranslation } from '../../../hooks';
import { createAccountExternal, updateMeta } from '../../../messaging';

export interface ScanType {
  isAddress: boolean;
  content: string;
  genesisHash: HexString | null;
  name?: string | undefined;
}

export default function AttachQrFullScreen(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();

  const [account, setAccount] = useState<ScanType | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [invalidQR, setInvalidQR] = useState<boolean>();

  const setQrLabelAndGoToHome = useCallback(() => {
    const metaData = JSON.stringify({ isQR: true });

    account?.content && updateMeta(account.content, metaData).then(() => {
      setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.QR_ATTACHED).catch(console.error);
      setStorage(STORAGE_KEY.CHECK_BALANCE_ON_ALL_CHAINS, true).catch(console.error);
      switchToOrOpenTab('/', true);
    }).catch(console.error);
  }, [account]);

  const onImport = useCallback(() => {
    if (account?.isAddress && name) {
      createAccountExternal(name, account.content, account.genesisHash ?? POLKADOT_GENESIS)
        .then(() => setQrLabelAndGoToHome())
        .catch((error: Error) => console.error(error));
    }
  }, [account, name, setQrLabelAndGoToHome]);

  const _setAccount = useCallback((qrAccount: ScanType) => {
    if (!qrAccount.isAddress) {
      return;
    }

    setAccount(qrAccount);
    setInvalidQR(false);
    setName(qrAccount?.name || null);
  }, []);

  const onCancel = useCallback(() => switchToOrOpenTab('/', true), []);

  const _onError = useCallback((error: Error) => {
    setInvalidQR(String(error).includes('Invalid prefix'));
  }, []);

  const QRWarning = () => (
    <Stack alignItems='center' columnGap='2px' direction='row' sx={{ mt: '10px' }}>
      <Warning2 color='#FF4FB9' size='20px' variant='Bold' />
      <Typography sx={{ color: '#FF4FB9', textAlign: 'left' }} variant='B-4'>
        {t('Invalid QR code.')}
      </Typography>
      <Typography sx={{ color: '#FF4FB9' }} variant='B-4'>
        {t('Please try another one.')}
      </Typography>
    </Stack>
  );

  return (
    <AdaptiveLayout style={{ width: '600px' }}>
      <OnboardTitle
        label={t('Attach QR-signer')}
        labelPartInColor={t('QR-signer')}
        url='/account/have-wallet'
      />
      <Stack direction='column' sx={{ mt: '15px', position: 'relative', width: '500px' }}>
        <Typography color='#BEAAD8' sx={{ mb: '15px', textAlign: 'left' }} variant='B-1'>
          {!account
            ? t('Import an account from your QR signer, such as Polkadot Vault.')
            : t('The account fetched via the scanned QR code.')
          }
        </Typography>
        {!account
          ? <>
            <Grid container sx={{ mb: '15px' }}>
              <QrScanAddress
                onError={_onError}
                onScan={_setAccount}
                style={{
                  background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '14px', height: 'fit-content', minHeight: '200Px', padding: '3px', width: '272px'
                }}
              />
              {invalidQR && <QRWarning />}
            </Grid>
            <Stack alignItems='center' direction='row' justifyContent='flex-start'>
              <Typography color='#BEAAD8' sx={{ textAlign: 'left' }} variant='B-1'>
                {t('Hold the QR code in front of your ')}
              </Typography>
              <Camera color='#AA83DC' size={16} style={{ marginLeft: '4px', marginRight: '4px' }} variant='Bold' />
              <Typography color='#AA83DC' variant='B-1'>
                {t('device’s camera')}
              </Typography>
            </Stack>
            <ActionButton
              contentPlacement='center'
              onClick={onCancel}
              style={{ height: '44px', marginTop: '20px', width: '40%' }}
              text={t('Cancel')}
            />
          </>
          : <Stack direction='column' sx={{ height: '245px', position: 'relative', zIndex: '1' }}>
            <Address
              address={account?.content}
              genesisHash={account?.genesisHash}
              name={name}
              style={{ margin: '5px auto 10px' }}
              width='100%'
            />
            <MyTextField
              Icon={User}
              focused
              iconSize={18}
              inputValue={name ?? ''}
              onEnterPress={onImport}
              onTextChange={setName}
              placeholder={t('Enter account name')}
              style={{ margin: '5px 0 0' }}
              title={t('Choose a name for this account')}
            />
            <DecisionButtons
              cancelButton
              direction='horizontal'
              disabled={!name}
              onPrimaryClick={onImport}
              onSecondaryClick={onCancel}
              primaryBtnText={t('Add account')}
              secondaryBtnText={t('Cancel')}
              showChevron
              style={{ bottom: 0, flexDirection: 'row-reverse', position: 'absolute', width: '65%' }}
            />
          </Stack>
        }
      </Stack>
    </AdaptiveLayout>
  );
}
