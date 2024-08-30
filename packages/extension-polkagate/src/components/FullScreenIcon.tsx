// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { useTranslation } from '../hooks';
import { windowOpen } from '../messaging';
import Infotip2 from './Infotip2';

interface Props {
  url: string;
  isSettingSubMenu?: boolean;
}

export default function FullScreenIcon ({ isSettingSubMenu, url }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [scale, setScale] = useState<string>('1');

  const iconColor = useMemo(() => {
    if (isSettingSubMenu) {
      return theme.palette.secondary.light;
    }

    const isOnHomePage = url === '/';

    if (isOnHomePage && theme.palette.mode === 'dark') {
      return theme.palette.text.primary;
    }

    return theme.palette.secondary.light;
  }, [isSettingSubMenu, theme, url]);

  const onWindowOpen = useCallback(() => {
    windowOpen(url).catch(console.error);
  }, [url]);

  const increaseScale = useCallback(() => {
    setScale('1.2');
  }, []);

  const decreaseScale = useCallback(() => {
    setScale('1');
  }, []);

  return (
    <Grid container item width='fit-content'>
      <Infotip2
        text={t('Fullscreen')}
      >
        <IconButton
          onClick={onWindowOpen}
          onMouseEnter={increaseScale}
          onMouseLeave={decreaseScale}
          sx={{ height: '35px', ml: '-5px', p: 0, width: '35px' }}
        >
          <FontAwesomeIcon
            color={iconColor}
            icon={faExpand}
            style={{ height: '25px', transform: `scale(${scale})`, transitionDuration: '150ms' }}
          />
        </IconButton>
      </Infotip2>
    </Grid>
  );
}
