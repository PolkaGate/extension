// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowLeft2, User } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { POLKADOT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';
import { DEFAULT_TYPE } from '@polkadot/extension-polkagate/src/util/defaultType';

import { ActionButton, DecisionButtons, GlowCheckbox, GradientButton, MatchPasswordField, Motion, MyTextField } from '../../../components';
import { setStorage } from '../../../components/Loading';
import Framework from '../../../fullscreen/onboarding/Framework';
import { useFullscreen, useIsDark, useTranslation } from '../../../hooks';
import { PROFILE_TAGS } from '../../../hooks/useProfileAccounts';
import { createAccountSuri, createSeed } from '../../../messaging';
import CopySeedButton from './components/CopySeedButton';
import DownloadSeedButton from './components/DownloadSeedButton';
import IllustrateSeed from './components/IllustrateSeed';

const MnemonicSeedDisplay = ({ seed, style }: { style?: SxProps<Theme>, seed: null | string }) => {
  const { t } = useTranslation();

  return (
    <Grid container display='block' item sx={style}>
      <Stack alignItems='center' columnGap='5px' direction='row'>
        <Typography mr='5px' textAlign='left' variant='B-2'>
          {t('Generated')}<span style={{ color: '#BEAAD8', marginLeft: '5px' }}>{t('12-word recovery phrase')} </span>
        </Typography>
        <DownloadSeedButton
          style={{ width: 'fit-content' }}
          value={seed ?? ''}
        />
        <CopySeedButton
          style={{ width: 'fit-content' }}
          value={seed ?? ''}
        />
      </Stack>
      <IllustrateSeed seed={seed} style={{ marginTop: '10px' }} />
    </Grid>
  );
};

function Title (): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const onHome = useCallback(() => openOrFocusTab('/', true), []);

  return (
    <Stack alignContent='start' alignItems='center' columnGap='10px' direction='row' justifyContent='start' width='100%'>
      <ActionButton
        StartIcon={ArrowLeft2}
        contentPlacement='start'
        iconAlwaysBold
        iconSize={24}
        onClick={onHome}
        style={{
          '& .MuiButton-startIcon': {
            marginLeft: '5px',
            marginRight: '0px'
          },
          '&:hover': {
            background: isDark ? '#674394' : '#EFF1F9',
            transition: 'all 250ms ease-out'
          },
          background: isDark ? '#BFA1FF26' : '#FFFFFF',
          borderRadius: '10px',
          height: '36px',
          minWidth: '0px',
          padding: 0,
          width: '36px'
        }}
        variant='contained'
      />
      <Typography alignSelf='end' textAlign='left' textTransform='uppercase' variant='H-1' width='100%'>
        {t('Create')}<span style={{ color: '#BEAAD8', marginLeft: '5px' }}>{t('A new account')} </span>
      </Typography>
    </Stack>
  );
}

enum STEP {
  SEED,
  DETAIL
}

function CreateAccount (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();

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

  const onSetPassword = useCallback((enteredPassword: string | undefined) => {
    setPassword(enteredPassword);
  }, []);

  const onCheck = useCallback(() => {
    setIsMnemonicSaved(!isMnemonicSaved);
  }, [isMnemonicSaved]);

  const onContinue = useCallback(() => {
    setStep(STEP.DETAIL);
  }, []);

  const onCancel = useCallback(() => {
    openOrFocusTab('/', true);
  }, []);

  const onCreate = useCallback(() => {
    if (name && password && seed) {
      setIsBusy(true);

      createAccountSuri(name, password, seed, DEFAULT_TYPE, POLKADOT_GENESIS_HASH)
        .then(() => {
          setStorage('profile', PROFILE_TAGS.LOCAL).catch(console.error);
          openOrFocusTab('/', true);
        })
        .catch((error: Error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [name, password, seed]);

  return (
    <Framework>
      <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ zIndex: 1 }}>
        <Title />
        {step === STEP.SEED &&
          <>
            <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1' width='480px'>
              {t('In order to create a new account you are given a 12-word recovery phrase which needs to be recorded and saved in a safe place. The recovery phrase can be used to restore your wallet. Keep it carefully to not lose your assets.')}
            </Typography>
            <MnemonicSeedDisplay seed={seed} style={{ marginBlock: '20px' }} />
            <GradientButton
              contentPlacement='center'
              onClick={onContinue}
              showChevron
              style={{
                borderRadius: '18px',
                height: '48px',
                marginTop: '25px',
                width: '236px'
              }}
              text={t('Continue')}
            />
          </>
        }
        {step === STEP.DETAIL &&
          <Motion variant='slide'>
            <MyTextField
              Icon={User}
              focused
              iconSize={18}
              onTextChange={onNameChange}
              placeholder={t('Name account')}
              style={{ margin: '40px 0 20px' }}
              title={t('Choose a name for this account')}
            />
            <MatchPasswordField
              hashPassword
              onSetPassword={onSetPassword}
              setConfirmedPassword={setPassword}
              spacing='20px'
              style={{ marginBottom: '20px' }}
              title1={t('Password for this account')}
              title2={t('Repeat the password')}
            />
            <GlowCheckbox
              changeState={onCheck}
              checked={isMnemonicSaved}
              disabled={isBusy}
              label={t('I have saved')}
              label2={t('my recovery phrase safely')}
              labelStyle={{ ...theme.typography['B-1'] }}
              style={{ justifyContent: 'start', mt: '40px' }}
            />
            <DecisionButtons
              cancelButton
              direction='horizontal'
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
    </Framework>
  );
}

export default React.memo(CreateAccount);
