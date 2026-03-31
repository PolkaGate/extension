// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Box, useTheme } from '@mui/material';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { logoWhiteTransparent } from '../assets/logos';
import { useUserAddedChainColor } from '../fullscreen/addNewChain/utils';
import { useIsDark } from '../hooks';
import { convertToCamelCase, sanitizeChainName } from '../util';
import { CHAINS_WITH_BLACK_LOGO, TOKENS_WITH_BLACK_LOGO } from '../util/constants';
import { mapHubToRelay } from '../util/migrateHubUtils';
import resolveLogoInfo from '../util/resolveLogoInfo';
import { GenesisHashOptionsContext } from './contexts';

type LogoVariant = 'single' | 'dual';

interface Props {
  assetSize?: number | string;
  baseTokenSize?: number | string;
  chainName?: string;
  fallbackBackgroundColor?: string;
  fallbackText?: string;
  genesisHash?: string | undefined | null;
  logo?: string;
  logoRoundness?: string;
  secondaryBackgroundColor?: string;
  secondaryLogo?: string;
  secondaryLogoPosition?: string;
  secondaryLogoSize?: number | string;
  showSquare?: boolean;
  size?: number | string;
  style?: React.CSSProperties;
  subLogo?: string;
  subLogoPosition?: string;
  token?: string;
  variant?: LogoVariant;
}

function isImageSource(source: string): boolean {
  return source.startsWith('data:') || source.startsWith('http') || source.startsWith('/') || source.includes('.');
}

function getLogoFallbackText(source: string): string {
  return source
    .replace(/^fa;/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .charAt(0)
    .toUpperCase();
}

function normalizeToWordSet(str: string): Set<string> {
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_]+/)
    .map((word) => word.toLowerCase())
    .filter(Boolean);

  return new Set(words);
}

function haveSameWords(str1: string, str2: string): boolean {
  const set1 = normalizeToWordSet(str1);
  const set2 = normalizeToWordSet(str2);

  if (set1.size !== set2.size) {
    return false;
  }

  for (const word of set1) {
    if (!set2.has(word)) {
      return false;
    }
  }

  return true;
}

function RenderLogoGraphic({ borderRadius, filter, imgRef, size, source, style }: {
  borderRadius: string | number;
  filter: string;
  imgRef?: React.RefObject<HTMLImageElement | null>;
  size: number | string;
  source: string;
  style?: React.CSSProperties;
}) {
  if (isImageSource(source)) {
    return (
      <Avatar
        imgProps={imgRef ? { ref: imgRef } : undefined}
        src={source}
        sx={{
          borderRadius,
          filter,
          height: size,
          width: size,
          ...style
        }}
        variant='square'
      />
    );
  }

  const iconDef = fas[convertToCamelCase(source)];

  return (
    <Box
      sx={{
        alignItems: 'center',
        border: '0.5px solid',
        borderRadius,
        display: 'flex',
        filter,
        height: size,
        justifyContent: 'center',
        overflow: 'hidden',
        width: size,
        ...style
      }}
    >
      {iconDef
        ? (
          <FontAwesomeIcon
            fontSize='15px'
            icon={iconDef}
            style={{
              height: size,
              width: size
            }}
          />
        )
        : (
          <Avatar
            sx={{
              bgcolor: 'transparent',
              fontSize: typeof size === 'number' ? size * 0.55 : undefined,
              height: size,
              width: size
            }}
            variant='square'
          >
            {getLogoFallbackText(source)}
          </Avatar>
        )}
    </Box>
  );
}

