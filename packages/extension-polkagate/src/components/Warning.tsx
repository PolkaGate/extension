// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../../extension-ui/src/types';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { Theme } from '@mui/material';

interface Props {
  children: React.ReactNode;
  className?: string;
  isBelowInput?: boolean;
  isDanger?: boolean;
  theme: Theme;
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

export default React.memo(styled(Warning)<Props>(({ theme }: Props) => `
  display: flex;
  flex-direction: row;
  padding-left: 18px;
  // color: ${theme.subTextColor};
  margin-right: 20px;
  margin-top: 37px;
  // border-left: ${`0.25rem solid ${theme.iconWarningColor}`};

  &.belowInput {
    font-size: 14px;

    &.danger {
      position: absolute;
      margin-top:0;
      margin-left: -15px;
    }
  }

  // &.danger {
  //   border-left-color: ${theme.buttonBackgroundDanger};
  // }

  .warning-message {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 300;
  }

  .warningImage {
    margin: 5px 10px 5px 0;
    color: ${theme.palette.warning.main};
    font-size: 19px
  }
`));
