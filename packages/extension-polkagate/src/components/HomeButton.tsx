// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box } from '@mui/material';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';

import { logoBlackBirdTransparent, logoTransparent, logoWhiteTransparent } from '../assets/logos';
import { useIsDark, useTranslation } from '../hooks';
import { ActionContext } from './contexts';
import { Tooltip } from '.';

interface Props {
  type?: 'default' | 'active';
}

function HomeButton ({ type = 'default' }: Props) {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const onAction = useContext(ActionContext);
  const buttonContainer = useRef(null);

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);
  const goHome = useCallback(() => onAction('/'), [onAction]);

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
        onMouseEnter={toggleHovered}
        onMouseLeave={toggleHovered}
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
