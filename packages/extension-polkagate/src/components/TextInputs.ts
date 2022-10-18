// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Theme } from '@mui/material/styles';
import styled, { css } from 'styled-components';

interface Props {
  fontSize?: string;
  withError?: boolean;
  theme: Theme;
}
const TextBox = css(({ fontSize, theme, withError }: Props) => `
  background: ${theme.palette.background.paper};
  border-radius: 5px;
  border: ${withError ? 2 : 1}px solid ${withError ? theme.palette.warning.main : theme.palette.secondary.light};
  box-sizing: border-box;
  display: block;
  font-size: ${fontSize || '16px'};
  min-height: 31px;
  padding: 12px;
  font-weight: 400;
  resize: none;
  width: 100%;
  font-family: ${theme.typography.allVariants.fontFamily};
  &:focus{
    ${!withError
    ? `outline: 2px solid ${theme.palette.action.focus};
    border: none;`
    : 'outline: none;'}
    filter: drop-shadow(0px 0px 3px rgba(204, 88, 123, 0.83));
  }
`);

export const TextArea = styled.textarea<Props>`${TextBox}`;
export const Input = styled.input<Props>`${TextBox} `;
