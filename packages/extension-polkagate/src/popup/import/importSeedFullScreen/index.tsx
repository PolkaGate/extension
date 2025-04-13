// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Collapse, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { More, User } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { OnboardTitle } from '@polkadot/extension-polkagate/src/fullscreen/components/index';
import Framework from '@polkadot/extension-polkagate/src/fullscreen/onboarding/Framework';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { objectSpread } from '@polkadot/util';

import { DecisionButtons, GradientButton, MatchPasswordField, Motion, MyTextField } from '../../../components';
import { useFullscreen, useMetadata, useTranslation } from '../../../hooks';
import { createAccountSuri, validateSeed } from '../../../messaging';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import { switchToOrOpenTab } from '../../../util/switchToOrOpenTab';
import { resetOnForgotPassword } from '../../newAccount/createAccountFullScreen/resetAccounts';
import MyPhraseArea from './MyPhraseArea';

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

enum STEP {
  SEED,
  DETAIL
}

export default function ImportSeed (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isBusy, setIsBusy] = useState(false);
  const [seed, setSeed] = useState<string>('');
  const [error, setError] = useState<string | undefined>();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [address, setAddress] = useState('');
  const [type, setType] = useState(DEFAULT_TYPE);
  const [path, setPath] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [name, setName] = useState<string | null | undefined>();
  const [password, setPassword] = useState<string>();
  const [step, setStep] = useState(STEP.SEED);

  const chain = useMetadata(account?.genesis, true);

  useEffect((): void => {
    setType(
      chain && chain.definition.chainType === 'ethereum'
        ? 'ethereum'
        : DEFAULT_TYPE
    );
  }, [chain]);

  useEffect(() => {
    if (!seed) {
      setAccount(null);
      setError(undefined);

      return;
    }

    const suri = `${seed || ''}${path || ''}`;

    validateSeed(suri, type)
      .then((validatedAccount) => {
        setError(undefined);
        setAddress(validatedAccount.address);
        setAccount(
          objectSpread<AccountInfo>({}, validatedAccount, { POLKADOT_GENESIS, type })
        );
      })
      .catch(() => {
        setAddress('');
        setAccount(null);
        setError(path
          ? t('Invalid recovery phrase or derivation path')
          : t('Invalid recovery phrase')
        );
      });
  }, [t, seed, path, setAccount, type]);

  const onCreate = useCallback(async (): Promise<void> => {
    // this should always be the case
    if (name && password && account) {
      setIsBusy(true);
      await resetOnForgotPassword();

      createAccountSuri(name, password, account.suri, type, POLKADOT_GENESIS)
        .then(() => {
          setStorage('profile', PROFILE_TAGS.LOCAL).catch(console.error);
          switchToOrOpenTab('/', true);
        })
        .catch((error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [account, name, password, type]);

  const onNameChange = useCallback((enteredName: string): void => {
    setName(enteredName ?? null);
  }, []);

  const onCancel = useCallback(() => switchToOrOpenTab('/', true), []);
  const toggleMore = useCallback(() => setShowMore(!showMore), [showMore]);

  const onContinue = useCallback(() => {
    setStep(STEP.DETAIL);
  }, []);

  const onBack = useCallback(() => {
    if (step === STEP.DETAIL) {
      setStep(STEP.SEED);
    } else {
      setSeed('');
      setAccount(null);
      setAddress('');
      setType(DEFAULT_TYPE);
      setPath(null);
      setShowMore(false);
      setName(undefined);
      setPassword('');
      setError(undefined);
      navigate('/account/have-wallet');
    }
  }, [navigate, step]);

  return (
    <Framework width='600px'>
      <OnboardTitle
        label={t('Import from recovery phrase')}
        labelPartInColor='recovery phrase'
        onBack={onBack}
      />
      <Stack direction='column' sx={{ mt: '15px', position: 'relative', width: '500px' }}>
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
              <Stack alignItems='center' columnGap='3px' direction='row' justifyContent='flex-start' onClick={toggleMore} sx={{ bgcolor: '#2D1E4A', borderRadius: '8px', m: '15px 0 10px 0 ', p: '4px 6px', width: 'fit-content' }}>
                <More color='#AA83DC' size='18' style={{ rotate: '90deg' }} variant='Linear' />
                <Typography sx={{ color: '#BEAAD8', cursor: 'pointer' }} variant='B-2'>
                  {t('Advanced')}
                </Typography>
              </Stack>
              <Collapse in={showMore}>
                <Typography color='#BEAAD8' sx={{ textAlign: 'left' }} variant='B-1'>
                  {t('To import a specific account, use a derivation path like //0, //1, etc.')}
                </Typography>
                <MyTextField
                  focused
                  iconSize={18}
                  onTextChange={setPath}
                  placeholder='//'
                  style={{ margin: '15px 0 0' }}
                  title={t('Derivation path')}
                />
              </Collapse>
            </Collapse>
            <GradientButton
              contentPlacement='center'
              disabled={!!error || !seed}
              onClick={onContinue}
              showChevron
              style={{
                borderRadius: '18px',
                height: '48px',
                marginTop: '15px',
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
              style={{ margin: '20px 0 20px' }}
              title={t('Choose a name for this account')}
            />
            <MatchPasswordField
              onSetPassword={(password && name && !error && !!seed) ? onCreate : undefined}
              setConfirmedPassword={setPassword}
              spacing='20px'
              style={{ marginBottom: '20px' }}
              title1={t('Password for this account')}
              title2={t('Repeat the password')}
            />
            <DecisionButtons
              cancelButton
              direction='horizontal'
              disabled={!password || !name || !address || !account}
              isBusy={isBusy}
              onPrimaryClick={onCreate}
              onSecondaryClick={onCancel}
              primaryBtnText={t('Import')}
              secondaryBtnText={t('Cancel')}
              showChevron
              style={{ flexDirection: 'row-reverse', position: 'absolute', width: '65%' }}
            />
          </Motion>
        }
      </Stack>
    </Framework>
  );
}
