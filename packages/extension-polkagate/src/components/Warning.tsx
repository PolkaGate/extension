// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Theme } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
  className?: string;
  isBelowInput?: boolean;
  isDanger?: boolean;
  theme: Theme;
  fontWeight?: number;
  marginTop?: number;
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

export default React.memo(styled(Warning)<Props>(({ fontWeight = 300, isDanger, marginTop = 30, theme }: Props) => `
  display: flex;
  flex-direction: row;
  padding-left: 18px;
  margin-right: 20px;
  margin-top: ${marginTop}px;

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
    font-size: 14px;
    font-weight: ${fontWeight};
  }

  .warningImage {
    margin: 5px 10px 5px 0;
    color: ${isDanger ? theme.palette.warning.main : theme.palette.text.primary};
    font-size: 19px
  }
`));
