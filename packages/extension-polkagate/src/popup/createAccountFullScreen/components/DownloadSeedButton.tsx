// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import DownloadIcon from '@mui/icons-material/Download';
import { Grid, IconButton, SxProps, Theme, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { useTranslation } from '../../../hooks';

interface Props {
  value: string;
  text?: string | null | undefined;
  iconSize?: number;
  style?: SxProps<Theme>;
}

function DownloadSeedButton ({ iconSize = 30, style, text, value }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const onDownload = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([value], { type: 'text/plain' });

    element.href = URL.createObjectURL(file);
    element.download = 'your-recovery-phrase.txt';
    document.body.appendChild(element);
    element.click();
  }, [value]);

  return (
    <Grid container item sx={style}>
      <IconButton
        onClick={onDownload}
        sx={{ borderRadius: '5px', m: '5px', p: '2px' }}
      >
        <Grid alignItems='center' container item width='fit-content'>
          <DownloadIcon
            sx={{ color: 'secondary.light', fontSize: `${iconSize}px` }}
          />
          <Typography fontSize='16px' fontWeight={400} sx={{ pl: '8px', textDecoration: 'underline' }}>
            {t<string>(text ?? 'Download')}
          </Typography>
        </Grid>
      </IconButton>
    </Grid>
  );
}

export default (DownloadSeedButton);
