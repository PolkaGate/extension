// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Theme } from '@mui/material/styles';
import styled, { css } from 'styled-components';

interface Props {
  withError?: boolean;
  theme: Theme;
}
const TextBox = css(({ theme }: Props) => `
  background: ${theme.palette.background.paper};
  border-radius: 5px;
  border: 1px solid ${theme.palette.secondary.light};
  box-sizing: border-box;
  display: block;
  font-size: 16px;
  min-height: 31px;
  padding: 12px;
  font-weight: 400;
  resize: none;
  width: 100%;
  font-family: ${theme.typography.allVariants.fontFamily};
  &:focus{
    outline: 1.5px solid ${theme.palette.secondary.light};
    // box-shadow: 0 0 3px;
  }
`);

export const TextArea = styled.textarea<Props>`${TextBox}`;
export const Input = styled.input<Props>`${TextBox} `;
