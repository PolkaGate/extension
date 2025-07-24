// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { isEmail, isUrl, isWss } from '../util/utils';
import Label from './Label';
import { Input } from './TextInputs';

interface Props {
  defaultValue?: string | null;
  disabled?: boolean;
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  label: string;
  labelFontSize?: string;
  onChange?: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  value?: string;
  height?: number;
  fontSize?: number;
  fontWeight?: number;
  helperText?: string;
  type?: string;
}

function InputWithLabel({ defaultValue, disabled, fontSize = 18, fontWeight = 300, height = 31, helperText, isError, isFocused, isReadOnly, label = '', labelFontSize = '14px', onChange, onEnter, placeholder, type = 'text', value }: Props): React.ReactElement<Props> {
  const [offFocus, setOffFocus] = useState(false);
  const theme = useTheme();

  const badInput = useMemo(() => {
    if (!type || !value) {
      return false;
    }

    if (type === 'email') {
      return !isEmail(value);
    }

    if (type === 'url') {
      return !isUrl(value);
    }

    if (type === 'wss') {
      return !isWss(value);
    }

    return false;
  }, [type, value]);

  const _checkKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      onEnter && event.key === 'Enter' && onEnter();
    },
    [onEnter]
  );

  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
      onChange && onChange(value);
    },
    [onChange]
  );

  const _setOffFocus = useCallback(() => {
    setOffFocus(true);
  }, []);

  return (
    <Label
      helperText={helperText}
      label={label}
      style={{ fontSize: labelFontSize, letterSpacing: '-0.015em', position: 'relative', width: '100%' }}
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
          borderColor: (isError || badInput) ? theme.palette.warning.main : theme.palette.secondary.light,
          borderWidth: (isError || badInput) ? '3px' : '1px',
          fontSize: `${fontSize}px`,
          fontWeight,
          height: `${height}px`,
          padding: 0,
          paddingLeft: '10px'
        }}
        theme={theme}
        type={type}
        value={value}
        withError={offFocus && (isError || badInput)}
      />
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
