// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Theme } from '@mui/material/styles';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import Checkmark from '../assets/checkmark.svg';

interface Props {
  checked: boolean;
  className?: string;
  label: string;
  onChange?: (checked: boolean) => void;
  onClick?: () => void;
  theme?: Theme;
  style?: React.CSSProperties | undefined;
}

function Checkbox({ checked, className, label, onChange, onClick, style }: Props): React.ReactElement<Props> {
  const _onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange && onChange(event.target.checked),
    [onChange]
  );

  const _onClick = useCallback(
    () => onClick && onClick(),
    [onClick]
  );

  return (
    <div
      className={className}
      style={{ margin: '41px auto 10px', ...style }}
    >
      <label color='text.primary'>
        {label}
        <input
          checked={checked}
          onChange={_onChange}
          onClick={_onClick}
          type='checkbox'
        />
        <span />
      </label>
    </div>
  );
}

export default styled(Checkbox)(({ theme }: Props) => `
  label {
    display: block;
    position: relative;
    cursor: pointer;
    user-select: none;
    padding-left: 55px;
    font-size: 18px;
    font-weight: 300;
    margin: auto;

    & input {
      position: absolute;
      opacity: 0;
      left: 15px;
      cursor: pointer;
      height: 20px;
      width: 20px;
      border-color: ${theme.palette.secondary.light};
    }

    & span {
      position: absolute;
      top: 2px;
      left: 25px;
      height: 20px;
      width: 20px;
      border-radius: 5px;
      background-color: transparent;
      border: 0.5px solid ${theme.palette.secondary.light};
      &:after {
        content: '';
        display: none;
        width: 16px;
        height: 16px;
        position: absolute;
        left: 0;
        top: 0;
        mask: url(${Checkmark});
        mask-size: cover;
        background: ${theme.palette.secondary.light};
      }
    }
  }
  input:checked ~ span:after {
    display: block;
  }
`);
