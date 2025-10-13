// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useExtensionLockContext } from '@polkadot/extension-polkagate/src/context/ExtensionLockContext';
import OnboardingLayout from '@polkadot/extension-polkagate/src/fullscreen/onboarding/OnboardingLayout';
import useCheckMasterPassword from '@polkadot/extension-polkagate/src/hooks/useCheckMasterPassword';
import { accountsChangePassword, lockExtension } from '@polkadot/extension-polkagate/src/messaging';
import { setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { Address, GradientButton, MatchPasswordField, PasswordInput, TwoToneText } from '../../components';
import { OnboardTitle } from '../../fullscreen/components/index';
import { useAlerts, useTranslation } from '../../hooks';

enum STEP {
  PASSWORD,
  MIGRATING,
  COMPLETED
}

function MigratePasswords(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { notify } = useAlerts();
  const { setExtensionLock } = useExtensionLockContext();

  const [step, setStep] = useState(STEP.PASSWORD);
  const [isConfirmingMasterPassword, setConfirmingMasterPassword] = useState(false);
  const [isMigrating, setMigrating] = useState(false);
  const [masterPass, setMasterPass] = useState<string | undefined>('');
  const [currentPassword, setCurrentPass] = useState<string>('');
  const [accountIndexToChangePassword, setAccountIndex] = useState<number>(0);
  const [isIncorrectPassword, setIncorrectPassword] = useState<boolean>();

  const accountsNeedingMigration = useCheckMasterPassword(masterPass);
  const accountToMigrate = useMemo(() =>
    accountsNeedingMigration?.[accountIndexToChangePassword]
    ,
    [accountIndexToChangePassword, accountsNeedingMigration]);

  useEffect((): void => {
    if (isConfirmingMasterPassword && !!accountsNeedingMigration) {
      setStep(STEP.MIGRATING);
    }
  }, [isConfirmingMasterPassword, accountsNeedingMigration]);

  useEffect((): void => {
    setIncorrectPassword(false);
  }, [currentPassword]);

  const onContinue = useCallback(() => {
    setConfirmingMasterPassword(true);
  }, []);

  const onNext = useCallback(() => {
    if (accountToMigrate && masterPass) {
      setMigrating(true);
      accountsChangePassword(accountToMigrate.address, currentPassword, masterPass)
        .then((success) => {
          if (success) {
            if (accountIndexToChangePassword + 1 === accountsNeedingMigration?.length) {
              return setStep(STEP.COMPLETED);
            }

            setAccountIndex((pre) => pre + 1);
            setCurrentPass('');
          } else {
            notify(t('Something went wrong while migrating password!'), 'error');
          }

          setMigrating(false);
        }).catch((error) => {
          console.error(error);
          setIncorrectPassword(true);
          setMigrating(false);
        });
    } else {
      setMigrating(false);
    }
  }, [accountIndexToChangePassword, accountToMigrate, accountsNeedingMigration?.length, currentPassword, masterPass, notify, t]);

  const onDone = useCallback(() => {
    setMigrating(true);

    lockExtension().then(async (success) => {
      if (success) {
        await setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true);

        setExtensionLock(true);
        navigate('/') as void;
        setMigrating(false);
      }
    }).catch(console.error);
  }, [navigate, setExtensionLock]);

  return (
    <OnboardingLayout style={{ maxWidth: '582px' }}>
      <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ position: 'relative', zIndex: 1 }}>
        <OnboardTitle
          label={
            step === STEP.PASSWORD
              ? t('Set master password')
              : step === STEP.MIGRATING
                ? t('Migrate accounts to master password')
                : t('Migration completed!')
          }
          labelPartInColor={step === STEP.PASSWORD
            ? t('master')
            : step === STEP.MIGRATING
              ? t('Migrate accounts')
              : t('completed')}
        />
        {step === STEP.PASSWORD &&
          <>
            <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1' width='480px'>
              {t('Set a single master password to unlock and sign for all your local accounts. You’ll no longer need separate passwords per account — making account management simpler and more secure.')}
            </Typography>
            <MatchPasswordField
              focused
              // @ts-ignore
              onSetPassword={onContinue}
              setConfirmedPassword={setMasterPass}
              style={{ justifyContent: 'start', marginTop: '25px', width: '355px' }}
              title1={t('Create a master password')}
              title2={t('Repeat the password')}
            />
            <GradientButton
              contentPlacement='center'
              disabled={!masterPass}
              isBusy={isConfirmingMasterPassword && !accountsNeedingMigration}
              onClick={onContinue}
              showChevron
              style={{
                borderRadius: '18px',
                height: '44px',
                marginTop: '25px',
                width: '355px'
              }}
              text={t('Continue')}
            />
          </>
        }
        {step === STEP.MIGRATING && accountsNeedingMigration?.length &&
          <>
            <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1'>
              {t('You have accounts that still use their old passwords. Enter the current password for each to migrate them to your new master password.')}
            </Typography>
            <Typography sx={{ mt: '20px' }} textAlign='left' variant='B-1'>
              <TwoToneText
                text={t('Migrate account {{migrated}} of {{count}}.', { replace: { count: accountsNeedingMigration.length, migrated: accountIndexToChangePassword + 1 } })}
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
                  onPassChange={setCurrentPass}
                  style={{ margin: '0 0 10px', width: '355px' }}
                  title={t('Enter {{name}} Password', { replace: { name: accountToMigrate.name } })}
                  value={currentPassword}
                />
                <GradientButton
                  contentPlacement='center'
                  disabled={!currentPassword || isIncorrectPassword}
                  isBusy={isMigrating}
                  onClick={onNext}
                  showChevron
                  style={{
                    borderRadius: '18px',
                    height: '44px',
                    width: '355px'
                  }}
                  text={t('Next')}
                />
              </Stack>
            }
          </>
        }
        {step === STEP.COMPLETED &&
          <>
            <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1'>
              {t('All your accounts are now secured with your new master password. Click Done to log in — you’ll only need to enter your password once to unlock and use all accounts.')}
            </Typography>
            <GradientButton
              contentPlacement='center'
              isBusy={isMigrating}
              onClick={onDone}
              style={{
                borderRadius: '18px',
                height: '44px',
                marginTop: '20px',
                width: '355px'
              }}
              text={t('Done')}
            />
          </>
        }
      </Stack>
    </OnboardingLayout>
  );
}

export default React.memo(MigratePasswords);
