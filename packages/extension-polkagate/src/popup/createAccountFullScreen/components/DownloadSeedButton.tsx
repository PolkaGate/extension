// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '../../../hooks';

interface Props {
  value: string;
  text?: string | null | undefined;
  iconSize?: number;
  style?: SxProps<Theme>;
  bouncingTimeInSec?: number;
}

function DownloadSeedButton({ bouncingTimeInSec = 3, iconSize = 23, style, text, value }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isBouncing, setIsBouncing] = useState<boolean>(true);

  const onDownload = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([value], { type: 'text/plain' });

    element.href = URL.createObjectURL(file);
    element.download = 'your-recovery-phrase.txt';
    document.body.appendChild(element);
    element.click();
  }, [value]);

  useEffect(() => {
    setTimeout(() => setIsBouncing(false), bouncingTimeInSec * 1000);
  }, [bouncingTimeInSec]);

  return (
    <Grid container item sx={style}>
      <IconButton
        onClick={onDownload}
        sx={{ borderRadius: '5px', m: '5px', p: '2px' }}
      >
        <Grid alignItems='center' container item width='fit-content'>
          <FontAwesomeIcon
            bounce={isBouncing}
            color={theme.palette.secondary.light}
            fontSize={iconSize}
            icon={faFileDownload}
          />
          <Typography fontSize='16px' fontWeight={400} sx={{ pl: '8px', textDecoration: 'underline' }}>
            {t<string>(text ?? 'Download')}
          </Typography>
        </Grid>
      </IconButton>
    </Grid>
  );
}

export default React.memo(DownloadSeedButton);
