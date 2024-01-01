// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
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
  changeBackground?: boolean;
}

function Switch({ changeBackground = false, checkedLabel, className, fontSize = '18px', fontWeight = 300, isChecked = false, onChange, uncheckedLabel }: Props): React.ReactElement<Props> {
  return (
    <Grid alignItems='center'
      className={className}
      container
      item
      width='fit-content'>
      <Typography
        display='inline'
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
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
          style={{ backgroundColor: isChecked && changeBackground ? '#C1FF83' : 'transparent' }} />
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

export default styled(Switch)(({ theme }: Props) => `
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
    border: 1px solid ${theme.palette.secondary.light};

    &:before {
      position: absolute;
      content: '';
      height: 16.2px;
      width: 16.2px;
      left: 0.7px;
      bottom: 0.75px;
      background-color: ${theme.palette.secondary.light};
      transition: 0.4s;
      border-radius: 50%;
    }
  }
`);
