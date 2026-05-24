// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';

import { Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { User } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { OnboardTitle } from '@polkadot/extension-polkagate/src/fullscreen/components/index';
import AdaptiveLayout from '@polkadot/extension-polkagate/src/fullscreen/components/layout/AdaptiveLayout';
import { keyring } from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { DecisionButtons, MatchPasswordField, Motion, MyTextField, PasswordInput } from '../../../components';
import { useLocalAccounts, useTranslation } from '../../../hooks';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import { type AccountInfo, STEP } from '../../newAccount/createAccountFullScreen/types';
import { useAccountImportOrCreate } from '../../newAccount/createAccountFullScreen/useAccountImportOrCreate';
import MyPhraseArea from '../importSeedFullScreen/MyPhraseArea';

export default function ImportRawSeed(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const localAccounts = useLocalAccounts();

  const [seed, setSeed] = useState<string>('');
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  const validateSeed = useCallback(async(seed: string, type?: KeypairType): Promise<AccountInfo> => {
    if (!(seed.startsWith('0x') && seed.length === 66)) {
      throw new Error('The raw seed is invalid. It should be 66 characters long and start with 0x');
    }

    const { pair } = keyring.addUri(seed, undefined, {}, type || DEFAULT_TYPE);

    return {
      address: pair.address,
      genesis: POLKADOT_GENESIS,
      suri: seed
    };
  }, []);

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

    // validate the raw seed using the hook
    onValidateSeed(seed)
      .then((validatedAccount) => {
        if (validatedAccount) {
          setAccount(validatedAccount);
          setAddress(validatedAccount.address);
        } else {
          setAccount(null);
          setAddress('');
        }
      }).catch(console.error);
  }, [seed, onValidateSeed, setError]);

  const onImport = useCallback(async() => {
    try {
      await onConfirm({ seed: account?.suri });
    } catch (e) {
      console.error(e);
    }
  }, [account, onConfirm]);

  const onNameChange = useCallback((enteredName: string): void => {
    setName(enteredName ?? null);
  }, [setName]);

  const onCancel = useCallback(() => navigate('/') as void, [navigate]);
  const onContinue = useCallback(() => {
    setStep(STEP.DETAIL);
  }, [setStep]);

  const onBack = useCallback(() => {
    if (step === STEP.DETAIL) {
      setStep(STEP.SEED);
    } else {
      setSeed('');
      setAccount(null);
      setAddress('');
      setName(undefined);
      setPassword('');
      setError(undefined);
      navigate('/account/have-wallet') as void;
    }
  }, [navigate, setError, setName, setPassword, setStep, step]);

  return (
    <AdaptiveLayout style={{ maxWidth: '600px' }}>
      <OnboardTitle
        label={t('Import from raw seed')}
        labelPartInColor={t('raw seed')}
        onBack={onBack}
      />
      <Stack direction='column' sx={{ mt: '15px', position: 'relative', width: '500px' }}>
        {step === STEP.SEED &&
          <>
            <Typography color='#BEAAD8' sx={{ textAlign: 'left' }} variant='B-1'>
              {t('Enter your account\'s raw seed to seamlessly import it into the extension wallet, giving you quick and secure access to your assets and transactions.')}
            </Typography>
            <MyPhraseArea
              isCorrect={!!account?.address && !error}
              label={t('Raw seed starting with 0x')}
              seed={seed}
              setSeed={setSeed}
            />
            {!!error && !!seed &&
              <Typography color='#FF4FB9' sx={{ textAlign: 'left', width: '70%' }} variant='B-1'>
                {error}
              </Typography>
            }
            <DecisionButtons
              cancelButton
              direction='horizontal'
              disabled={!!error || !seed}
              onPrimaryClick={onContinue}
              onSecondaryClick={onBack}
              primaryBtnText={t('Continue')}
              secondaryBtnText={t('Cancel')}
              showChevron
              style={{ flexDirection: 'row-reverse', height: '48px', margin: '15px 0 0', width: '74%' }}
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
                onSetPassword={(password && name && !error && !!seed) ? onImport : undefined}
                setConfirmedPassword={setPassword}
                spacing='20px'
                style={{ marginBottom: '20px' }}
                title1={t('Password')}
                title2={t('Repeat the password')}
              />
              )
              : (<PasswordInput
                hasError={!!error}
                onEnterPress={onImport}
                onPassChange={setPassword}
                style={{ marginBottom: '25px', marginTop: '35px' }}
                title={t('Password to secure this account')}
              />
              )
            }
            <DecisionButtons
              cancelButton
              direction='horizontal'
              disabled={!password || !name || !address || !account}
              isBusy={isBusy}
              onPrimaryClick={onImport}
              onSecondaryClick={onCancel}
              primaryBtnText={t('Import')}
              secondaryBtnText={t('Cancel')}
              showChevron
              style={{ flexDirection: 'row-reverse', marginTop: '15px', position: 'absolute', width: 'inherit' }}
            />
          </Motion>
        }
      </Stack>
    </AdaptiveLayout>
  );
}
