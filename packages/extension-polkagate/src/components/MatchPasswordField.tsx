// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { useTranslation } from '../hooks';
import { PasswordInput } from '.';

interface Props {
  onSetPassword?: () => Promise<void>;
  statusSetter?: React.Dispatch<React.SetStateAction<PASSWORD_STATUS | undefined>>;
  hashPassword?: boolean;
  setConfirmedPassword: React.Dispatch<React.SetStateAction<string | undefined>>;
  style?: React.CSSProperties;
  focused?: boolean;
}

export enum PASSWORD_STATUS {
  EMPTY_PASS,
  EMPTY_REPEATED,
  NOT_MATCHED,
  WEEK_PASS,
  MATCHED
}

const MIN_LENGTH = 6;

function MatchPasswordField ({ focused = false, hashPassword = false, onSetPassword, setConfirmedPassword, statusSetter, style }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [password, setPassword] = useState<string>();
  const [repeatPassword, setRepeatPassword] = useState<string>();

  const passwordStatus = useMemo(() => {
    if (!password) {
      return PASSWORD_STATUS.EMPTY_PASS;
    }

    if (password.length < MIN_LENGTH) {
      return PASSWORD_STATUS.WEEK_PASS;
    }

    if (!repeatPassword) {
      return PASSWORD_STATUS.EMPTY_REPEATED;
    }

    if (password === repeatPassword) {
      return PASSWORD_STATUS.MATCHED;
    }

    return PASSWORD_STATUS.NOT_MATCHED;
  }, [password, repeatPassword]);

  useEffect(() => {
    statusSetter?.(passwordStatus);

    if (passwordStatus === PASSWORD_STATUS.MATCHED && password) {
      const finalPassword = hashPassword
        ? blake2AsHex(password, 256) // Hash the string with a 256-bit output
        : password;

      setConfirmedPassword(finalPassword);
    } else {
      setConfirmedPassword(undefined);
    }
  }, [hashPassword, password, passwordStatus, setConfirmedPassword, statusSetter]);

  const handlePasswordChange = useCallback((pass: string | null): void => {
    if (!pass) {
      return setPassword(undefined);
    }

    setPassword(pass);
  }, []);

  const handleRepeatPasswordChange = useCallback((pass: string | null): void => {
    if (!pass) {
      return setRepeatPassword(undefined);
    }

    setRepeatPassword(pass);
  }, []);

  const handleConfirm = useCallback(() => {
    if (passwordStatus === PASSWORD_STATUS.MATCHED && onSetPassword) {
      try {
        onSetPassword().catch(console.error);
      } catch (error) {
        console.error('Error setting password:', error);
      }
    }
  }, [onSetPassword, passwordStatus]);

  return (
    <Container disableGutters sx={style}>
      <PasswordInput
        focused={focused}
        onPassChange={handlePasswordChange}
        style={{ marginBottom: '18px' }}
        title={t('Password')}
      />
      <PasswordInput
        onEnterPress={handleConfirm}
        onPassChange={handleRepeatPasswordChange}
        title={t('Repeat the password')}
      />
    </Container>
  );
}

export default MatchPasswordField;
