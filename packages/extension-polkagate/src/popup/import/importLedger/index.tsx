// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useState } from 'react';

import FullScreenHeader from '../../../fullscreen/governance/FullScreenHeader';
import { useFullscreen } from '../../../hooks';
import GenericApp from './GenericApp';
import LedgerOptions from './LedgerOptions';
import LegacyApps from './LegacyApps';
import MigrationApp from './MigrationApp';

export enum MODE {
  INDEX,
  LEGACY,
  GENERIC,
  MIGRATION
}

export default function ImportLedger(): React.ReactElement {
  useFullscreen();

  const [mode, setMode] = useState<MODE>(MODE.INDEX);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      {mode === MODE.INDEX &&
        <LedgerOptions
          setMode={setMode}
        />
      }
      {mode === MODE.LEGACY &&
        <LegacyApps
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
    </Grid>
  );
}
