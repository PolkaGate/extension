// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CheckBoxOutlineBlankRounded as CheckBoxOutlineBlankRoundedIcon, CheckBoxOutlined as CheckBoxOutlinedIcon } from '@mui/icons-material';
import { Box, Checkbox, FormControlLabel, SxProps, Theme } from '@mui/material';
import React from 'react';

import { checkBox, checkedBox } from '../assets/icons';

interface Props {
  checked?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
  style?: SxProps<Theme> | undefined
  labelStyle?: React.CSSProperties | undefined
}

export default function Checkbox2({ checked = false, label, labelStyle = { fontSize: '14px', fontWeight: 300 }, onChange, style }: Props): React.ReactElement<Props> {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          // checkedIcon={<CheckBoxOutlinedIcon sx={{ color: 'secondary.light' }} />}
          checkedIcon={<img src={checkedBox} />}
          icon={<img src={checkBox} />}
          // icon={<CheckBoxOutlineBlankRoundedIcon sx={{ color: 'secondary.light' }} />}
          onChange={onChange}
          sx={{ p: 0, pr: label && '5px' }}
        />
      }
      label={<span style={{ ...labelStyle }}>{label}</span>}
      sx={{ m: 0, p: 0, ...style }}
    />
  );
}
