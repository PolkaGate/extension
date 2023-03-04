// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import { IconButton, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import Label from './Label';
import { Input } from './TextInputs';

interface Props {
  defaultValue?: string | null;
  disabled?: boolean;
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  label: string;
  onChange?: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  value?: string;
  withoutMargin?: boolean;
}

export default function Password({ defaultValue, disabled, isError, isFocused, isReadOnly, label = '', onChange, onEnter, placeholder, withoutMargin }: Props): React.ReactElement<Props> {
  const [offFocus, setOffFocus] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const theme = useTheme();
  const [enteredPassword, setEnteredPassword] = useState<string>('');

  const _checkKey = useCallback((event: React.KeyboardEvent<HTMLInputElement>): void => {
    onEnter && event.key === 'Enter' && onEnter();
  }, [onEnter]);

  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
      setEnteredPassword(value || '');
      onChange && onChange(value);
    },
    [onChange]
  );

  const _showPassToggler = useCallback(() => {
    setShowPass(!showPass);
  }, [showPass]);

  const _setOffFocus = useCallback(() => {
    setOffFocus(true);
  }, []);

  return (
    <Label
      label={label}
      style={{ letterSpacing: '-0.015em', position: 'relative' }}
    >
      <Input
        autoCapitalize='off'
        autoCorrect='off'
        autoFocus={!offFocus && isFocused}
        defaultValue={defaultValue || undefined}
        disabled={disabled}
        onBlur={_setOffFocus}
        onChange={_onChange}
        onKeyPress={_checkKey}
        placeholder={placeholder}
        readOnly={isReadOnly}
        spellCheck={false}
        style={{
          borderColor: isError ? theme.palette.warning.main : theme.palette.secondary.light,
          borderWidth: isError ? '3px' : '1px',
          fontSize: '18px',
          fontWeight: 300,
          padding: 0,
          paddingLeft: '10px'
        }}
        theme={theme}
        type={showPass ? 'text' : 'password'}
        value={enteredPassword}
        withError={offFocus && isError}
      />
      <IconButton
        onClick={_showPassToggler}
        sx={{
          bottom: '0',
          position: 'absolute',
          right: '0'
        }}
        tabIndex={-1}
      >
        <vaadin-icon icon={showPass ? 'vaadin:eye' : 'vaadin:eye-slash'} style={{ height: '20px', color: `${theme.palette.secondary.light}` }} />
      </IconButton>
    </Label>
  );
}
