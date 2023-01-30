// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ResponseJsonGetAccountInfo } from '@polkadot/extension-base/background/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { u8aToString } from '@polkadot/util';

import { AccountContext, ActionContext, Address, InputFileWithLabel, Password, PButton, Warning, WrongPasswordAlert } from '../../../components';
import { useTranslation } from '../../../hooks';
import { batchRestore, jsonGetAccountInfo, jsonRestore } from '../../../messaging';
import HeaderBrand from '../../../partials/HeaderBrand';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import { isKeyringPairs$Json } from '../../../util/typeGuards';

const acceptedFormats = ['application/json', 'text/plain'].join(', ');

export default function RestoreJson(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [stepOne, setStep] = useState(true);
  const [accountsInfo, setAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);
  const [password, setPassword] = useState<string>('');
  const [isFileError, setFileError] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  // don't use the info from the file directly
  // rather use what comes from the background from jsonGetAccountInfo
  const [file, setFile] = useState<KeyringPair$Json | KeyringPairs$Json | undefined>(undefined);
  const theme = useTheme();

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  const _onChangePass = useCallback(
    (pass: string): void => {
      setPassword(pass);
      setIsPasswordError(false);
    }, []
  );

  const NULL_FUNCTION = useCallback(() => null, []);

  const _onChangeFile = useCallback(
    (file: Uint8Array): void => {
      setAccountsInfo(() => []);

      let json: KeyringPair$Json | KeyringPairs$Json | undefined;

      try {
        json = JSON.parse(u8aToString(file)) as KeyringPair$Json | KeyringPairs$Json;
        setFile(json);
        setStep(false);
        setFileError(false);
      } catch (e) {
        console.error(e);
        setFileError(true);
      }

      if (json === undefined) {
        return;
      }

      if (isKeyringPairs$Json(json)) {
        setRequirePassword(true);
        json.accounts.forEach((account) => {
          setAccountsInfo((old) => [...old, {
            address: account.address,
            genesisHash: account.meta.genesisHash,
            name: account.meta.name
          } as ResponseJsonGetAccountInfo]);
        });
      } else {
        setRequirePassword(true);
        jsonGetAccountInfo(json)
          .then((accountInfo) => setAccountsInfo((old) => [...old, accountInfo]))
          .catch((e) => {
            setFileError(true);
            console.error(e);
          });
      }
    }, []
  );

  const _onRestore = useCallback(
    (): void => {
      if (!file) {
        return;
      }

      if (requirePassword && !password) {
        return;
      }

      setIsBusy(true);

      (isKeyringPairs$Json(file) ? batchRestore(file, password) : jsonRestore(file, password))
        .then(() => {
          onAction('/');
        })
        .catch((e) => {
          console.error(e);
          setIsBusy(false);
          setIsPasswordError(true);
        });
    },
    [file, onAction, password, requirePassword]
  );

  const _onBackClick = useCallback(() => {
    if (stepOne) {
      onAction('/');
    } else {
      setFile(undefined);
      setStep(true);
    }
  }, [onAction, stepOne]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Restore From JSON')}
        withSteps={{
          current: `${stepOne ? 1 : 2}`,
          total: 2
        }}
      />
      {isPasswordError && !stepOne &&
        <WrongPasswordAlert />
      }
      {!stepOne && accountsInfo.length &&
        <Grid container direction='column' sx={{ '&::-webkit-scrollbar': { display: 'none', width: 0 }, '> .tree:first-child': { borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }, '> .tree:last-child': { border: 'none', borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }, border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', m: '20px auto 0', maxHeight: parent.innerHeight * 1 / 3, overflowY: 'scroll', scrollbarWidth: 'none', width: '92%' }}>
          {accountsInfo.map(({ address, genesisHash, name, type = DEFAULT_TYPE }, index) => (
            <Address
              address={address}
              className='tree'
              genesisHash={genesisHash}
              key={`${index}:${address}`}
              name={name}
              style={{
                border: 'none',
                borderBottom: '1px solid',
                borderBottomColor: 'secondary.light',
                borderRadius: 'none',
                m: 0,
                width: '100%'
              }}
              type={type}
            />
          ))}
        </Grid>
      }
      {stepOne &&
        <Typography fontSize='14px' fontWeight={300} m='20px auto' textAlign='left' width='88%'>
          {t<string>('Upload a JSON file containing your account(s) previously exported from this extension.')}
        </Typography>
      }
      <InputFileWithLabel
        accept={acceptedFormats}
        isError={isFileError}
        label={stepOne ? t<string>('Upload your file') : t<string>('Backup JSON file')}
        onChange={_onChangeFile}
        reset={stepOne}
        withLabel
      />
      {isFileError && (
        <Warning
          isDanger
          theme={theme}
        >
          {t<string>('Invalid Json file')}
        </Warning>
      )}
      {requirePassword && !stepOne && (
        <Grid m='auto' pt='10px' width='92%'>
          <Password
            isError={isPasswordError}
            isFocused
            label={t<string>('Password for this file')}
            onChange={_onChangePass}
            onEnter={stepOne || !password || password.length <= 3 ? NULL_FUNCTION : _onRestore}
          />
          {isPasswordError && (
            <Warning
              isBelowInput
              isDanger
              theme={theme}
            >
              {t<string>('incorrect password')}
            </Warning>
          )}
        </Grid>
      )}
      <PButton
        _isBusy={isBusy}
        _onClick={_onRestore}
        _variant='contained'
        disabled={stepOne || !password || password.length <= 3}
        text={t<string>('Restore')}
      />
    </>
  );
}
