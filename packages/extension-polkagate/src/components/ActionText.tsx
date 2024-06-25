// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { MouseEventHandler } from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
  icon?: IconDefinition;
  onClick: MouseEventHandler<HTMLDivElement>;
  text: string;
}

function ActionText({ className, icon, onClick, text }: Props): React.ReactElement<Props> {
  return (
    <div
      className={className}
      onClick={onClick}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      <span color='text.primary'>{text}</span>
    </div>
  );
}

export default styled(ActionText)(() => `
  cursor: pointer;
  margin-top: 10px;
  span {
    font-size: 16px;
    text-decoration-line: underline;
    font-weight: 300;
  }

  .svg-inline--fa {
    color: #BA2882;
    display: inline-block;
    margin-right: 12px;
    margin-left: 18px;
    position: relative;
    font-size: 20px
  }
`);
