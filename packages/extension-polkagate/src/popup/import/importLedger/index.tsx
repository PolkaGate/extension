// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import AdaptiveLayout from '@polkadot/extension-polkagate/src/fullscreen/components/layout/AdaptiveLayout';

import LedgerOptions from './partials/LedgerOptions';
import GenericApp from './generic';
import LegacyApps from './legacy';
import MigrationApp from './migration';

export enum MODE {
  INDEX,
  LEGACY,
  GENERIC,
  MIGRATION
}

export default function ImportLedger (): React.ReactElement {
  const [mode, setMode] = useState<MODE>(MODE.INDEX);

  return (
    <AdaptiveLayout style= {{ maxWidth: '600px', minHeight: '693px' }}>
      {mode === MODE.INDEX &&
        <LedgerOptions
          setMode={setMode}
        />
      }
      {mode === MODE.GENERIC &&
        <GenericApp
          setMode={setMode}
        />
      }
      {mode === MODE.MIGRATION &&
        <MigrationApp
          setMode={setMode}
        />
      }
      {mode === MODE.LEGACY &&
        <LegacyApps
          setMode={setMode}
        />
      }
    </AdaptiveLayout>
  );
}
