// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { Maximize4 } from 'iconsax-react';
import React, { useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { MyTooltip } from '../components';
import { useIsBlueish, useIsDark, useIsHovered, useSelectedAccount, useTranslation } from '../hooks';
import useAccountSelectedChain from '../hooks/useAccountSelectedChain';
import { windowOpen } from '../messaging';

interface Props {
  url?: string;
}

function FullscreenModeButton({ url }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const buttonContainer = useRef(null);
  const hovered = useIsHovered(buttonContainer);
  const { pathname } = useLocation();
  const account = useSelectedAccount();
  const maybeSelectedGenesishash = useAccountSelectedChain(account?.address);
  const isBlueish = useIsBlueish();

  const onClick = useCallback(() => {
    if (url) {
      return windowOpen(url).catch(console.error);
    }

    if (account && pathname.includes('token')) {
      return windowOpen(`/accountfs/${account.address}/${maybeSelectedGenesishash ?? POLKADOT_GENESIS}/0`).catch(console.error);
    }

    if (pathname.includes('history')) {
      return windowOpen('/historyfs').catch(console.error);
    }

    return windowOpen('/').catch(console.error);
  }, [account, maybeSelectedGenesishash, pathname, url]);

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
    <MyTooltip
      content={t('Fullscreen')}
    >
      <Box
        onClick={onClick as unknown as () => void}
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
        <Maximize4 color={hovered ? '#EAEBF1' : isBlueish ? theme.palette.text.highlight : isDark ? '#AA83DC' : '#291443'} size={18} style={{ zIndex: 5 }} variant='Linear' />
        <Grid sx={gradientBackgroundStyle} />
      </Box>
    </MyTooltip>
  );
}

export default FullscreenModeButton;
