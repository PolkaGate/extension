// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';

import { Infotip2 } from '../../components';
import { useTranslation } from '../../hooks';

const imagePath = `https://raw.githubusercontent.com/PolkaGate/backgrounds/main/${process.env.BG_THEME || 'general'}`;

type BgImage = {
  dark: string;
  light: string;
}

const DEFAULT_BG_IMG = { dark: '', light: '' };

interface Props {
  bgImage: string | undefined;
  setBgImage: React.Dispatch<React.SetStateAction<string | undefined>>
}

export default function AiBackgroundImage({ bgImage, setBgImage }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const imgRef = useRef({ dark: 0, light: 0 });
  const mode = theme.palette.mode;

  const clearBackground = useCallback((): void => {
    setBgImage(undefined);
    imgRef.current[mode] = 0;
    chrome.storage.local.get('backgroundImage', (res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (res?.backgroundImage?.[mode]) {
        res.backgroundImage[mode] = '';

        chrome.storage.local.set({ backgroundImage: res.backgroundImage as BgImage }).catch(console.error);
      }
    });
  }, [mode, setBgImage]);

  const handleImageError = useCallback(() => {
    clearBackground(); // clear images on error whether the url does not exist on the server or the user is offline
  }, [clearBackground]);

  const updateImageUrlInStorage = useCallback((imgUrl: string) => {
    imgUrl && chrome.storage.local.get('backgroundImage', (res) => {
      const maybeSavedImageUrl = (res?.backgroundImage || DEFAULT_BG_IMG) as BgImage;

      maybeSavedImageUrl[mode] = imgUrl;
      chrome.storage.local.set({ backgroundImage: maybeSavedImageUrl }).catch(console.error);
    });

    imgRef.current[mode] = imgRef.current[mode] + 1;
  }, [mode]);

  const tryToApplyImg = useCallback((url: string) => {
    const maybeBackgroundImage = new Image();

    maybeBackgroundImage.src = url;
    maybeBackgroundImage.onerror = handleImageError;

    maybeBackgroundImage.onload = () => {
      setBgImage(url);
      updateImageUrlInStorage(url);
    };
  }, [handleImageError, setBgImage, updateImageUrlInStorage]);

  useEffect(() => {
    /** initiate background image on load and UI theme change */
    chrome.storage.local.get('backgroundImage', (res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const imgUrl = res?.backgroundImage?.[mode] as string;

      tryToApplyImg(imgUrl);
    });
  }, [tryToApplyImg, mode]);

  const onAiBackground = useCallback((): void => {
    const imageUrl = `${imagePath}/${mode}/${imgRef.current[mode]}.jpeg`;

    tryToApplyImg(imageUrl);
  }, [mode, tryToApplyImg]);

  return (
    <Grid container justifyContent='space-between' sx={{ backgroundColor: bgImage ? 'transparent' : 'background.default', bottom: '3px', color: theme.palette.text.primary, position: 'absolute', zIndex: 6, p: '0 10px 0' }}>
      <Grid item onClick={clearBackground} xs={1.5}>
        {bgImage &&
          <Typography sx={{ cursor: 'pointer', fontSize: '11px', userSelect: 'none' }}>
            {t('Clear')}
          </Typography>
        }
      </Grid>
      <Grid alignItems='baseline' container item justifyContent='flex-end' xs>
        <Grid item onClick={onAiBackground}>
          <Infotip2 showInfoMark text={t('Click to set an AI-generated background.')}>
            <Typography sx={{ cursor: 'pointer', fontSize: '11px', pl: '5px', userSelect: 'none' }}>
              {t('AI Background')}
            </Typography>
          </Infotip2>
        </Grid>
      </Grid>
    </Grid>
  );
}
