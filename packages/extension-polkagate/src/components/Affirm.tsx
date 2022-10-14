// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Theme } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
  className?: string;
  isBelowInput?: boolean;
  isAffirm?: boolean;
  theme: Theme;
}

function Affirm({ children, className = '', isAffirm, isBelowInput }: Props): React.ReactElement<Props> {
  return (
    <div className={`${className} ${isAffirm ? 'affirm' : ''} ${isBelowInput ? 'belowInput' : ''}`}>
      <FontAwesomeIcon
        className='affirmImage'
        icon={faCircleCheck}
      />
      <div className='affirm-message'>{children}</div>
    </div>
  );
}

export default React.memo(styled(Affirm)<Props>(({ theme }: Props) => `
  display: flex;
  flex-direction: row;
  padding-left: 18px;
  margin-right: 20px;
  margin-top: 37px;

  &.belowInput {
    font-size: 14px;

    &.affirm {
      position: absolute;
      margin-top:0;
      margin-left: -15px;
    }
  }

  .affirm-message {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 300;
  }

  .affirmImage {
    margin: 5px 10px 5px 0;
    color: ${theme.palette.success.main};
    font-size: 18px
  }
`));
