// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ResponseJsonGetAccountInfo } from '@polkadot/extension-base/background/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { u8aToString } from '@polkadot/util';

import { AccountContext, ActionContext, InputFileWithLabel, InputWithLabel, Warning } from '../../components';
import Address from '../../components/Address'
import PButton from '../../components/PButton';
import { useTranslation } from '../../hooks';
import { batchRestore, jsonGetAccountInfo, jsonRestore } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { DEFAULT_TYPE } from '../../util/defaultType';
import { isKeyringPairs$Json } from '../../util/typeGuards';

const acceptedFormats = ['application/json', 'text/plain'].join(', ');

interface Props {
  className?: string;
}

export default function RestoreJson({ className }: Props): React.ReactElement {
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

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  const _onChangePass = useCallback(
    (pass: string): void => {
      setPassword(pass);
      setIsPasswordError(false);
    }, []
  );

  const _onChangeFile = useCallback(
    (file: Uint8Array): void => {
      setAccountsInfo(() => []);

      let json: KeyringPair$Json | KeyringPairs$Json | undefined;

      try {
        json = JSON.parse(u8aToString(file)) as KeyringPair$Json | KeyringPairs$Json;
        setFile(json);
        setStep(false);
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
        text={t<string>(`Restore from JSON (${stepOne ? 1 : 2}/2)`)}
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
      {!stepOne && accountsInfo.length &&
        <Grid
          container
          direction='column'
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none',
              width: 0
            },
            '> .tree:first-child': {
              borderTopLeftRadius: '5px',
              borderTopRightRadius: '5px'
            },
            '> .tree:last-child': {
              border: 'none',
              borderBottomLeftRadius: '5px',
              borderBottomRightRadius: '5px'
            },
            border: '0.5px solid',
            borderColor: 'secondary.light',
            borderRadius: '5px',
            display: 'block',
            m: '20px auto 0',
            maxHeight: parent.innerHeight / 2,
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            width: '92%'
          }}
        >
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
        >
          {t<string>('Invalid Json file')}
        </Warning>
      )}
      {requirePassword && !stepOne && (
        <Grid
          pt='10px'
          m='auto'
          width='92%'
        >
          <InputWithLabel
            isError={isPasswordError}
            label={t<string>('Password for this file')}
            onChange={_onChangePass}
            type='password'
          />
          {isPasswordError && (
            <Warning
              isBelowInput
              isDanger
            >
              {t<string>('incorrect password')}
            </Warning>
          )}
        </Grid>
      )}
      <PButton
        _onClick={_onRestore}
        _variant='contained'
        disabled={stepOne || !password}
        text={t<string>('Restore')}
      />
    </>
  );
}
