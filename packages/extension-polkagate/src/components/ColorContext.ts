// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PaletteMode } from '@mui/material';

import React from 'react';

interface ColorContextSchema {
  toggleColorMode: () => void;
  setColorMode: (mode: PaletteMode) => void;
}

const ColorContext = React.createContext<ColorContextSchema>(
  {} as ColorContextSchema
);

export default ColorContext;
