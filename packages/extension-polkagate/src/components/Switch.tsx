// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Theme } from '@mui/material/styles';

import { Grid, Typography } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
  theme: Theme;
  onChange: () => void;
  checkedLabel?: string;
  uncheckedLabel?: string;
  fontSize?: string;
  fontWeight?: number;
  isChecked?: boolean;
  defaultColor?: boolean;
}

export const CHECKED_COLOR = '#46890C';
export const UNCHECKED_COLOR = '#838383';

function Switch({ checkedLabel, className, fontSize = '18px', fontWeight = 300, isChecked = false, onChange, uncheckedLabel }: Props): React.ReactElement<Props> {
  return (
    <Grid alignItems='center' className={className} container item width='fit-content'>
      <Typography display='inline' fontSize={fontSize} fontWeight={fontWeight}>
        {uncheckedLabel}
      </Typography>
      <label>
        <input
          checked={isChecked}
          className='checkbox'
          onChange={onChange}
          type='checkbox'
        />
        <span
          className='slider'
          style={{ backgroundColor: 'transparent' }}
        />
      </label>
      <Typography
        display='inline'
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
        {checkedLabel}
      </Typography>
    </Grid>
  );
}

export default styled(Switch)(({ defaultColor, isChecked, theme }: Props) => `
  label {
    position: relative;
    display: inline-block;
    width: 41px;
    height: 19.5px;
    margin: 8px;
  }

  .checkbox {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider:before {
      transform: translateX(21.7px);
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: '${theme.palette.background.default}';
    transition: 0.2s;
    border-radius: 100px;
    border: 1px solid ${defaultColor
    ? theme.palette.secondary.light
    : isChecked
      ? CHECKED_COLOR
      : UNCHECKED_COLOR};

    &:before {
      position: absolute;
      content: '';
      height: 16.2px;
      width: 16.2px;
      left: 0.7px;
      bottom: 0.75px;
      background-color: ${defaultColor
    ? theme.palette.secondary.light
    : isChecked
      ? CHECKED_COLOR
      : UNCHECKED_COLOR};
      transition: 0.4s;
      border-radius: 50%;
    }
  }
`);
