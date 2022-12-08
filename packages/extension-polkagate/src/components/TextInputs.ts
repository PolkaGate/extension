// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Theme } from '@mui/material/styles';
import styled, { css } from 'styled-components';

interface Props {
  fontSize?: string;
  withError?: boolean;
  theme: Theme;
  width?: string;
  padding?: string;
  textAlign?: string;
  disabled?: boolean;
  height?: string;
  margin?: string;
  max?: number;
}
const TextBox = css(({ disabled = false, fontSize, height, margin, max, padding, textAlign, theme, width, withError }: Props) => `
  background: ${theme.palette.background.paper};
  border-radius: 5px;
  disabled: ${disabled}
  &:disabled {
    background-color: ${theme.palette.text.disabled};
  }
  border: ${withError ? 2 : 1}px solid ${withError ? theme.palette.warning.main : theme.palette.secondary.light};
  box-sizing: border-box;
  display: block;
  font-size: ${fontSize || '16px'};
  min-height: 31px;
  height: ${height};
  margin: ${margin};
  max:${max}
  padding: ${padding || '12px'};
  text-align: ${textAlign || 'left'};
  font - weight: 400;
  &:: -webkit - outer - spin - button,
  &:: -webkit - inner - spin - button {
  -webkit - appearance: none;
  margin: 0;
}
-moz - appearance: textfield;
resize: none;
width: ${width || '100%'};
font - family: ${theme.typography.allVariants.fontFamily};
  &:focus{
    ${!withError
    ? `outline: 2px solid ${theme.palette.action.focus};
    border: none;`
    : 'outline: none;'
}
  filter: drop - shadow(0px 0px 3px rgba(204, 88, 123, 0.83));
}
  &::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: #9A7DB2;
}
`);

export const TextArea = styled.textarea<Props>`${TextBox} `;
export const Input = styled.input<Props>`${TextBox} `;
