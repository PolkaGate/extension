// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { User } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { OnboardTitle } from '@polkadot/extension-polkagate/src/fullscreen/components/index';
import AdaptiveLayout from '@polkadot/extension-polkagate/src/fullscreen/components/layout/AdaptiveLayout';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { keyring } from '@polkadot/ui-keyring';
import { objectSpread } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { DecisionButtons, GradientButton, MatchPasswordField, Motion, MyTextField } from '../../../components';
import { useFullscreen, useMetadata, useTranslation } from '../../../hooks';
import { createAccountSuri } from '../../../messaging';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import { switchToOrOpenTab } from '../../../util/switchToOrOpenTab';
import { resetOnForgotPassword } from '../../newAccount/createAccountFullScreen/resetAccounts';
import MyPhraseArea from '../importSeedFullScreen/MyPhraseArea';

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
  const [name, setName] = useState<string | undefined>();
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
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  useEffect(() => {
    if (!seed) {
      setAccount(null);
      setError(undefined);

      return;
    }

    if (!(seed.startsWith('0x') && seed.length === 66)) {
      setAddress('');
      setAccount(null);
      setError(t('The raw seed is invalid. It should be 66 characters long and start with 0x')
      );

      return;
    }

    try {
      const { pair } = keyring.addUri(seed, password, { name }, type);

      const validatedAccount = {
        address: pair.address,
        suri: seed
      };

      setError(undefined);
      setAddress(pair.address);
      setAccount(
        objectSpread<AccountInfo>({}, validatedAccount, { POLKADOT_GENESIS, type })
      );
    } catch (error) {
      setAddress('');
      setAccount(null);
      setError(`${error}`);
    }
  }, [t, seed, setAccount, type, name, password]);

  const onImport = useCallback(async (): Promise<void> => {
    // this should always be the case
    if (name && password && account) {
      setIsBusy(true);
      await resetOnForgotPassword();

      createAccountSuri(name, password, account.suri, type)
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
      setName(undefined);
      setPassword('');
      setError(undefined);
      navigate('/account/have-wallet');
    }
  }, [navigate, step]);

  return (
    <AdaptiveLayout style={{ maxWidth: '600px' }}>
      <OnboardTitle
        label={t('Import from raw seed')}
        labelPartInColor='raw seed'
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
              <Typography color='#FF4FB9' sx={{ textAlign: 'left' }} variant='B-1'>
                {error}
              </Typography>
            }
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
              placeholder={t('Enter account name')}
              style={{ margin: '20px 0 20px' }}
              title={t('Choose a name for this account')}
            />
            <MatchPasswordField
              onSetPassword={(password && name && !error && !!seed) ? onImport : undefined}
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
              onPrimaryClick={onImport}
              onSecondaryClick={onCancel}
              primaryBtnText={t('Import')}
              secondaryBtnText={t('Cancel')}
              showChevron
              style={{ flexDirection: 'row-reverse', position: 'absolute', width: '65%' }}
            />
          </Motion>
        }
      </Stack>
    </AdaptiveLayout>
  );
}
