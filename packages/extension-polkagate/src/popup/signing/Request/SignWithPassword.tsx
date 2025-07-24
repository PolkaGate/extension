// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { JSX } from 'react';
import type { Balance } from '@polkadot/types/interfaces';

import { Grid, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ActionContext, DecisionButtons, PasswordInput } from '../../../components';
import { useCanPayFee } from '../../../hooks/index';
import useTranslation from '../../../hooks/useTranslation';
import { approveSignPassword, isSignLocked } from '../../../messaging';

interface Props {
  error: string | null;
  isFirst: boolean;
  isSignable: boolean;
  setError: (value: string | null) => void;
  signId: string;
  onCancel: () => void;
  address: string;
  fee?: Balance;
}

export default function SignArea ({ address, error, fee, isFirst, isSignable, onCancel, setError, signId }: Props): JSX.Element {
  const onAction = useContext(ActionContext);
  const { t } = useTranslation();
  const canPayFee = useCanPayFee(address, fee);

  const [savePass, setSavePass] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setIsLocked(null);
    // eslint-disable-next-line no-undef
    let timeout: NodeJS.Timeout;

    isSignLocked(signId)
      .then(({ isLocked, remainingTime }) => {
        setIsLocked(isLocked);
        timeout = setTimeout(() => {
          setIsLocked(true);
        }, remainingTime);

        // if the account was unlocked check the remember me
        // automatically to prolong the unlock period
        !isLocked && setSavePass(true);
      })
      .catch((error: Error) => console.error(error));

    return () => {
      !!timeout && clearTimeout(timeout);
    };
  }, [signId]);

  const _onSign = useCallback(
    (): void => {
      setIsBusy(true);
      approveSignPassword(signId, savePass, password)
        .then((): void => {
          setIsBusy(false);
          onAction('/');
        })
        .catch((error: Error): void => {
          setIsBusy(false);
          setError(error.message);
          console.error(error);
        });
    },
    [onAction, password, savePass, setError, setIsBusy, signId]
  );

  const onPassChange = useCallback(
    (password: string): void => {
      setPassword(password);
      setError(null);
    },
    [setError, setPassword]
  );

  return (
    <>
      {isSignable && isFirst && (
        <Grid container item>
          {isLocked && (
            <PasswordInput
              focused
              hasError={!!error}
              onEnterPress={_onSign}
              onPassChange={onPassChange}
              title={t('Your Password')}
            />
          )}
          {/* <Grid item>
            <Checkbox
              checked={savePass}
              label={isLocked
                ? t<string>(
                  'Remember my password for the next {{expiration}} minutes',
                  { replace: { expiration: PASSWORD_EXPIRY_MIN } }
                )
                : t<string>(
                  'Extend the period without password by {{expiration}} minutes',
                  { replace: { expiration: PASSWORD_EXPIRY_MIN } }
                )
              }
              labelStyle={{ fontSize: '14px', fontWeight: 400 }}
              onChange={() => setSavePass(!savePass)}
              style={{ ml: '10px', mt: '5px' }}
            />
          </Grid> */}
          {canPayFee === false &&
            <Grid alignItems='center' columnGap='5px' container item sx={{ bottom: '125px', position: 'absolute' }}>
              <Warning2 color='#FFCE4F' size='24px' variant='Bold' />
              <Typography color='#EAEBF1' variant='B-4'>
                {t('Insufficient balance to cover the transaction fee')}
              </Typography>
            </Grid>
          }
          <DecisionButtons
            direction='vertical'
            disabled={(!!isLocked && !password) || !!error}
            isBusy={isBusy}
            onPrimaryClick={_onSign}
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
