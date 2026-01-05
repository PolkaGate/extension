// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { lockLottie, masterKey, migratePassword } from '@polkadot/extension-polkagate/src/assets/animations';
import { useExtensionLockContext } from '@polkadot/extension-polkagate/src/context/ExtensionLockContext';
import OnboardingLayout from '@polkadot/extension-polkagate/src/fullscreen/onboarding/OnboardingLayout';
import useCheckMasterPassword from '@polkadot/extension-polkagate/src/hooks/useCheckMasterPassword';
import { accountsChangePassword, lockExtension } from '@polkadot/extension-polkagate/src/messaging';
import { setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { Address, GradientButton, MatchPasswordField, PasswordInput, TwoToneText } from '../../components';
import { useAlerts, useTranslation } from '../../hooks';

enum STEP {
  PASSWORD,
  MIGRATING,
  COMPLETED
}

function MigratePasswords (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { notify } = useAlerts();
  const { setExtensionLock } = useExtensionLockContext();

  const [step, setStep] = useState(STEP.PASSWORD);
  const [isConfirmingMasterPassword, setConfirmingMasterPassword] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [masterPass, setMasterPass] = useState<string | undefined>('');
  const [currentPassword, setCurrentPass] = useState<string>('');
  const [accountIndexToChangePassword, setAccountIndex] = useState<number>(0);
  const [isIncorrectPassword, setIncorrectPassword] = useState<boolean>();

  const { accountsNeedMigration } = useCheckMasterPassword(masterPass);
  const accountToMigrate = useMemo(() =>
    accountsNeedMigration?.[accountIndexToChangePassword]
    ,
    [accountIndexToChangePassword, accountsNeedMigration]);

  useEffect((): void => {
    if (!isConfirmingMasterPassword) {
      return;
    }

    if (accountsNeedMigration?.length) {
      return setStep(STEP.MIGRATING);
    }

    if (accountsNeedMigration?.length === 0) { // shouldn't happen
      navigate('/') as void;
    }
  }, [isConfirmingMasterPassword, accountsNeedMigration, navigate]);

  useEffect((): void => {
    setIncorrectPassword(false);
  }, [currentPassword]);

  const onContinue = useCallback(() => {
    setConfirmingMasterPassword(true);
  }, []);

  const onNext = useCallback(() => {
    if (accountToMigrate && masterPass) {
      setIsBusy(true);
      accountsChangePassword(accountToMigrate.address, currentPassword, masterPass)
        .then((success) => {
          if (success) {
            if (accountIndexToChangePassword + 1 === accountsNeedMigration?.length) {
              setIsBusy(false);

              return setStep(STEP.COMPLETED);
            }

            setAccountIndex((pre) => pre + 1);
            setCurrentPass('');
          } else {
            notify(t('Something went wrong while migrating password!'), 'error');
          }

          setIsBusy(false);
        }).catch((error) => {
          console.error(error);
          setIncorrectPassword(true);
          setIsBusy(false);
        });
    } else {
      setIsBusy(false);
    }
  }, [accountIndexToChangePassword, accountToMigrate, accountsNeedMigration?.length, currentPassword, masterPass, notify, t]);

  const onDone = useCallback(() => {
    setIsBusy(true);

    setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true)
      .then(() => {
        setExtensionLock(true);
        navigate('/') as void;
        lockExtension().catch(console.error);
      }).catch(console.error);
  }, [navigate, setExtensionLock]);

  return (
    <OnboardingLayout childrenStyle={{ justifyContent: 'center', margin: 'auto', width: '440px' }} showBread={false} showLeftColumn={false}>
      <Grid container item justifyContent='center' sx={{ p: '18px 15px 26px', position: 'relative', zIndex: 1 }}>
        {step === STEP.PASSWORD
          ? <DotLottieReact autoplay loop src={masterKey} style={{ height: '150px', width: '150px' }} />
          : step === STEP.MIGRATING
            ? <DotLottieReact autoplay loop src={migratePassword} style={{ height: '150px', width: '150px' }} />
            : <DotLottieReact autoplay src={lockLottie} style={{ height: '130px', width: '130px' }} />
        }
        <Typography sx={{ lineHeight: '32px', mb: '12px', mt: '20px', width: '100%' }} textTransform='uppercase' variant='H-2'>
          <TwoToneText
            text={
              step === STEP.PASSWORD
                ? t('Set master password')
                : step === STEP.MIGRATING
                  ? t('Migrate accounts to master password')
                  : t('Migration completed!')
            }
            textPartInColor={step === STEP.PASSWORD
              ? t('master')
              : step === STEP.MIGRATING
                ? t('Migrate accounts')
                : t('completed')}
          />
        </Typography>
        <Typography color={theme.palette.text.secondary} sx={{ m: '20px 0 20px', px: '7px', width: '100%' }} variant='B-4'>
          {step === STEP.PASSWORD
            ? t('Set a single master password to unlock and sign for all your local accounts. You’ll no longer need separate passwords per account — making account management simpler and more secure.')
            : step === STEP.MIGRATING && !!accountsNeedMigration?.length
              ? t('You have accounts that still use their old passwords. Enter the current password for each to migrate them to your new master password.')
              : t('All your accounts are now secured with your new master password. Click Done to log in — you’ll only need to enter your password once to unlock and use all accounts.')
          }
        </Typography>
        {step === STEP.PASSWORD &&
          <>
            <MatchPasswordField
              focused
              onSetPassword={onContinue}
              setConfirmedPassword={setMasterPass}
              style={{ marginBottom: '15px' }}
              title1={t('Create a master password')}
              title2={t('Repeat the password')}
            />
            <GradientButton
              contentPlacement='center'
              disabled={!masterPass}
              isBusy={isConfirmingMasterPassword && !accountsNeedMigration}
              onClick={onContinue}
              showChevron
              style={{
                height: '44px',
                marginTop: '20px'
              }}
              text={t('Continue')}
            />
          </>
        }
        {step === STEP.MIGRATING && !!accountsNeedMigration?.length &&
          <>
            <Typography sx={{ mt: '20px', width: '100%' }} textAlign='left' variant='B-1'>
              <TwoToneText
                color={theme.palette.warning.main}
                text={t('Migrate account {{migrated}} of {{count}}.', { replace: { count: accountsNeedMigration.length, migrated: accountIndexToChangePassword + 1 } })}
                textPartInColor={t('account {{migrated}}', { replace: { migrated: accountIndexToChangePassword + 1 } })}
              />
            </Typography>
            {accountIndexToChangePassword !== undefined && accountToMigrate &&
              <Stack alignItems='start' direction='column' rowGap='20px' sx={{ marginTop: '15px', width: '464px' }}>
                <Address
                  address={accountToMigrate.address}
                  genesisHash={POLKADOT_GENESIS}
                  margin='0px'
                  name={accountToMigrate.name}
                  style={{ width: '100%' }}
                />
                <PasswordInput
                  focused
                  hasError={isIncorrectPassword}
                  onEnterPress={onNext}
                  onPassChange={setCurrentPass}
                  title={t('Enter {{name}} Password', { replace: { name: accountToMigrate.name } })}
                  value={currentPassword}
                />
                <GradientButton
                  contentPlacement='center'
                  disabled={!currentPassword || isIncorrectPassword}
                  isBusy={isBusy}
                  onClick={onNext}
                  showChevron
                  style={{
                    height: '44px',
                    marginTop: '20px'
                  }}
                  text={t('Next')}
                />
              </Stack>
            }
          </>
        }
        {step === STEP.COMPLETED &&
          <>
            <GradientButton
              contentPlacement='center'
              isBusy={isBusy}
              onClick={onDone}
              style={{
                height: '44px',
                marginTop: '20px'
              }}
              text={t('Done')}
            />
          </>
        }
      </Grid>
    </OnboardingLayout>
  );
}

export default React.memo(MigratePasswords);
