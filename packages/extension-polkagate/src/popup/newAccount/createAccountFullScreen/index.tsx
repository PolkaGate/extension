// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import { User } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useIsPasswordCorrect from '@polkadot/extension-polkagate/src/hooks/useIsPasswordCorrect';
import { PROFILE_TAGS, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { DEFAULT_TYPE } from '@polkadot/extension-polkagate/src/util/defaultType';

import { DecisionButtons, GlowCheckbox, GradientButton, MatchPasswordField, Motion, MyTextField, PasswordInput } from '../../../components';
import { setStorage } from '../../../components/Loading';
import { OnboardTitle } from '../../../fullscreen/components/index';
import AdaptiveLayout from '../../../fullscreen/components/layout/AdaptiveLayout';
import { useTranslation } from '../../../hooks';
import { createAccountSuri, createSeed } from '../../../messaging';
import MnemonicSeedDisplay from './components/MnemonicSeedDisplay';

enum STEP {
  SEED,
  DETAIL
}

export function SetNameAndPassword ({ seed }: { seed: string | null }): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState<string | null | undefined>();
  const [password, setPassword] = useState<string>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isWrongPassword, setWrongPassword] = useState<boolean>(false);
  const { hasNoLocalAccounts, validatePasswordAsync } = useIsPasswordCorrect();

  useEffect(() => {
    setWrongPassword(false);
  }, [password]);

  const onNameChange = useCallback((enteredName: string) => {
    const trimmedName = enteredName.replace(/^\s+/, '');
    const cleanedName = trimmedName.replace(/\s{2,}/g, ' ');

    setName(cleanedName);
  }, []);

  const onCancel = useCallback(() => {
    navigate('/') as void;
  }, [navigate]);

  const preConditions = name && password && seed;

  const onCreate = useCallback(async () => {
    if (!preConditions) {
      return;
    }

    setIsBusy(true);
    const isPasswordCorrect = await validatePasswordAsync(password);

    if (!isPasswordCorrect) {
      setWrongPassword(!isPasswordCorrect);
      setIsBusy(false);

      return;
    }

    try {
      await createAccountSuri(name, password, seed, DEFAULT_TYPE);
      await setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.LOCAL).catch(console.error);
      await setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true) as unknown as void;
      await navigate('/');
    } catch (error) {
      setIsBusy(false);
      console.error(error);
    }
  }, [name, navigate, password, preConditions, seed, validatePasswordAsync]);

  return (
    <Motion style={{ width: '370px' }} variant='slide'>
      <MyTextField
        Icon={User}
        focused
        iconSize={18}
        inputValue={name}
        onTextChange={onNameChange}
        placeholder={t('Enter account name')}
        style={{ margin: '40px 0 20px' }}
        title={t('Choose a name for this account')}
      />
      {hasNoLocalAccounts
        ? (<MatchPasswordField
          onSetPassword={onCreate}
          setConfirmedPassword={setPassword}
          spacing='20px'
          style={{ marginBottom: '20px' }}
          title1={t('Password for this account')}
          title2={t('Repeat the password')}
           />
        )
        : (<PasswordInput
          hasError={isWrongPassword}
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
        disabled={!password}
        isBusy={isBusy}
        onPrimaryClick={onCreate}
        onSecondaryClick={onCancel}
        primaryBtnText={t('Create account')}
        secondaryBtnText={t('Cancel')}
        showChevron
        style={{ flexDirection: 'row-reverse', marginTop: '15px', position: 'absolute', width: 'inherit' }}
      />
    </Motion>
  );
}

function CreateAccount (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [seed, setSeed] = useState<null | string>(null);
  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false);
  const [step, setStep] = useState(STEP.SEED);

  useEffect((): void => {
    createSeed(undefined)
      .then(({ seed }): void => {
        setSeed(seed);
      })
      .catch(console.error);
  }, []);

  const onCheck = useCallback(() => {
    setIsMnemonicSaved(!isMnemonicSaved);
  }, [isMnemonicSaved]);

  const onContinue = useCallback(() => {
    setStep(STEP.DETAIL);
  }, []);

  return (
    <AdaptiveLayout style={{ maxWidth: '582px' }}>
      <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ position: 'relative', zIndex: 1 }}>
        <OnboardTitle
          label={t('Create a new account')}
          labelPartInColor={t('a new account')}
          url='/onboarding'
        />
        {step === STEP.SEED &&
          <>
            <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1' width='480px'>
              {t('In order to create a new account you are given a 12-word recovery phrase which needs to be recorded and saved in a safe place. The recovery phrase can be used to restore your account. Keep it carefully to not lose your assets.')}
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
                  width: '355px'
                }}
                text={t('Continue')}
              />
              <GlowCheckbox
                changeState={onCheck}
                checked={isMnemonicSaved}
                label={t('I have saved my recovery phrase safely')}
                labelPartInColor={t('my recovery phrase safely')}
                labelStyle={{ ...theme.typography['B-1'] }}
              />
            </Stack>
          </>
        }
        {step === STEP.DETAIL &&
          <SetNameAndPassword seed={seed} />
        }
      </Stack>
    </AdaptiveLayout>
  );
}

export default React.memo(CreateAccount);
