// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid } from '@mui/material';
import { Maximize4 } from 'iconsax-react';
import React, { useCallback, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { Tooltip } from '../components';
import { useIsDark, useSelectedAccount, useTranslation } from '../hooks';
import { windowOpen } from '../messaging';

interface Props {
  url?: string;
}

function FullscreenModeButton ({ url = '/' }: Props) {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const buttonContainer = useRef(null);
  const { pathname } = useLocation();
  const account = useSelectedAccount();

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);
  const open = useCallback(() => {
    windowOpen(account && pathname !== '/' ? `/accountfs/${account.address}/0` : url).catch(console.error);
  }, [account, pathname, url]);

  const gradientBackgroundStyle = {
    '&::after': {
      background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
      borderRadius: '10px',
      content: '""',
      inset: 0,
      opacity: hovered ? 1 : 0,
      position: 'absolute',
      transition: 'all 250ms ease-out',
      zIndex: 1
    },
    background: isDark ? '#BFA1FF26' : '#FFFFFF8C',
    borderRadius: '10px',
    height: '30px',
    inset: 0,
    position: 'absolute',
    transition: 'all 250ms ease-out',
    width: '30px'
  };

  return (
    <>
      <Box
        onClick={open}
        onMouseEnter={toggleHovered}
        onMouseLeave={toggleHovered}
        ref={buttonContainer}
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'flex',
          height: '30px',
          justifyContent: 'center',
          position: 'relative',
          width: '30px'
        }}
      >
        <Maximize4 color={hovered ? '#EAEBF1' : isDark ? '#AA83DC' : '#291443'} size={18} style={{ zIndex: 5 }} variant='Linear' />
        <Grid sx={gradientBackgroundStyle} />
      </Box>
      <Tooltip content={t('Fullscreen')} targetRef={buttonContainer} />
    </>
  );
}

export default FullscreenModeButton;
