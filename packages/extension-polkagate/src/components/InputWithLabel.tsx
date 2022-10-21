// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { eye, eyeSlashP } from '../assets/icons';
import useTranslation from '../hooks/useTranslation';
import Label from './Label';
import { Input } from './TextInputs';
import Warning from './Warning';

interface Props {
  className?: string;
  defaultValue?: string | null;
  disabled?: boolean;
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  label: string;
  onChange?: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  type?: 'text' | 'password';
  value?: string;
  withoutMargin?: boolean;
  showPassword?: boolean;
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>;
}

function InputWithLabel({ className, defaultValue, disabled, isError, isFocused, isReadOnly, label = '', onChange, onEnter, placeholder, setShowPassword, showPassword, type = 'text', value, withoutMargin }: Props): React.ReactElement<Props> {
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [offFocus, setOffFocus] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const _checkKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      onEnter && event.key === 'Enter' && onEnter();

      if (type === 'password') {
        if (event.getModifierState('CapsLock')) {
          setIsCapsLock(true);
        } else {
          setIsCapsLock(false);
        }
      }
    },
    [onEnter, type]
  );

  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
      onChange && onChange(value);
    },
    [onChange]
  );

  const _showPassToggler = useCallback(() => {
    setShowPassword && setShowPassword(!showPassword);
  }, [setShowPassword, showPassword]);

  const _setOffFocus = useCallback(() => {
    setOffFocus(true);
  }, []);

  return (
    <Label
      className={`${className || ''} ${withoutMargin ? 'withoutMargin' : ''}`}
      label={label}
      style={{ position: 'relative', letterSpacing: '-0.015em' }}
    >
      <Input
        autoCapitalize='off'
        autoCorrect='off'
        autoFocus={isFocused}
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
        type={type}
        value={value}
        withError={offFocus && isError}
      />
      {setShowPassword &&
        <IconButton
          onClick={_showPassToggler}
          sx={{
            bottom: '0',
            position: 'absolute',
            right: '0'
          }}
        >
          <Avatar
            alt={'logo'}
            src={showPassword ? eye : eyeSlashP}
            sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, height: '18px', width: '18px' }}
          />
        </IconButton>
      }
      {isCapsLock && (
        <Warning
          isBelowInput
          theme={theme}
        >
          {t<string>('Warning: Caps lock is on')}
        </Warning>
      )}
    </Label>
  );
}

export default styled(InputWithLabel)`
  &.withoutMargin {
    margin: 0;

   + .danger {
      margin-top: 6px;
    }
  }
`;
