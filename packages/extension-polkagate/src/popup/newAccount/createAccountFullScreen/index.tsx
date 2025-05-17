// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import { User } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DEFAULT_TYPE } from '@polkadot/extension-polkagate/src/util/defaultType';

import { DecisionButtons, GlowCheckbox, GradientButton, MatchPasswordField, Motion, MyTextField } from '../../../components';
import { setStorage } from '../../../components/Loading';
import { OnboardTitle } from '../../../fullscreen/components/index';
import AdaptiveLayout from '../../../fullscreen/components/layout/AdaptiveLayout';
import { useTranslation } from '../../../hooks';
import { PROFILE_TAGS } from '../../../hooks/useProfileAccounts';
import { createAccountSuri, createSeed } from '../../../messaging';
import MnemonicSeedDisplay from './components/MnemonicSeedDisplay';

enum STEP {
  SEED,
  DETAIL
}

function CreateAccount (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const [seed, setSeed] = useState<null | string>(null);
  const [name, setName] = useState<string | null | undefined>();
  const [password, setPassword] = useState<string>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false);
  const [step, setStep] = useState(STEP.SEED);

  useEffect((): void => {
    createSeed(undefined)
      .then(({ seed }): void => {
        setSeed(seed);
      })
      .catch(console.error);
  }, []);

  const onNameChange = useCallback((enteredName: string) => {
    const trimmedName = enteredName.replace(/^\s+/, '');
    const cleanedName = trimmedName.replace(/\s{2,}/g, ' ');

    setName(cleanedName);
  }, []);

  const onSetPassword = useCallback(async () => {
    // Example logic to handle password setting
    await Promise.resolve(''); // Replace with actual logic if needed
  }, []);

  const onCheck = useCallback(() => {
    setIsMnemonicSaved(!isMnemonicSaved);
  }, [isMnemonicSaved]);

  const onContinue = useCallback(() => {
    setStep(STEP.DETAIL);
  }, []);

  const onCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const onCreate = useCallback(() => {
    if (name && password && seed) {
      setIsBusy(true);

      createAccountSuri(name, password, seed, DEFAULT_TYPE)
        .then(() => {
          setStorage('profile', PROFILE_TAGS.LOCAL).catch(console.error);
          navigate('/');
        })
        .catch((error: Error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [name, navigate, password, seed]);

  return (
    <AdaptiveLayout>
      <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ zIndex: 1 }}>
        <OnboardTitle
          label={t('Create a new account')}
          labelPartInColor={t('a new account')}
          url='/onboarding'
        />
        {step === STEP.SEED &&
          <>
            <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1' width='480px'>
              {t('In order to create a new account you are given a 12-word recovery phrase which needs to be recorded and saved in a safe place. The recovery phrase can be used to restore your wallet. Keep it carefully to not lose your assets.')}
            </Typography>
            <MnemonicSeedDisplay seed={seed} style={{ marginBlock: '20px' }} />
            <Stack alignItems='center' columnGap='20px' direction='row' sx={{ marginTop: '25px' }}>
              <GradientButton
                contentPlacement='center'
                disabled={!isMnemonicSaved}
                onClick={onContinue}
                showChevron
                style={{
                  borderRadius: '18px',
                  height: '44px',
                  width: '236px'
                }}
                text={t('Continue')}
              />
              <GlowCheckbox
                changeState={onCheck}
                checked={isMnemonicSaved}
                disabled={isBusy}
                label={t('I have saved my recovery phrase safely')}
                labelPartInColor={t('my recovery phrase safely')}
                labelStyle={{ ...theme.typography['B-1'] }}
              />
            </Stack>
          </>
        }
        {step === STEP.DETAIL &&
          <Motion variant='slide'>
            <MyTextField
              Icon={User}
              focused
              iconSize={18}
              onTextChange={onNameChange}
              placeholder={t('Enter account name')}
              style={{ margin: '40px 0 20px' }}
              title={t('Choose a name for this account')}
            />
            <MatchPasswordField
              onSetPassword={onSetPassword}
              setConfirmedPassword={setPassword}
              spacing='20px'
              style={{ marginBottom: '20px' }}
              title1={t('Password for this account')}
              title2={t('Repeat the password')}
            />
            <DecisionButtons
              cancelButton
              direction='horizontal'
              disabled={!password}
              isBusy={isBusy}
              onPrimaryClick={onCreate}
              onSecondaryClick={onCancel}
              primaryBtnText={t('Create account')}
              secondaryBtnText={t('Cancel')}
              showChevron
              style={{ flexDirection: 'row-reverse', mt: '40px' }}
            />
          </Motion>
        }
      </Stack>
    </AdaptiveLayout>
  );
}

export default React.memo(CreateAccount);
