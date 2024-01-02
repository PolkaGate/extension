// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Theme } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

interface Props {
  bgColor?: string;
  children: React.ReactNode;
  className?: string;
  isBelowInput?: boolean;
  isDanger?: boolean;
  iconDanger?: boolean;
  theme: Theme;
  fontSize?: string;
  fontWeight?: number;
  marginTop?: number;
  paddingLeft?: number;
  marginRight?: number;
}

function Warning({ children, className = '', isBelowInput, isDanger }: Props): React.ReactElement<Props> {
  return (
    <div className={`${className} ${isDanger ? 'danger' : ''} ${isBelowInput ? 'belowInput' : ''}`}>
      <FontAwesomeIcon
        className='warningImage'
        icon={faExclamationTriangle}
      />
      <div className='warning-message'>{children}</div>
    </div>
  );
}

export default React.memo(styled(Warning)<Props>(({ bgColor, fontSize = '14px', fontWeight = 300, iconDanger, isBelowInput, isDanger, marginRight, marginTop = 30, paddingLeft, theme }: Props) => `
  display: flex;
  flex-direction: row;
  padding-left: ${paddingLeft || 18}px;
  margin-right: ${marginRight || 20}px;
  margin-top: ${marginTop}px;
  background-color:${bgColor || 'transparent'};

  &.belowInput {
    font-size: 14px;

    &.danger {
      position: absolute;
      margin-top:0;
      margin-left: -15px;
    }
  }

  .warning-message {
    display: flex;
    align-items: center;
    color: ${isDanger ? theme.palette.warning.main : theme.palette.text.primary};
    font-size: ${fontSize};
    font-weight: ${fontWeight};
  }

  .warningImage {
    margin: 5px 10px 5px 0;
    color: ${isDanger || iconDanger ? theme.palette.warning.main : theme.palette.text.primary};
    font-size: ${isBelowInput ? '17px' : '19px'}
  }
`));
