// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Password } from '../../../components';
import { useTranslation } from '../../../hooks';
import { allOf, isNotShorterThan, isSameAs, Validator } from '../../../util/validators';
import ValidatedInput2 from './ValidatedInput2';

interface Props {
  isFocussed?: boolean;
  label?: string;
  onChange: (password: string | null) => void;
  onEnter: () => void;
  firstPassStyle?: React.CSSProperties;
  secondPassStyle?: React.CSSProperties;
}

const MIN_LENGTH = 6;

export default function Passwords2 ({ firstPassStyle, secondPassStyle, isFocussed, onChange, onEnter, label = undefined }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [pass1, setPass1] = useState<string | null>(null);
  const [pass2, setPass2] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const isFirstPasswordValid = useMemo(() => isNotShorterThan(MIN_LENGTH, t<string>('Password is too short')), [t]);
  const isSecondPasswordValid = useCallback((firstPassword: string): Validator<string> => allOf(
    isNotShorterThan(MIN_LENGTH, t<string>('Password is too short')),
    isSameAs(firstPassword, t<string>('Password do not match'))
  ), [t]);

  useEffect((): void => {
    onChange(pass1 && pass2 ? pass1 : null);
  }, [onChange, pass1, pass2]);

  return (
    <>
      <ValidatedInput2
        component={Password}
        data-input-password
        isFocused={isFocussed}
        label={label || t<string>('Password for this account (>5 characters)')}
        onValidatedChange={setPass1}
        setShowPassword={setShowPassword}
        showPassword={showPassword}
        style={firstPassStyle}
        validator={isFirstPasswordValid}
      />
      <ValidatedInput2
        component={Password}
        dataInputRepeatPassword
        // data-input-repeat-password
        label={t<string>('Repeat the password')}
        onEnter={onEnter}
        onValidatedChange={setPass2}
        setShowPassword={setShowConfirmPassword}
        showPassword={showConfirmPassword}
        style={secondPassStyle}
        validator={isSecondPasswordValid(pass1)}
      />
    </>
  );
}
