// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemAvatarProp } from '../utils/types';

import { faGem } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OpenInFull as OpenInFullIcon } from '@mui/icons-material';
import { Avatar, Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ALT_NFT_BGCOLOR_DARK, ALT_NFT_BGCOLOR_LIGHT } from '../utils/constants';
import { WithLoading } from './Details';

const SIZE = {
  large: {
    height: '400px',
    width: '320px'
  },
  small: {
    height: '220px',
    width: '188px'
  }
};

export default function ItemAvatar({ image, onFullscreen, size = 'small' }: ItemAvatarProp): React.ReactElement {
  const theme = useTheme();
  const [showLoading, setShowLoading] = useState<boolean>(true);

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  const onLoad = useCallback(() => {
    setShowLoading(false);
  }, []);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: isDarkMode ? ALT_NFT_BGCOLOR_DARK : ALT_NFT_BGCOLOR_LIGHT, borderRadius: size === 'small' ? '10px 10px 5px 5px' : '10px', height: SIZE[size].height, overflow: 'hidden', width: SIZE[size].width }}>
      {image &&
        <>
          <WithLoading
            loaded={!showLoading}
          >
            <Avatar
              draggable={false}
              onLoad={onLoad}
              src={image}
              sx={{
                display: showLoading ? 'none' : 'initial',
                height: '100%',
                img: {
                  objectFit: 'contain',
                  objectPosition: 'center'
                },
                pointerEvents: 'none',
                width: '100%'
              }}
              variant='square'
            />
          </WithLoading>
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
        <FontAwesomeIcon
          color={theme.palette.text.primary}
          fontSize='70px'
          icon={faGem}
        />
      }
    </Grid>
  );
}
