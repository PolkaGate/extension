// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
  className?: string;
  label: string;
  style?: React.CSSProperties | undefined;
}

function Label({ children, className, label, style }: Props): React.ReactElement<Props> {
  return (
    <div
      className={className}
      style={{ ...style }}
    >
      <label>{label}</label>
      {children}
    </div>
  );
}

export default styled(Label)(() => `
  label {
    font-size: 14px;
    font-weight: 300;
    text-transform: none;
  }
`);
