// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface Props {
  color?: string;
  text: string;
  style?: React.CSSProperties;
  textPartInColor?: string;
  backgroundColor?: string;
}

function TwoToneText ({ backgroundColor, color = '#BEAAD8', style = {}, text, textPartInColor = '' }: Props): React.ReactElement {
  if (!textPartInColor) {
    return <span style={{ ...style }}>{text}</span>;
  }

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: text.replace(
          textPartInColor,
          `<span style="color: ${color}; ${
            backgroundColor ? `background-color: ${backgroundColor}; border-radius: 6px; padding: 0 5px 0` : ''
          }">${textPartInColor}</span>`
        )
      }}
      style={{ ...style }}
    />
  );
}

export default React.memo(TwoToneText);
