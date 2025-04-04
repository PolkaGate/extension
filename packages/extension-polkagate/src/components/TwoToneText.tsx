// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

function TwoToneText ({ color = '#BEAAD8', text, textPartInColor = '' }: { color?: string, text: string, textPartInColor?: string, }): React.ReactElement {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: text.replace(
          textPartInColor,
          `<span style="color: ${color};">${textPartInColor}</span>`
        )
      }}
    />
  );
}

export default React.memo(TwoToneText);
