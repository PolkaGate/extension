// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTheme } from '@mui/material';

export default function useIsDark(): boolean {
  const theme = useTheme();

  return theme.palette.mode === 'dark';
}
