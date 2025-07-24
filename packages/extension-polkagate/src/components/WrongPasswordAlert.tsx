// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import { Grid, Theme, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../hooks';
import { Warning } from '.';

export default function WrongPasswordAlert({ bgcolor, fontSize }: { bgcolor?: string, fontSize?: string; }): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid container height='35px' sx={{ bgcolor }}>
      <Warning
        fontSize={fontSize}
        fontWeight={400}
        isDanger
        marginTop={0}
        theme={theme}
      >
        {t<string>('You’ve used an incorrect password. Try again.')}
      </Warning>
    </Grid>
  );
}
