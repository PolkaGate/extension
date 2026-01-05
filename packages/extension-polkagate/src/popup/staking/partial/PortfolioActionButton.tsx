// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import type { Icon } from 'iconsax-react';

import { Grid, Typography } from '@mui/material';
import React, { useMemo, useRef } from 'react';

import { useIsBlueish } from '@polkadot/extension-polkagate/src/hooks';
import { noop } from '@polkadot/util';

import useIsHovered from '../../../hooks/useIsHovered';

export interface PortfolioActionButtonProps {
  text: string;
  Icon: Icon;
  onClick: () => void;
  disabled?: boolean;
  isFullScreen?: boolean;
}

export default function PortfolioActionButton ({ Icon, disabled = false, isFullScreen = false, onClick, text }: PortfolioActionButtonProps): React.ReactElement {
  const containerRef = useRef(null);
  const isHovered = useIsHovered(containerRef);
  const isBlueish = useIsBlueish();

  const background = useMemo(() =>
    isFullScreen
      ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)'
      : '#809ACB40'
  , [isFullScreen]);

  return (
    <Grid alignItems='center' container item onClick={disabled ? noop : onClick} ref={containerRef}
      sx={{
        ':hover': { background, borderColor: 'transparent' },
        bgcolor: isFullScreen ? '#05091C' : 'transparent',
        border: isFullScreen ? 'none' : '1px solid',
        borderColor: '#809ACB40',
        borderRadius: '12px',
        columnGap: '5px',
        cursor: disabled ? 'default' : 'pointer',
        p: isFullScreen ? '10px 14px' : '4px 7px',
        transition: 'all 150ms ease-out',
        width: 'fit-content'
      }}
    >
      <Icon color={isHovered && isFullScreen ? '#fff' : isBlueish ? '#809ACB' : '#AA83DC'} size={isFullScreen ? 24 : 19} variant='Bulk' />
      <Typography color={isFullScreen ? 'text.primary' : 'text.highlight'} variant={isFullScreen ? 'B-6' : 'B-2'}>
        {text}
      </Typography>
    </Grid>
  );
}
