// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { PASSWORD_EXPIRY_MIN } from '@polkadot/extension-base/defaults';

import { ActionContext, Checkbox2 as Checkbox, PButton } from '../../../components';
import useTranslation from '../../../hooks/useTranslation';
import { approveSignPassword, isSignLocked } from '../../../messaging';
import Unlock from '../Unlock';

interface Props {
  buttonText: string;
  error: string | null;
  isExternal?: boolean;
  isFirst: boolean;
  isSignable: boolean;
  setError: (value: string | null) => void;
  signId: string;
}

export default function SignArea({ buttonText, error, isExternal, isFirst, isSignable, setError, signId }: Props): JSX.Element {
  const onAction = useContext(ActionContext);
  const { t } = useTranslation();

  const [savePass, setSavePass] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setIsLocked(null);
    let timeout: NodeJS.Timeout;

    !isExternal && isSignLocked(signId)
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
  }, [isExternal, signId]);

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

  return (
    <Grid>
      {isSignable && isFirst && !isExternal && (
        <>
          {isLocked && (
            <Unlock
              error={error}
              isBusy={isBusy}
              onSign={_onSign}
              password={password}
              setError={setError}
              setPassword={setPassword}
            />
          )}
          <Grid item>
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
          </Grid>
          <PButton
            _isBusy={isBusy}
            _onClick={_onSign}
            disabled={(!!isLocked && !password) || !!error}
            text={buttonText}
          />
        </>
      )}
    </Grid>
  );
}
