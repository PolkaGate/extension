// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/* eslint-disable header/header */

import React from 'react';

interface ColorContextSchema {
  toggleColorMode: () => void;
}

const ColorContext = React.createContext<ColorContextSchema>(
  {} as ColorContextSchema
);

export default ColorContext;