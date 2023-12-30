// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Checkbox, FormControlLabel, SxProps, Theme } from '@mui/material';
import React from 'react';

import { checkBox, checkedBox } from '../assets/icons';

interface Props {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  style?: SxProps<Theme> | undefined
  labelStyle?: React.CSSProperties | undefined
  iconStyle?: React.CSSProperties | undefined
}

export default function Checkbox2({ checked = false, disabled, iconStyle, label, labelStyle = { fontSize: '14px', fontWeight: 300 }, onChange, style }: Props): React.ReactElement<Props> {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          checkedIcon={<img
            src={checkedBox as string}
            style={{ ...iconStyle }}
          />}
          disabled={disabled}
          icon={<img
            src={checkBox as string}
            style={{ ...iconStyle }}
          />}
          onChange={onChange}
          sx={{ p: 0, pr: label && '5px' }}
        />
      }
      label={
        <span style={{ ...labelStyle, userSelect: 'none' }}>
          {label}
        </span>
      }
      sx={{ m: 0, p: 0, ...style }}
    />
  );
}
