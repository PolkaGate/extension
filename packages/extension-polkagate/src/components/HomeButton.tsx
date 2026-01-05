// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { logoBlackBirdTransparent, logoTransparent, logoWhiteTransparent } from '../assets/logos';
import { useIsDark, useIsHovered, useTranslation } from '../hooks';
import { Tooltip } from '.';

interface Props {
  type?: 'default' | 'active';
}

function HomeButton ({ type = 'default' }: Props) {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const navigate = useNavigate();
  const buttonContainer = useRef(null);
  const hovered = useIsHovered(buttonContainer);

  const goHome = useCallback(() => navigate('/') as void, [navigate]);

  const src = useMemo(() => {
    if (type === 'active') {
      return logoWhiteTransparent as string;
    } else {
      if (hovered) {
        return (isDark ? logoBlackBirdTransparent : logoWhiteTransparent) as string;
      } else {
        return (isDark ? logoTransparent : logoBlackBirdTransparent) as string;
      }
    }
  }, [hovered, isDark, type]);

  return (
    <>
      <Box
        component='img'
        onClick={goHome}
        ref={buttonContainer}
        src={src}
        sx={{
          '&:hover': {
            bgcolor: type === 'active' ? '#E30B7B' : '#EAEBF1'
          },
          bgcolor: type === 'active' ? '#E30B7B' : isDark ? '#BFA1FF26' : '#FFFFFF8C',
          borderRadius: '10px',
          cursor: 'pointer',
          height: '30px',
          p: '1px',
          transition: 'all 250ms ease-out',
          width: '30px'
        }}
      />
      <Tooltip content={t('Home')} targetRef={buttonContainer} />
    </>
  );
}

export default HomeButton;
