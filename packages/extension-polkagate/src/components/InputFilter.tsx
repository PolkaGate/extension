// Copyright 2017-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Theme } from '@mui/material';

import React, { useCallback } from 'react';

import Label from './Label';
import { Input } from './TextInputs';

interface Props {
  autoFocus?: boolean;
  disabled?: boolean;
  fontSize?: string;
  label?: string;
  onChange: (filter: string) => void;
  placeholder: string;
  theme: Theme;
  value?: string;
}

export default function InputFilter({ autoFocus = true, disabled, fontSize = '18px', label, onChange, placeholder, theme, value }: Props) {
  const onChangeFilter = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  return (
    <div style={{ position: 'relative' }}>
      <Label
        label={label ?? ''}
      >
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          autoFocus={autoFocus}
          disabled={disabled}
          onChange={onChangeFilter}
          placeholder={placeholder}
          spellCheck={false}
          style={{
            fontSize,
            fontWeight: 300,
            padding: 0,
            paddingLeft: '10px'
          }}
          theme={theme}
          type='text'
          value={value}
        />
      </Label>
    </div>
  );
}
