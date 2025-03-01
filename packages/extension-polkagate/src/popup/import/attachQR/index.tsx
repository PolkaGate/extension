// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { HexString } from '@polkadot/util/types';

import { Button, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { QrScanAddress } from '@polkadot/react-qr';

import { AccountNamePasswordCreation, ActionContext, Address, PButton, Warning } from '../../../components';
import { useTranslation } from '../../../hooks';
import { createAccountExternal, createAccountSuri, createSeed, updateMeta } from '../../../messaging';
import HeaderBrand from '../../../partials/HeaderBrand';
import Name from '../../../partials/Name';
import { POLKADOT_GENESIS_HASH } from '../../../util/constants';

export interface ScanType {
  isAddress: boolean;
  content: string;
  genesisHash: HexString | null;
  name?: string | undefined;
}

export default function AttachQR(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [account, setAccount] = useState<ScanType | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [invalidQR, setInvalidQR] = useState<boolean>();
  const [stepOne, setStep] = useState(true);

  const setQrLabelAndGoToHome = useCallback(() => {
    const metaData = JSON.stringify({ isQR: true });

    updateMeta(String(address), metaData).then(() => {
      setStorage('profile', PROFILE_TAGS.QR_ATTACHED).catch(console.error);
      onAction('/');
    }).catch(console.error);
  }, [address, onAction]);

  const onCreate = useCallback(() => {
    if (account && name) {
      if (account.isAddress) {
        createAccountExternal(name, account.content, account.genesisHash ?? POLKADOT_GENESIS_HASH)
          .then(() => setQrLabelAndGoToHome())
          .catch((error: Error) => console.error(error));
      } else if (password) {
        createAccountSuri(name, password, account.content, 'sr25519', account.genesisHash ?? POLKADOT_GENESIS_HASH)
          .then(() => setQrLabelAndGoToHome())
          .catch((error: Error) => console.error(error));
      }
    }
  }, [account, name, password, setQrLabelAndGoToHome]);

  const _setAccount = useCallback(
    (qrAccount: ScanType) => {
      setAccount(qrAccount);
      setName(qrAccount?.name || null);
      setStep(false);

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

  const onBackClick = useCallback(() => {
    if (stepOne) {
      onAction('/');
    } else {
      setStep(true);
      setAccount(null);
    }
  }, [onAction, stepOne]);

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
        {t('Okay')}
      </Button>
    </Grid>
  );

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        showBackArrow
        text={t('Attach QR-signer')}
        withSteps={{
          current: `${stepOne ? 1 : 2}`,
          total: 2
        }}
      />
      {stepOne &&
        <>
          <Typography fontSize='14px' fontWeight={300} m='auto' pt='20px' textAlign='center' width='92%'>
            {t('Scan address QR code')}
          </Typography>
          <Grid alignItems='center' border='1px dashed' borderColor='secondary.light' borderRadius='5px' boxSizing='border-box' container fontSize='16px' height='328px' justifyContent='center' m='10px 15px' sx={{ backgroundColor: 'background.paper' }} width='328px'>
            {!account &&
              <>
                {!invalidQR
                  ? <QrScanAddress
                    onError={_onError}
                    onScan={_setAccount}
                    size={272}
                  />
                  : <QRWarning />
                }
              </>
            }
          </Grid>
          <Typography fontSize='14px' fontWeight={300} m='auto' pt='20px' textAlign='center' width='92%' >
            {t('Hold the QR code in front of the device’s camera')}
          </Typography>
        </>
      }
      {!stepOne && account &&
        <Address
          address={address}
          name={name}
        />
      }
      {!stepOne && account &&
        (
          account?.isAddress
            ? <>
              <Name
                isFocused
                onChange={setName}
                value={name || ''}
              />
              <PButton
                _onClick={onCreate}
                _variant='contained'
                disabled={!name}
                text={t('Add account')}
              />
            </>
            : <AccountNamePasswordCreation
              buttonLabel={t('Add account')}
              onCreate={onCreate}
              onNameChange={setName}
              onPasswordChange={setPassword}
            />
        )
      }
    </>
  );
}
