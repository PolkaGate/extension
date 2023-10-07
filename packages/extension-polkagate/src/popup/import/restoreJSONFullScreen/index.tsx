// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ResponseJsonGetAccountInfo } from '@polkadot/extension-base/background/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { u8aToString } from '@polkadot/util';

import { ActionContext, Address, InputFileWithLabel, Label, Password, TwoButtons, Warning, WrongPasswordAlert } from '../../../components';
import { useFullscreen, useTranslation } from '../../../hooks';
import { batchRestore, jsonGetAccountInfo, jsonRestore } from '../../../messaging';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import { isKeyringPairs$Json } from '../../../util/typeGuards';
import { FullScreenHeader } from '../../governance/FullScreenHeader';

const acceptedFormats = ['application/json', 'text/plain'].join(', ');

export default function RestoreJson (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
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

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);

  const passChange = useCallback((pass: string): void => {
    setPassword(pass);
    setIsPasswordError(false);
  }, []);

  const onChangeFile = useCallback((file: Uint8Array): void => {
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
  }, []);

  const onRestore = useCallback((): void => {
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
  }, [file, onAction, password, requirePassword]);

  const onBack = useCallback(() => {
    setFile(undefined);
    setStep(true);
    setIsPasswordError(false);
    setPassword('');
  }, []);

  const onCloseTab = useCallback(() => window.close(), []);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <vaadin-icon icon='vaadin:file-text' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t<string>('Restore From File')}
              </Typography>
            </Grid>
          </Grid>
          {stepOne &&
            <Typography fontSize='16px' fontWeight={400} width='100%'>
              {t<string>('Upload a JSON file containing the account(s) you previously exported from this extension or other compatible extensions/wallets.')}
            </Typography>
          }
          {isPasswordError && !stepOne &&
            <WrongPasswordAlert />
          }
          {!stepOne && accountsInfo.length &&
            <Label
              label={t<string>('Accounts')}
              style={{ margin: '20px auto 0' }}
            >
              <Grid container direction='column' sx={{ '> .tree:first-child': { borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }, '> .tree:last-child': { border: 'none', borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }, border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight: parent.innerHeight * 1 / 3, overflowY: 'scroll' }}>
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
            </Label>
          }
          <InputFileWithLabel
            accept={acceptedFormats}
            isError={isFileError}
            label={stepOne ? t<string>('Upload your file') : t<string>('Backup JSON file')}
            labelStyle={{ marginBlock: '20px', width: '100%' }}
            onChange={onChangeFile}
            reset={stepOne}
            style={{ m: '7px 0', width: '100%' }}
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
            <Grid container item>
              <Password
                isError={isPasswordError}
                label={t<string>('Password for this file')}
                onChange={passChange}
                onEnter={onRestore}
                style={{ marginTop: '15px', width: '100%' }}
              />
            </Grid>
          )}
          <Grid container item justifyContent='flex-end' pt='15px'>
            <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
              <TwoButtons
                disabled={stepOne || !password || isPasswordError}
                isBusy={isBusy}
                mt='1px'
                onPrimaryClick={onRestore}
                onSecondaryClick={stepOne
                  ? onCloseTab
                  : onBack}
                primaryBtnText={t<string>('Restore')}
                secondaryBtnText={stepOne
                  ? t<string>('Close Tab')
                  : t<string>('Back')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
