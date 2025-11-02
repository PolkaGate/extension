// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';
import { ShineEffect } from '@polkadot/extension-polkagate/src/partials';

interface Props {
  Icon: Icon;
  path?: string;
  text?: string;
  onClick?: () => void
  style?: React.CSSProperties;
}

function MenuButton ({ Icon, onClick, path, style = { marginBottom: '8px' }, text }: Props): React.ReactElement {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isHovered, ref } = useIsHovered();

  const getFirstSegment = (p: string | undefined) => p?.split('/')[1];
  const isSelected = getFirstSegment(path) === getFirstSegment(pathname);

  const _onClick = useCallback(() => {
    if (onClick) {
      return onClick();
    }

    path && navigate(path) as void;
  }, [navigate, onClick, path]);

  return (
    <Stack
      alignItems='center'
      direction='row'
      justifyContent='start'
      onClick={_onClick}
      ref={ref}
      sx={{
        ...(isSelected && {
          backdropFilter: 'blur(20px)',
          background: '#2D1E4A80',
          boxShadow: '0px 0px 24px 8px #4E2B7259 inset'
        }),
        '&:hover': {
          backdropFilter: 'blur(20px)',
          background: '#2D1E4A80',
          boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
          transition: 'all 250ms ease-out'
        },
        borderRadius: '16px',
        cursor: 'pointer',
        height: '44px',
        overflow: 'hidden',
        paddingLeft: '30px',
        position: 'relative',
        width: '100%',
        ...style
      }}
    >
      <Icon color={isHovered || isSelected ? '#FF4FB9' : '#AA83DC'} size='20' variant='Bulk' />
      <Typography className='text' color={isHovered || isSelected ? '#FF4FB9' : '#EAEBF1'} ml='25px' sx={{ userSelect: 'none' }} variant='B-2'>
        {text}
      </Typography>
      {
        isSelected &&
        <Box sx={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          filter: 'blur(25px)',
          height: '48px',
          position: 'absolute',
          right: '-48px',
          width: '48px'
        }}
        />
      }
    {isHovered &&  <ShineEffect active={isHovered} />}
    </Stack>
  );
}

export default React.memo(MenuButton);
