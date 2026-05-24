// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import HistoryRow from './HistoryRow';

function HistoryLoading({ itemsCount = 4 }: { itemsCount?: number; }) {
  return (
    <div style={{ display: 'grid', position: 'relative', rowGap: '5px', zIndex: 1 }}>
      {Array.from({ length: itemsCount }).map((_, index) => (
        <HistoryRow key={index} />
      ))}
    </div>
  );
}

export default HistoryLoading;
