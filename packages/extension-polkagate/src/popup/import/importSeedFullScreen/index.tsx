// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Collapse, Stack, Typography } from '@mui/material';
import { More, User } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardTitle } from '@polkadot/extension-polkagate/src/fullscreen/components/index';
import AdaptiveLayout from '@polkadot/extension-polkagate/src/fullscreen/components/layout/AdaptiveLayout';

import { DecisionButtons, MatchPasswordField, Motion, MyTextField, PasswordInput } from '../../../components';
import { useLocalAccounts, useTranslation } from '../../../hooks';
import { validateSeed } from '../../../messaging';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import { STEP } from '../../newAccount/createAccountFullScreen/types';
import { useAccountImportOrCreate } from '../../newAccount/createAccountFullScreen/useAccountImportOrCreate';
import MyPhraseArea from './MyPhraseArea';

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

export default function ImportSeed(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const localAccounts = useLocalAccounts();

  const [seed, setSeed] = useState<string>('');
  const [account, setAccount] = useState<AccountInfo | null | undefined>(null);
  const [path, setPath] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const { error,
    isBusy,
    name,
    onConfirm,
    onValidateSeed,
    password,
    setError,
    setName,
    setPassword,
    setStep,
    step } = useAccountImportOrCreate({ validator: validateSeed });

  useEffect(() => {
    if (!seed) {
      setAccount(null);
      setError(undefined);

      return;
    }

    const suri = `${seed || ''}${path || ''}`;

    onValidateSeed(suri, DEFAULT_TYPE)
      .then((acc) => setAccount(acc)).catch(console.error);
  }, [t, seed, path, setAccount, onValidateSeed, setError]);

  const onCreate = useCallback(async () => {
    if (!account?.suri) {
      return;
    }

    try {
      await onConfirm({ seed: account.suri });
    } catch (e) {
      console.error(e);
    }
  }, [account, onConfirm]);

  const onNameChange = useCallback((enteredName: string): void => {
    setName(enteredName ?? null);
  }, [setName]);

  const onCancel = useCallback(() => navigate('/') as void, [navigate]);
  const toggleMore = useCallback(() => setShowAdvanced(!showAdvanced), [showAdvanced]);

  const onContinue = useCallback(() => {
    setStep(STEP.DETAIL);
  }, [setStep]);

  const onBack = useCallback(() => {
    if (step === STEP.DETAIL) {
      setStep(STEP.SEED);
    } else {
      setSeed('');
      setAccount(null);
      setPath(null);
      setShowAdvanced(false);
      setName(undefined);
      setPassword('');
      setError(undefined);
      navigate('/account/have-wallet') as void;
    }
  }, [navigate, setError, setName, setPassword, setStep, step]);

  return (
    <AdaptiveLayout style={{ maxWidth: '600px' }}>
      <OnboardTitle
        label={t('Import from recovery phrase')}
        labelPartInColor={t('recovery phrase')}
        onBack={onBack}
      />
      <Stack direction='column' sx={{ mt: '15px', position: 'relative', width: '525px' }}>
        {step === STEP.SEED &&
          <>
            <Typography color='#BEAAD8' sx={{ textAlign: 'left' }} variant='B-1'>
              {t('Enter your account\'s recovery phrase (mnemonic seed) to seamlessly import it into the extension wallet, giving you quick and secure access to your assets and transactions.')}
            </Typography>
            <MyPhraseArea
              isCorrect={!!account?.address && !error}
              label={t('Existing 12 or 24-word recovery phrase')}
              seed={seed}
              setSeed={setSeed}
            />
            {!!error && !!seed &&
              <Typography color='#FF4FB9' sx={{ textAlign: 'left' }} variant='B-1'>
                {error}
              </Typography>
            }
            <Collapse in={!!seed}>
              <Stack alignItems='center' columnGap='3px' direction='row' justifyContent='flex-start' onClick={toggleMore} sx={{ bgcolor: showAdvanced ? '#BEAAD8' : '#2D1E4A', borderRadius: '8px', m: '15px 0 10px 0 ', p: '4px 6px', width: 'fit-content' }}>
                <More color={showAdvanced ? '#05091C' : '#BEAAD8'} size='18' style={{ rotate: showAdvanced ? '180deg' : '90deg', transition: 'all 250ms ease-out' }} variant='Linear' />
                <Typography sx={{ color: showAdvanced ? '#05091C' : '#BEAAD8', cursor: 'pointer', userSelect: 'none' }} variant='B-2'>
                  {t('Advanced')}
                </Typography>
              </Stack>
              <Collapse in={showAdvanced}>
                <Typography color={'#BEAAD8'} sx={{ textAlign: 'left' }} variant='B-1'>
                  {t('To import a specific account, use a derivation path like //0, //1, etc.')}
                </Typography>
                <MyTextField
                  focused
                  iconSize={18}
                  inputValue={path}
                  onTextChange={setPath}
                  placeholder='//'
                  style={{ margin: '15px 0 15px', width: '70%' }}
                  title={t('Derivation path')}
                />
              </Collapse>
            </Collapse>
            <DecisionButtons
              cancelButton
              direction='horizontal'
              disabled={!!error || !seed}
              onPrimaryClick={onContinue}
              onSecondaryClick={onBack}
              primaryBtnText={t('Continue')}
              secondaryBtnText={t('Cancel')}
              showChevron
              style={{ flexDirection: 'row-reverse', margin: '15px 0 0', width: '70%' }}
            />
          </>
        }
        {step === STEP.DETAIL &&
          <Motion style={{ width: '370px' }} variant='slide'>
            <MyTextField
              Icon={User}
              focused
              iconSize={18}
              inputValue={name}
              onTextChange={onNameChange}
              placeholder={t('Enter account name')}
              style={{ margin: '20px 0 20px' }}
              title={t('Choose a name for this account')}
            />
            {localAccounts?.length === 0
              ? (<MatchPasswordField
                onSetPassword={(password && name && !error && !!seed) ? onCreate : undefined}
                setConfirmedPassword={setPassword}
                spacing='20px'
                style={{ marginBottom: '20px' }}
                title1={t('Password')}
                title2={t('Repeat the password')}
              />
              )
              : (<PasswordInput
                hasError={!!error}
                onEnterPress={onCreate}
                onPassChange={setPassword}
                style={{ marginBottom: '25px', marginTop: '35px' }}
                title={t('Password to secure this account')}
              />
              )
            }
            <DecisionButtons
              cancelButton
              direction='horizontal'
              disabled={!password || !name || !account}
              isBusy={isBusy}
              onPrimaryClick={onCreate}
              onSecondaryClick={onCancel}
              primaryBtnText={t('Import')}
              secondaryBtnText={t('Cancel')}
              showChevron
              style={{ flexDirection: 'row-reverse', position: 'absolute', width: 'inherit' }}
            />
          </Motion>
        }
      </Stack>
    </AdaptiveLayout>
  );
}
