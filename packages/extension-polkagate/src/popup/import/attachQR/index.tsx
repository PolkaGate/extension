// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { QrScanAddress } from '@polkadot/react-qr';

import { AccountContext, AccountNamePasswordCreation, ActionContext, Address, PButton, Warning } from '../../../components';
import { useTranslation } from '../../../hooks';
import { createAccountExternal, createAccountSuri, createSeed } from '../../../messaging';
import HeaderBrand from '../../../partials/HeaderBrand';
import Name from '../../../partials/Name';

interface QrAccount {
  content: string;
  genesisHash: string;
  isAddress: boolean;
  name?: string;
}

export default function AttachQR(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [account, setAccount] = useState<QrAccount | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [genesisHash, setGenesisHash] = useState<string | null>(null);
  const [invalidQR, setInvalidQR] = useState<boolean>();

  const [stepOne, setStep] = useState(true);

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  const _onCreate = useCallback(() => {
    if (account && name) {
      if (account.isAddress) {
        createAccountExternal(name, account.content, account.genesisHash)
          .then(() => onAction('/'))
          .catch((error: Error) => console.error(error));
      } else if (password) {
        createAccountSuri(name, password, account.content, 'sr25519', account.genesisHash)
          .then(() => onAction('/'))
          .catch((error: Error) => console.error(error));
      }
    }
  }, [account, name, onAction, password]);

  const _setAccount = useCallback(
    (qrAccount: QrAccount) => {
      setAccount(qrAccount);
      setName(qrAccount?.name || null);
      setGenesisHash(qrAccount.genesisHash);
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

  const _onBackClick = useCallback(() => {
    if (stepOne) {
      onAction('/');
    } else {
      setStep(true);
      setAccount(null);
    }
  }, [onAction, stepOne]);

  const _onError = useCallback((error: string) => {
    console.log('error:', error)
    setInvalidQR(String(error).includes('Invalid prefix'));
  }, []);

  const _onOkay = useCallback(() => {
    setInvalidQR(false);
  }, []);

  const QRWarning = () => (
    <Grid item container direction='column' justifyContent='center' alignItems='center' fontSize={14} pt='30px' pb='80px' border={1.5} mx='28px' borderColor='warning.main'>
      <Grid item>
        <Warning
          isDanger
        >
          {t('Invalid QR code.')}
        </Warning>
      </Grid>
      <Grid item>
        {t('Please try another one.')}
      </Grid>
      <Button
        onClick={_onOkay}
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
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Attach QR-signer')}
        withSteps={{
          current: `${stepOne ? 1 : 2}`,
          total: 2
        }}
      />
      {stepOne &&
        <div>
          <Typography
            fontSize='14px'
            fontWeight={300}
            m='auto'
            pt='20px'
            textAlign='center'
            width='92%'
          >
            {t('Scan address QR code')}
          </Typography>
          <Grid
            alignItems='center'
            border='1px dashed'
            borderColor='secondary.light'
            borderRadius='5px'
            boxSizing='border-box'
            container
            fontSize='16px'
            height='328px'
            justifyContent='center'
            m='10px 15px'
            sx={{ backgroundColor: 'background.paper' }}
            width='328px'
          >
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
          <Typography
            fontSize='14px'
            fontWeight={300}
            m='auto'
            pt='20px'
            textAlign='center'
            width='92%'
          >
            {t('Hold the QR code in front of the device’s camera')}
          </Typography>
        </div>
      }
      {
        !stepOne && account &&
        <Address
          address={address}
          name={name}
        />
      }
      {
        !stepOne && account &&
        (
          account?.isAddress
            ? (
              <div>
                <Name
                  isFocused
                  onChange={setName}
                  value={name || ''}
                />
                <PButton
                  _onClick={_onCreate}
                  _variant='contained'
                  disabled={!name}
                  text={t<string>('Add account')}
                />
              </div>
            )
            : (
              <AccountNamePasswordCreation
                buttonLabel={t<string>('Add account')}
                onCreate={_onCreate}
                onNameChange={setName}
                onPasswordChange={setPassword}
              />)
        )
      }
    </>
  );
}
