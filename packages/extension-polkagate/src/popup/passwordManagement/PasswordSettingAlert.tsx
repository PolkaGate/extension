// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTheme } from '@emotion/react';
import { Grid } from '@mui/material';
import React from 'react';

import { Warning } from '../../components';
import { useTranslation } from '../../hooks';

function PasswordSettingAlert(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Warning
      fontWeight={300}
      theme={theme}
    >
      <Grid item>
        <b>{t<string>('Remember your password well and keep it safe. ')}</b>
        {t<string>('If you forget your password, you need to reimport your accounts and make a new password. Export and store your accounts securely to avoid losing them.')}
      </Grid>
    </Warning>
  );
}

export default PasswordSettingAlert;