function Logo({
  assetSize,
  baseTokenSize,
  chainName,
  fallbackBackgroundColor,
  fallbackText,
  genesisHash,
  logo,
  logoRoundness = '50%',
  secondaryBackgroundColor,
  secondaryLogo,
  secondaryLogoPosition,
  secondaryLogoSize = '20px',
  showSquare = false,
  size = 25,
  style = {},
  subLogo,
  subLogoPosition,
  token,
  variant = 'single'
}: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const imgRef = useRef<HTMLImageElement>(null);
  const options = useContext(GenesisHashOptionsContext);
  const _genesisHash = mapHubToRelay(genesisHash);
  const maybeUserAddedChainColor = useUserAddedChainColor(_genesisHash);
  const [isDarkLogo, setIsDarkLogo] = useState(false);

  const foundChainName = useMemo(
    () => options.find(({ text, value }) => value === _genesisHash || (chainName && haveSameWords(text, chainName)))?.text,
    [_genesisHash, chainName, options]
  );
  const resolvedChainName = useMemo(() => sanitizeChainName(foundChainName || chainName, true), [chainName, foundChainName]);
  const resolvedLogoInfo = useMemo(() => resolveLogoInfo(resolvedChainName || _genesisHash, token), [_genesisHash, resolvedChainName, token]);
  const effectiveSize = assetSize ?? size;
  const effectiveSecondaryLogo = secondaryLogo ?? subLogo;
  const effectiveSecondaryLogoPosition = secondaryLogoPosition ?? subLogoPosition;
  const effectiveSecondaryLogoSize = baseTokenSize ?? secondaryLogoSize;
  const effectiveFallbackBackgroundColor = fallbackBackgroundColor ?? maybeUserAddedChainColor;
  const effectiveFallbackText = fallbackText ?? resolvedChainName;
  const effectiveLogo = logo || (showSquare ? resolvedLogoInfo?.logoSquare ?? resolvedLogoInfo?.logo : resolvedLogoInfo?.logo);
  const borderRadius = showSquare ? 0 : logoRoundness;
  const secondaryGraphicSize = typeof effectiveSecondaryLogoSize === 'number'
    ? effectiveSecondaryLogoSize - 2
    : `calc(${effectiveSecondaryLogoSize} - 2px)`;
  const shouldInvertForDarkTheme = useMemo(
    () => TOKENS_WITH_BLACK_LOGO.includes(token ?? '') || CHAINS_WITH_BLACK_LOGO.includes(resolvedChainName ?? ''),
    [resolvedChainName, token]
  );
  const filter = useMemo(() => {
    if (!isDark) {
      return '';
    }

    if (shouldInvertForDarkTheme) {
      return 'invert(1)';
    }

    return isDarkLogo ? 'invert(0.2) brightness(2)' : '';
  }, [isDark, isDarkLogo, shouldInvertForDarkTheme]);

  useEffect(() => {
    if (!effectiveLogo || !isImageSource(effectiveLogo)) {
      setIsDarkLogo(false);

      return;
    }

    const img = imgRef.current;

    if (!img) {
      return;
    }

    const handleLoad = () => {
      setIsDarkLogo(false);

      const canvas = document.createElement('canvas');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      ctx.drawImage(img, 0, 0);

      let data: Uint8ClampedArray;

      try {
        ({ data } = ctx.getImageData(0, 0, canvas.width, canvas.height));
      } catch (e) {
        console.log('Likely a tainted canvas due to cross-origin image:', e);

        return;
      }

      let totalBrightness = 0;

      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }

      if ((totalBrightness / (data.length / 4)) < 20) {
        setIsDarkLogo(true);
      }
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.onload = handleLoad;
    }
  }, [effectiveLogo]);

  if (effectiveLogo) {
    if ((variant === 'dual' || (effectiveSecondaryLogo && effectiveLogo)) && effectiveSecondaryLogo) {
      return (
        <Box sx={{ position: 'relative', width: 'fit-content', ...style }}>
          <RenderLogoGraphic
            borderRadius={borderRadius}
            filter={filter}
            imgRef={imgRef}
            size={effectiveSize}
            source={effectiveLogo}
          />
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: secondaryBackgroundColor ?? (theme.palette.mode === 'light' ? '#fff' : '#000'),
              borderRadius: '50%',
              display: 'flex',
              height: effectiveSecondaryLogoSize,
              inset: effectiveSecondaryLogoPosition ?? 'auto -5px -5px auto',
              justifyContent: 'center',
              p: '1px',
              position: 'absolute',
              width: effectiveSecondaryLogoSize
            }}
          >
            <RenderLogoGraphic
              borderRadius={logoRoundness}
              filter={filter}
              size={secondaryGraphicSize}
              source={effectiveSecondaryLogo}
            />
          </Box>
        </Box>
      );
    }

    return (
      <RenderLogoGraphic
        borderRadius={borderRadius}
        filter={filter}
        imgRef={imgRef}
        size={effectiveSize}
        source={effectiveLogo}
        style={style}
      />
    );
  }

  if (effectiveFallbackText) {
    return (
      <Avatar
        sx={{
          bgcolor: effectiveFallbackBackgroundColor,
          borderRadius,
          fontSize: typeof effectiveSize === 'number' ? effectiveSize * 0.7 : undefined,
          height: effectiveSize,
          width: effectiveSize,
          ...style
        }}
        variant='square'
      >
        {effectiveFallbackText.charAt(0).toUpperCase()}
      </Avatar>
    );
  }

  return (
    <Box
      component='img'
      src={logoWhiteTransparent as string}
      sx={{
        bgcolor: isDark ? '#292247' : '#CFD5F0',
        borderRadius: '999px',
        filter: isDark ? 'brightness(0.4)' : 'brightness(0.9)',
        height: effectiveSize,
        p: '4px',
        width: effectiveSize
      }}
    />
  );
}

export default React.memo(Logo);
