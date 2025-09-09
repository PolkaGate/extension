// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { JSX } from 'react';
import type { Balance } from '@polkadot/types/interfaces';

import { Grid, Typography, useTheme } from '@mui/material';
import { InfoCircle, Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DecisionButtons, GlowCheckbox, PasswordInput, TwoToneText } from '../../../components';
import { useCanPayFee } from '../../../hooks/index';
import useTranslation from '../../../hooks/useTranslation';
import { approveSignPassword, isSignLocked } from '../../../messaging';

interface Props {
  address: string;
  error: string | null;
  fee?: Balance;
  isFirst: boolean;
  isSignable: boolean;
  genesisHash?: string;
  setError: (value: string | null) => void;
  signId: string;
  onCancel: () => void;
  withSavePassword?: boolean;
}

export default function SignWithPassword ({ address, error, fee, genesisHash, isFirst, isSignable, onCancel, setError, signId, withSavePassword }: Props): JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const canPayFee = useCanPayFee(address, genesisHash, fee);

  const [savePass, setSavePass] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const remainingTimeInMinute = useMemo(() => {
    const time = Math.ceil(remainingTime / 60000);

    return time > 1
      ? `${time} minutes`
      : `${time} minute`;
  }, [remainingTime]);

  useEffect(() => {
    setIsLocked(null);
    // eslint-disable-next-line no-undef
    let timeout: NodeJS.Timeout;

    isSignLocked(signId)
      .then(({ isLocked, remainingTime: lockedRemainingTime }) => {
        setIsLocked(isLocked);
        setRemainingTime(lockedRemainingTime);

        timeout = setTimeout(() => {
          setIsLocked(true);
        }, lockedRemainingTime);

        // if the account was unlocked check the remember me
        // automatically to prolong the unlock period
        !isLocked && setSavePass(true);
      })
      .catch((error: Error) => console.error(error));

    return () => {
      !!timeout && clearTimeout(timeout);
    };
  }, [signId]);

  const onSign = useCallback((): void => {
    setIsBusy(true);
    approveSignPassword(signId, savePass, password)
      .then((): void => {
        setIsBusy(false);
        navigate('/') as void;
      })
      .catch((error: Error): void => {
        setIsBusy(false);
        setError(error.message);
        console.error(error);
      });
  }, [navigate, password, savePass, setError, setIsBusy, signId]);

  const onPassChange = useCallback((password: string): void => {
    setPassword(password);
    setError(null);
  }, [setError, setPassword]);

  const toggleSavePass = useCallback(() => setSavePass((isChecked) => !isChecked), []);

  return (
    <>
      {isSignable && isFirst && (
        <Grid container item>
          {isLocked && (
            <PasswordInput
              focused
              hasError={!!error}
              onEnterPress={onSign}
              onPassChange={onPassChange}
              title={t('Your Password')}
            />
          )}
          {canPayFee === false &&
            <Grid alignItems='center' columnGap='5px' container item sx={{ bottom: withSavePassword && !isLocked ? '150px' : '125px', position: 'absolute' }}>
              <Warning2 color='#FFCE4F' size='24px' variant='Bold' />
              <Typography color='#EAEBF1' variant='B-4'>
                {t('Insufficient balance to cover the transaction fee')}
              </Typography>
            </Grid>
          }
          {withSavePassword &&
            <>
              {isLocked
                ? (
                  <GlowCheckbox
                    changeState={toggleSavePass}
                    checked={savePass}
                    label={t('keep me signed in for 15 minutes')}
                    labelPartInColor={t('15 minutes')}
                    labelStyle={{ ...theme.typography['B-1'] }}
                    style={{ ml: '6px', mt: !isLocked ? '25px' : '12px' }}
                  />)
                : (
                  <Grid alignItems='center' columnGap='5px' container item sx={{ bottom: '125px', position: 'absolute' }}>
                    <InfoCircle color='#3988FF' size='22' variant='Bold' />
                    <Typography color='#EAEBF1' variant='B-4'>
                      <TwoToneText
                        text={t('No-password session active — {{remainingTimeInMinute}} left.', { replace: { remainingTimeInMinute } })}
                        textPartInColor={remainingTimeInMinute}
                      />
                    </Typography>
                  </Grid>)
              }
            </>
          }
          <DecisionButtons
            direction='vertical'
            disabled={(!!isLocked && !password) || !!error}
            isBusy={isBusy}
            onPrimaryClick={onSign}
            onSecondaryClick={onCancel}
            primaryBtnText={t('Approve')}
            secondaryBtnText={t('Cancel')}
            style={{ bottom: '0px', position: 'absolute' }}
          />
        </Grid>
      )}
    </>
  );
}
