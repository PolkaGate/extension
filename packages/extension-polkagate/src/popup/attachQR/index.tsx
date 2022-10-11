// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ResponseJsonGetAccountInfo } from '@polkadot/extension-base/background/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';
import { QrScanAddress } from '@polkadot/react-qr';

import { Box, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { u8aToString } from '@polkadot/util';

import { AccountContext, ActionContext, InputFileWithLabel, InputWithLabel, Warning } from '../../../../extension-ui/src/components';
import { DEFAULT_TYPE } from '../../../../extension-ui/src/util/defaultType';
import { isKeyringPairs$Json } from '../../../../extension-ui/src/util/typeGuards';
import Address from '../../components/Address'
import PButton from '../../components/PButton';
import { useTranslation } from '../../hooks';
import { batchRestore, jsonGetAccountInfo, jsonRestore } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { createAccountExternal, createAccountSuri, createSeed } from '../../messaging';

const acceptedFormats = ['application/json', 'text/plain'].join(', ');

interface Props {
  className?: string;
}

interface QrAccount {
  content: string;
  genesisHash: string;
  isAddress: boolean;
  name?: string;
}

export default function AttachQR({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [account, setAccount] = useState<QrAccount | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const [stepOne, setStep] = useState(true);
  const [isPasswordError, setIsPasswordError] = useState(false);

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  const _onChangePass = useCallback(
    (pass: string): void => {
      setPassword(pass);
      setIsPasswordError(false);
    }, []
  );

  const _setAccount = useCallback(
    (qrAccount: QrAccount) => {
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

  const _onBackClick = useCallback(() => {
    if (stepOne) {
      onAction('/');
    } else {
      setStep(true);
    }
  }, [onAction, stepOne]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>(`Attach QR-signer (${stepOne ? 1 : 2}/2)`)}
      />
      {isPasswordError && !stepOne &&
        <Grid
          color='red'
          height='30px'
          m='auto'
          pt='5px'
          width='92%'
        >
          <Warning
            isBelowInput
            isDanger
          >
            {t<string>('You’ve used an incorrect password. Try again.')}
          </Warning>
        </Grid>
      }
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
          <QrScanAddress
            onScan={_setAccount}
            size={272}
          />
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
    </>
  );
}
