// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import Label from './Label';
import { Input } from './TextInputs';
import { eye, eyeSlashP } from '../assets/icons';
import Warning from './Warning';

interface Props {
  className?: string;
  defaultValue?: string | null;
  disabled?: boolean;
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  label: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  type?: 'text' | 'password';
  value?: string;
  withoutMargin?: boolean;
  showPassword?: boolean;
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>;
}

function InputWithLabel({ className, defaultValue, disabled, isError, isFocused, isReadOnly, label = '', onBlur, onChange, onEnter, placeholder, setShowPassword, showPassword, type = 'text', value, withoutMargin }: Props): React.ReactElement<Props> {
  const [isCapsLock, setIsCapsLock] = useState(false);
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

  return (
    <Label
      className={`${className || ''} ${withoutMargin ? 'withoutMargin' : ''}`}
      label={label}
      style={{ position: 'relative' }}
    >
      <Input
        autoCapitalize='off'
        autoCorrect='off'
        autoFocus={isFocused}
        defaultValue={defaultValue || undefined}
        disabled={disabled}
        onBlur={onBlur}
        onChange={_onChange}
        onKeyPress={_checkKey}
        placeholder={placeholder}
        readOnly={isReadOnly}
        spellCheck={false}
        style={{
          borderColor: isError && type === 'password' ? theme.palette.secondary.dark : theme.palette.secondary.light,
          borderWidth: isError && type === 'password' ? '3px' : '1px',
          fontSize: '18px',
          fontWeight: 300,
          padding: 0,
          paddingLeft: '10px'
        }}
        theme={theme}
        type={type}
        value={value}
        withError={isError}
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
        <Warning isBelowInput>{t<string>('Warning: Caps lock is on')}</Warning>
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
