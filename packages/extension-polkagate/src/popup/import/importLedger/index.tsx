// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import Framework from '../../../fullscreen/onboarding/Framework';
import { useFullscreen } from '../../../hooks';
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
  useFullscreen();

  const [mode, setMode] = useState<MODE>(MODE.INDEX);

  return (
    <Framework width='600px'>
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
      }  {mode === MODE.LEGACY &&
        <LegacyApps
          setMode={setMode}
        />
      }
    </Framework>
  );
}
