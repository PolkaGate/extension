// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';

import { Fade, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { useManifest, useTranslation } from '../hooks';

interface Props {
  isBlueish?: boolean;
  style?: React.CSSProperties;
  shortLabel?: boolean;
  showLabel?: boolean;
  variant?: string;
  textColor?: string;
}

function Version({ isBlueish, shortLabel = true, showLabel = true, style = {}, textColor, variant = 'B-1' }: Props): React.ReactElement {
  const version = useManifest()?.version;
  const { t } = useTranslation();

  const label = useMemo(() => showLabel
    ? shortLabel
      ? `v.${version}`
      : t('Version {{version}}', { replace: { version } })
    : `${version}`
    , [showLabel, shortLabel, t, version]);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ pt: '8px', ...style }}>
      <Fade in={true} timeout={1000}>
        <Typography color={textColor ?? (isBlueish ? '#809ACB66' : '#674394')} variant={variant as Variant}>
          {label}
        </Typography>
      </Fade>
    </Grid>
  );
}

export default React.memo(Version);
