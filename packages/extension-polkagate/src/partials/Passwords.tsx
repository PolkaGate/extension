// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { CSSProperties } from '@mui/styled-engine';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Password, ValidatedInput } from '../components';
import { useTranslation } from '../hooks';
import { allOf, isNotShorterThan, isSameAs, Validator } from '../util/validators';

interface Props {
  isFocussed?: boolean;
  label?: string;
  onChange: (password: string | null) => void;
  onEnter: () => void;
  style?: CSSProperties | undefined;
}

const MINIMUM_ALLOWED_PASSWORD_LENGTH = 1;

export default function Passwords({ isFocussed, onChange, onEnter, label = undefined, style = {} }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [pass1, setPass1] = useState<string | null>(null);
  const [pass2, setPass2] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const isFirstPasswordValid = useMemo(() => isNotShorterThan(MINIMUM_ALLOWED_PASSWORD_LENGTH, t<string>('Password is too short')), [t]);
  const isSecondPasswordValid = useCallback((firstPassword: string): Validator<string> => allOf(
    isNotShorterThan(MINIMUM_ALLOWED_PASSWORD_LENGTH, t<string>('Password is too short')),
    isSameAs(firstPassword, t<string>('Password do not match'))
  ), [t]);

  useEffect((): void => {
    onChange(pass1 && pass2 ? pass1 : null);
  }, [onChange, pass1, pass2]);

  return (
    <>
      <ValidatedInput
        component={Password}
        data-input-password
        isFocused={isFocussed}
        label={label || t<string>('Password for this account (>5 characters)')}
        onValidatedChange={setPass1}
        setShowPassword={setShowPassword}
        showPassword={showPassword}
        validator={isFirstPasswordValid}
        width={style?.width}
      />
      <ValidatedInput
        component={Password}
        dataInputRepeatPassword
        // data-input-repeat-password
        label={t<string>('Repeat the password')}
        onEnter={onEnter}
        onValidatedChange={setPass2}
        setShowPassword={setShowConfirmPassword}
        showPassword={showConfirmPassword}
        validator={isSecondPasswordValid(pass1)}
        width={style?.width}
      />
    </>
  );
}
