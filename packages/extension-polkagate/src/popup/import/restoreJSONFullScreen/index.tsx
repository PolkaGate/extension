// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ResponseJsonGetAccountInfo } from '@polkadot/extension-base/background/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';
import { stringToU8a, u8aToString } from '@polkadot/util';
import { jsonDecrypt, jsonEncrypt } from '@polkadot/util-crypto';

import { Address, InputFileWithLabel, Password, TwoButtons, VaadinIcon, Warning, WrongPasswordAlert } from '../../../components';
import FullScreenHeader from '../../../fullscreen/governance/FullScreenHeader';
import { useFullscreen, useTranslation } from '../../../hooks';
import { batchRestore, jsonGetAccountInfo, jsonRestore, updateMeta } from '../../../messaging';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import { isKeyringPairs$Json } from '../../../util/typeGuards';
import { pgBoxShadow } from '../../../util/utils';
import { resetOnForgotPassword } from '../../newAccount/createAccountFullScreen/resetAccounts';

const acceptedFormats = ['application/json', 'text/plain'].join(', ');

export default function RestoreJson(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();

  const [isBusy, setIsBusy] = useState(false);
  const [stepOne, setStep] = useState(true);
  const [accountsInfo, setAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);
  const [password, setPassword] = useState<string>('');
  const [isFileError, setFileError] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedAccountsInfo, setSelectedAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);
  const [showCheckbox, setShowCheckbox] = useState<boolean>(false);

  // don't use the info from the file directly
  // rather use what comes from the background from jsonGetAccountInfo
  const [file, setFile] = useState<KeyringPair$Json | KeyringPairs$Json | undefined>(undefined);

  const areAllSelected = useMemo(() =>
    selectedAccountsInfo.length === accountsInfo.length
    , [selectedAccountsInfo.length, accountsInfo.length]);

  const handleCheck = useCallback((_event: React.ChangeEvent<HTMLInputElement>, address: string) => {
    const selectedAccount = accountsInfo.find((account) => account.address === address);

    if (!selectedAccount) {
      return;
    }

    const isAlreadySelected = selectedAccountsInfo.some((account) => account.address === address);

    const updatedSelectedAccountsInfo = isAlreadySelected
      ? selectedAccountsInfo.filter((account) => account.address !== address) // remove an item on deselect
      : [...selectedAccountsInfo, selectedAccount]; // add an item on select

    setSelectedAccountsInfo(updatedSelectedAccountsInfo);
  }, [accountsInfo, selectedAccountsInfo, setSelectedAccountsInfo]);

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
      setShowCheckbox(true);
      const accounts = json.accounts.map((account) => ({
        address: account.address,
        genesisHash: account.meta.genesisHash,
        name: account.meta.name
      } as ResponseJsonGetAccountInfo));

      setAccountsInfo(accounts);
      setSelectedAccountsInfo(accounts);
    } else {
      setRequirePassword(true);
      setShowCheckbox(false);
      jsonGetAccountInfo(json)
        .then((accountInfo) => setAccountsInfo((old) => [...old, accountInfo]))
        .catch((e) => {
          setFileError(true);
          console.error(e);
        });
    }
  }, []);

  const filterAndEncryptFile = useCallback(async (jsonFile: KeyringPairs$Json, selected: string[]) => {
    const decryptedFile = jsonDecrypt(jsonFile, password);
    const unlockedAccounts = JSON.parse(u8aToString(decryptedFile)) as KeyringPair$Json[];
    const filteredAccounts = unlockedAccounts.filter(({ address }) => selected.includes(address));
    const fileAsU8a = stringToU8a(JSON.stringify(filteredAccounts));

    return jsonEncrypt(fileAsU8a, jsonFile.encoding.content, password) as KeyringPairs$Json;
  }, [password]);

  const handleKeyringPairsJson = useCallback(async (jsonFile: KeyringPairs$Json) => {
    const selected = selectedAccountsInfo.map(({ address }) => address);
    let encryptFile = jsonFile;
    let accountToAddTime = accountsInfo.map(({ address }) => address);

    if (selected.length !== accountsInfo.length) {
      accountToAddTime = selected;
      encryptFile = await filterAndEncryptFile(encryptFile, selected);
    }

    await batchRestore(encryptFile, password);
    const updateMetaList = accountToAddTime.map((address) => updateMeta(address, JSON.stringify({ addedTime: Date.now() })));

    await Promise.all(updateMetaList);
  }, [accountsInfo, filterAndEncryptFile, password, selectedAccountsInfo]);

  const handleRegularJson = useCallback(async (jsonFile: KeyringPair$Json) => {
    await jsonRestore(jsonFile, password);
  }, [password]);

  const onRestore = useCallback(async (): Promise<void> => {
    if (!file || (requirePassword && !password)) {
      return;
    }

    setIsBusy(true);

    try {
      await resetOnForgotPassword();

      if (isKeyringPairs$Json(file)) {
        await handleKeyringPairsJson(file);
      } else {
        await handleRegularJson(file);
      }

      await setStorage('profile', PROFILE_TAGS.ALL);
      openOrFocusTab('/', true);
    } catch (error) {
      console.error(error);
      setIsPasswordError(true);
    } finally {
      setIsBusy(false);
    }
  }, [file, requirePassword, password, handleKeyringPairsJson, handleRegularJson]);

  const onSelectDeselectAll = useCallback(() => {
    areAllSelected
      ? setSelectedAccountsInfo([]) // deselect all
      : setSelectedAccountsInfo(accountsInfo); // select all
  }, [areAllSelected, accountsInfo, setSelectedAccountsInfo]);

  const onBack = useCallback(() => {
    setFile(undefined);
    setStep(true);
    setIsPasswordError(false);
    setPassword('');
  }, []);

  const onCancel = useCallback(() => window.close(), []);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '10%' }}>
          <Title
            height='100px'
            logo={
              <VaadinIcon icon='vaadin:file-text' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
            }
            text={t('Restore from file')}
          />
          {stepOne &&
            <Typography fontSize='16px' fontWeight={400} width='100%'>
              {t('Upload a JSON file containing the account(s) you previously exported from this extension or other compatible extensions/wallets.')}
            </Typography>
          }
          {isPasswordError && !stepOne &&
            <WrongPasswordAlert />
          }
          {!stepOne && accountsInfo.length &&
            <>
              <Typography fontSize='16px' fontWeight={400} sx={{ mt: '10px' }} width='100%'>
                {accountsInfo?.length === 1
                  ? t('Import the account into the extension')
                  : t('Select accounts to import into the extension')
                }
              </Typography>
              <Grid
                container
                direction='column'
                sx={{ '> .tree:first-child': { borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }, '> .tree:last-child': { border: 'none', borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }, border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: pgBoxShadow(theme), display: 'block', maxHeight: parent.innerHeight * 2 / 5, overflowY: 'scroll' }}
              >
                {accountsInfo.map(({ address, genesisHash, name, type = DEFAULT_TYPE }, index) => {
                  const isSelected = !!selectedAccountsInfo.find(({ address: _address }) => _address === address);

                  return (
                    <Address
                      address={address}
                      check={isSelected}
                      className='tree'
                      genesisHash={genesisHash}
                      handleCheck={handleCheck}
                      key={`${index}:${address}`}
                      name={name}
                      showCheckbox={showCheckbox}
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
                  );
                })}
              </Grid>
              {showCheckbox &&
                <Grid item onClick={onSelectDeselectAll} width='fit-content'>
                  <Typography
                    fontSize='16px'
                    fontWeight={400}
                    sx={{ color: theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: 'pointer', textAlign: 'left', textDecorationLine: 'underline', ml: '10px', mt: '5px', userSelect: 'none', width: 'fit-content' }}
                  >
                    {areAllSelected ? t('Deselect All') : t('Select All')}
                  </Typography>
                </Grid>
              }
            </>
          }
          <InputFileWithLabel
            accept={acceptedFormats}
            isError={isFileError}
            label={stepOne ? t('Upload your file') : t('File name')}
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
              {t('Invalid Json file')}
            </Warning>
          )}
          {requirePassword && !stepOne && (
            <Grid container item>
              <Password
                isError={isPasswordError}
                isFocused
                label={t('Password for this file')}
                onChange={passChange}
                onEnter={onRestore}
                style={{ marginTop: '15px', width: '100%' }}
              />
            </Grid>
          )}
          <Grid container item justifyContent='flex-end' pt='15px'>
            <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
              <TwoButtons
                disabled={stepOne || !password || isPasswordError || (showCheckbox && selectedAccountsInfo.length === 0)}
                isBusy={isBusy}
                mt='1px'
                onPrimaryClick={onRestore}
                onSecondaryClick={stepOne
                  ? onCancel
                  : onBack}
                primaryBtnText={t('Restore')}
                secondaryBtnText={stepOne
                  ? t('Cancel')
                  : t('Back')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
