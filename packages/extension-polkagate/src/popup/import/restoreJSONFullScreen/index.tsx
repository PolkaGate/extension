// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ResponseJsonGetAccountInfo } from '@polkadot/extension-base/background/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';

import { Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import AdaptiveLayout from '@polkadot/extension-polkagate/src/fullscreen/components/layout/AdaptiveLayout';
import OnboardTitle from '@polkadot/extension-polkagate/src/fullscreen/components/OnboardTitle';
import { AUTO_LOCK_PERIOD_DEFAULT, PROFILE_TAGS, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { stringToU8a, u8aToString } from '@polkadot/util';
import { jsonDecrypt, jsonEncrypt } from '@polkadot/util-crypto';

import { AccountContext, ActionButton, Address, DecisionButtons, InputFile, PasswordInput, Warning } from '../../../components';
import { useAlerts, useTranslation } from '../../../hooks';
import { batchRestore, jsonGetAccountInfo, jsonRestore, unlockAllAccounts, updateMeta } from '../../../messaging';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import { isKeyringPairs$Json } from '../../../util/typeGuards';
import { resetOnForgotPassword } from '../../newAccount/createAccountFullScreen/resetAccounts';

const acceptedFormats = ['application/json', 'text/plain'].join(', ');

export interface JsonGetAccountInfo extends ResponseJsonGetAccountInfo {
  isExternal?: boolean;
}

export default function RestoreJson (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { accounts: maybeExistingAccounts } = useContext(AccountContext);
  const { notify } = useAlerts();

  const [isBusy, setIsBusy] = useState(false);
  const [stepOne, setStep] = useState(true);
  const [accountsInfo, setAccountsInfo] = useState<JsonGetAccountInfo[]>([]);
  const [password, setPassword] = useState<string>('');
  const [isFileError, setFileError] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedAccountsInfo, setSelectedAccountsInfo] = useState<JsonGetAccountInfo[]>([]);

  // don't use the info from the file directly
  // rather use what comes from the background from jsonGetAccountInfo
  const [file, setFile] = useState<KeyringPair$Json | KeyringPairs$Json | undefined>(undefined);

  const showCheckbox = accountsInfo.length > 1;
  const areAllSelected = selectedAccountsInfo.length === accountsInfo.length;

  const handleCheck = useCallback((_event: boolean, address: string) => {
    const selectedAccount = accountsInfo.find((a) => a.address === address);

    if (!selectedAccount) {
      return;
    }

    setSelectedAccountsInfo((prev) =>
      prev.some((a) => a.address === address) // if is already selected
        ? prev.filter((a) => a.address !== address) // remove the item on deselect
        : [...prev, selectedAccount] // add an item on select
    );
  }, [accountsInfo, setSelectedAccountsInfo]);

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
      const accs = json.accounts.map(({ address, meta: { genesisHash, isExternal, name } }) => ({
        address,
        genesisHash,
        isExternal,
        name: name ?? 'Unknown'
      } as JsonGetAccountInfo));

      setAccountsInfo(accs);
      setSelectedAccountsInfo(accs);
    } else {
      setRequirePassword(true);
      jsonGetAccountInfo(json)
        .then((accountInfo) => {
          setSelectedAccountsInfo([accountInfo]);
          setAccountsInfo([accountInfo]);
        })
        .catch((e) => {
          setFileError(true);
          console.error(e);
        });
    }
  }, []);

  const filterAndEncryptFile = useCallback(async (jsonFile: KeyringPairs$Json, selected: string[]) => {
    const decryptedFile = jsonDecrypt(jsonFile, password);
    const parsedFile = JSON.parse(u8aToString(decryptedFile)) as KeyringPair$Json[];
    const filteredAccounts = parsedFile.filter(({ address }) => selected.includes(address));
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
    const updateMetaList = accountToAddTime.map((address) => updateMeta(address, JSON.stringify({ addedTime: Date.now(), genesisHash: null })));

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
      const resetOk = await resetOnForgotPassword();

      if (!resetOk) {
         setIsBusy(false);

         notify(t('Failed to reset accounts'), 'error');

         return;
       }

      if (isKeyringPairs$Json(file)) {
        await handleKeyringPairsJson(file);
      } else {
        await handleRegularJson(file);
      }

      await setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.ALL);

      // handle master password
      const localAccountsToUnlock = [
        ...selectedAccountsInfo,
        ...maybeExistingAccounts as JsonGetAccountInfo[]
      ].filter((a, index, self) =>
        !a.isExternal && self.findIndex((x) => x.address === a.address) === index
      );

      if (localAccountsToUnlock.length > 0) {
        const success = await unlockAllAccounts(password, AUTO_LOCK_PERIOD_DEFAULT * 60 * 1000, false);

        if (success) {
          setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true) as unknown as void;
          navigate('/') as void;
        } else {
          navigate('/migratePasswords') as void;
        }
      }
    } catch (error) {
      console.error(error);
      setIsPasswordError(true);
      setIsBusy(false);
    }
  }, [file, requirePassword, password, selectedAccountsInfo, maybeExistingAccounts, notify, t, handleKeyringPairsJson, handleRegularJson, navigate]);

  const onSelectDeselectAll = useCallback(() => {
    setSelectedAccountsInfo((prev) =>
      prev.length === accountsInfo.length
        ? [] // deselect all
        : accountsInfo// select all
    );
  }, [accountsInfo, setSelectedAccountsInfo]);

  const onBack = useCallback(() => {
    setFile(undefined);
    setStep(true);
    setIsPasswordError(false);
    setPassword('');
  }, []);

  const onCancel = useCallback(() => navigate('/'), [navigate]);

  return (
    <AdaptiveLayout style={{ maxWidth: '600px' }}>
      <OnboardTitle
        label={t('Restore from file')}
        labelPartInColor={t('from file')}
        url='/account/have-wallet'
      />
      <Stack direction='column' sx={{ position: 'relative', width: '500px' }}>
        {stepOne &&
          <Typography color='#BEAAD8' sx={{ my: '15px', textAlign: 'left', width: '369px' }} variant='B-1'>
            {t('Upload a JSON file containing the account(s) you previously exported from this extension or other compatible extensions/wallets.')}
          </Typography>
        }
        {!stepOne && accountsInfo.length &&
          <>
            <Typography color='#BEAAD8' sx={{ my: '15px', textAlign: 'left' }} variant='B-1' width='100%'>
              {accountsInfo?.length === 1
                ? t('Import the account into the extension')
                : t('Select accounts to import into the extension')
              }
            </Typography>
            {showCheckbox &&
              <ActionButton
                contentPlacement='center'
                onClick={onSelectDeselectAll}
                style={{
                  '& .MuiButton-startIcon': {
                    marginRight: '0px'
                  },
                  borderRadius: '8px',
                  height: '32px',
                  marginBottom: '10px',
                  width: 'fit-content'
                }}
                text={areAllSelected
                  ? t('Deselect all ({{num}}) accounts', { replace: { num: accountsInfo.length } })
                  : t('Select all ({{num}}) accounts', { replace: { num: accountsInfo.length } })
                }
                variant='contained'
              />
            }
            <Stack direction='column' sx={{ display: 'block', maxHeight: 'calc(100vh - 665px)', overflowY: 'auto' }}>
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
                      borderRadius: '12px',
                      mb: '10px',
                      mt: 0,
                      width: '100%'
                    }}
                    type={type}
                  />
                );
              })}
            </Stack>
          </>
        }
        <InputFile
          accept={acceptedFormats}
          isError={isFileError}
          onBack={onBack}
          onChange={onChangeFile}
          reset={stepOne}
          style={{ m: '15px 0', width: '369px' }}
        />
        {isFileError &&
          <Warning
            isDanger
            theme={theme}
          >
            {t('Invalid Json file')}
          </Warning>
        }
        {requirePassword && !stepOne &&
          <PasswordInput
            focused
            hasError={isPasswordError}
            onEnterPress={onRestore}
            onPassChange={passChange}
            style={{ marginTop: '15px' }}
            title={t('Password for this file')}
          />
        }
        <DecisionButtons
          cancelButton
          direction='horizontal'
          disabled={stepOne || !password || isPasswordError || (showCheckbox && selectedAccountsInfo.length === 0)}
          isBusy={isBusy}
          onPrimaryClick={onRestore}
          onSecondaryClick={stepOne ? onCancel : onBack}
          primaryBtnText={t('Restore')}
          secondaryBtnText={stepOne ? t('Cancel') : t('Back')}
          showChevron
          style={{ flexDirection: 'row-reverse', margin: '15px 0 0', width: '74%' }}
        />
      </Stack>
    </AdaptiveLayout>
  );
}
