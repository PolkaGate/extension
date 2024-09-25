// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { OpenInFull as OpenInFullIcon } from '@mui/icons-material';
import { Avatar, Grid, IconButton, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { NFTIcon } from '../../components';
import { ALT_NFT_BGCOLOR_DARK, ALT_NFT_BGCOLOR_LIGHT } from './constants';

interface ItemAvatarProp {
  image: string | null | undefined;
  height?: string;
  width?: string;
  onFullscreen?: () => void;
}

export default function ItemAvatar ({ height = '220px', image, onFullscreen, width = '190px' }: ItemAvatarProp): React.ReactElement {
  const theme = useTheme();

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: isDarkMode ? ALT_NFT_BGCOLOR_DARK : ALT_NFT_BGCOLOR_LIGHT, borderRadius: '10px 10px 5px 5px', height, overflow: 'hidden', width }}>
      {image &&
        <>
          <Avatar
            src={image}
            sx={{
              height: '100%',
              width: '100%'
            }}
            variant='square'
          />
          {onFullscreen && (
            <IconButton
              onClick={onFullscreen}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                },
                backgroundColor: 'rgba(0,0,0,0.5)',
                bottom: 8,
                color: 'white',
                position: 'absolute',
                right: 8
              }}
            >
              <OpenInFullIcon />
            </IconButton>
          )}
        </>
      }
      {image === null &&
        <NFTIcon
          color={theme.palette.backgroundFL.primary}
          height={70}
          width={70}
        />
      }
    </Grid>
  );
}
