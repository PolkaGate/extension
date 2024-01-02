// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import Label from './Label';
import { TextArea } from './TextInputs';

interface Props {
  className?: string;
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  fontSize?: string;
  rowsCount?: number;
  label: string;
  onChange?: (value: string) => void;
  value?: string;
  style?: React.CSSProperties | undefined;
  height?: string;
}

export default function TextAreaWithLabel({ fontSize, height = '88px', isError, isFocused, isReadOnly, label, onChange, rowsCount, style, value }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>): void => {
      onChange && onChange(value);
    },
    [onChange]
  );

  return (
    <Label
      label={label}
      style={style}
    >
      <TextArea
        autoCapitalize='off'
        autoCorrect='off'
        autoFocus={isFocused}
        fontSize={fontSize}
        onChange={_onChange}
        readOnly={isReadOnly}
        rows={rowsCount || 2}
        spellCheck={false}
        style={{ color: '#FF46A0', height, margin: 'auto' }}
        theme={theme}
        value={value}
        withError={isError}
      />
    </Label>
  );
}
