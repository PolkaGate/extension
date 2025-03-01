// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { HexString } from '@polkadot/util/types';
import type { ScanType } from '../attachQR';

import { Button, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import { QrScanAddress } from '@polkadot/react-qr';

import { AccountNamePasswordCreation, Address, PButton, TwoButtons, VaadinIcon, Warning } from '../../../components';
import FullScreenHeader from '../../../fullscreen/governance/FullScreenHeader';
import { Title } from '../../../fullscreen/sendFund/InputPage';
import { useFullscreen, useTranslation } from '../../../hooks';
import { createAccountExternal, createAccountSuri, createSeed, updateMeta } from '../../../messaging';
import { Name } from '../../../partials';

export default function AttachQrFullScreen(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();

  const [account, setAccount] = useState<ScanType | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [invalidQR, setInvalidQR] = useState<boolean>();

  const setQrLabelAndGoToHome = useCallback(() => {
    const metaData = JSON.stringify({ isQR: true });

    updateMeta(String(address), metaData).then(() => {
      setStorage('profile', PROFILE_TAGS.QR_ATTACHED).catch(console.error);
      openOrFocusTab('/', true);
    }).catch(console.error);
  }, [address]);

  const onAttach = useCallback(() => {
    if (account && name) {
      if (account.isAddress) {
        createAccountExternal(name, account.content, account.genesisHash as HexString)
          .then(() => setQrLabelAndGoToHome())
          .catch((error: Error) => console.error(error));
      } else if (password) {
        createAccountSuri(name, password, account.content, 'sr25519', account.genesisHash as HexString)
          .then(() => setQrLabelAndGoToHome())
          .catch((error: Error) => console.error(error));
      }
    }
  }, [account, name, password, setQrLabelAndGoToHome]);

  const _setAccount = useCallback(
    (qrAccount: ScanType) => {
      setAccount(qrAccount);
      setName(qrAccount?.name || null);

      if (qrAccount.isAddress) {
        setAddress(qrAccount.content);
      } else {
        createSeed(undefined, qrAccount.content)
          .then(({ address }) => setAddress(address))
          .catch(console.error);
      }
    },
    []
  );

  const onCancel = useCallback(() => window.close(), []);

  const _onError = useCallback((error: Error) => {
    setInvalidQR(String(error).includes('Invalid prefix'));
  }, []);

  const onOkay = useCallback(() => {
    setInvalidQR(false);
  }, []);

  const QRWarning = () => (
    <Grid alignItems='center' border={1.5} borderColor='warning.main' container direction='column' fontSize={14} item justifyContent='center' mx='28px' pb='80px' pt='30px'>
      <Grid item>
        <Warning
          isDanger
          theme={theme}
        >
          {t('Invalid QR code.')}
        </Warning>
      </Grid>
      <Grid item>
        {t('Please try another one.')}
      </Grid>
      <Button
        onClick={onOkay}
        sx={{
          borderColor: 'secondary.main',
          borderRadius: '5px',
          fontSize: 18,
          fontWeight: 400,
          height: '36px',
          mt: '25px',
          textTransform: 'none',
          width: '60%'
        }}
        variant='contained'
      >
        {t<string>('Okay')}
      </Button>
    </Grid>
  );

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '10%' }}>
          <Title
            height='85px'
            logo={
              <VaadinIcon icon='vaadin:qrcode' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
            }
            text={t('Attach QR-signer')}
          />
          {!account &&
            <Grid alignItems='center' container justifyContent='center'>
              <Typography fontSize='16px' m='auto' pt='40px' textAlign='center' width='92%'>
                {t('Scan account QR code')}
              </Typography>
              <Grid alignItems='center' border='1px dashed' borderColor='secondary.light' borderRadius='5px' boxSizing='border-box' container fontSize='16px' height='328px' justifyContent='center' m='10px 15px' sx={{ backgroundColor: 'background.paper' }} width='328px'>
                {!invalidQR
                  ? <QrScanAddress
                    onError={_onError}
                    onScan={_setAccount}
                    size={272}
                  />
                  : <QRWarning />
                }
              </Grid>
              <Typography fontSize='16px' fontWeight={300} m='auto' pt='20px' textAlign='center' width='92%'>
                {t('Hold the QR code in front of the device’s camera')}
              </Typography>
              <PButton
                _ml={0}
                _mt='30px'
                _onClick={onCancel}
                _variant='contained'
                _width={100}
                text={t('Cancel')}
              />
            </Grid>
          }
          {account &&
            <>
              <Grid alignItems='center' container justifyContent='flex-start'>
                <Typography fontSize='16px' fontWeight={500} pt='40px'>
                  {t('The account fetched via the scanned QR code.')}
                </Typography>
              </Grid>
              <Address
                address={address}
                name={name}
                width='100%'
              />
              {
                account?.isAddress
                  ? <>
                    <Name
                      isFocused
                      onChange={setName}
                      style={{ width: '100%' }}
                      value={name || ''}
                    />
                    <Grid container item justifyContent='flex-end' pt='40px'>
                      <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
                        <TwoButtons
                          disabled={!name}
                          mt='1px'
                          onPrimaryClick={onAttach}
                          onSecondaryClick={onCancel}
                          primaryBtnText={t('Add account')}
                          secondaryBtnText={t('Cancel')}
                        />
                      </Grid>
                    </Grid>
                  </>
                  : <AccountNamePasswordCreation
                    buttonLabel={t('Add account')}
                    mt='40px'
                    onBackClick={onCancel}
                    onCreate={onAttach}
                    onNameChange={setName}
                    onPasswordChange={setPassword}
                    style={{ width: '100%' }}
                    withCancel
                  />
              }
            </>
          }
        </Grid>
      </Grid>
    </Grid>
  );
}
