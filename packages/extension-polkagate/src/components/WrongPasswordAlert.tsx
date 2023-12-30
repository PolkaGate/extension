// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Theme, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../hooks';
import { Warning } from '.';

export default function WrongPasswordAlert({ bgcolor }: { bgcolor?: SystemStyleObject<Theme> }): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid container height='35px' sx={{ bgcolor }}>
      <Warning
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
