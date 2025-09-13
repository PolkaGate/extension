// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Box } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { logoWhiteTransparent } from '../assets/logos';
import { useUserAddedChainColor } from '../fullscreen/addNewChain/utils';
import { useIsDark } from '../hooks';
import { convertToCamelCase } from '../util';
import { CHAINS_WITH_BLACK_LOGO, TOKENS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo2 from '../util/getLogo2';
import { mapHubToRelay } from '../util/migrateHubUtils';
import { sanitizeChainName } from '../util/utils';
import { GenesisHashOptionsContext } from './contexts';

interface Props {
  chainName?: string;
  genesisHash?: string | undefined | null;
  logo?: string;
  logoRoundness?: string;
  showSquare?: boolean;
  size?: number;
  style?: React.CSSProperties;
  token?: string;
}

function normalizeToWordSet (str: string): Set<string> {
  // Split PascalCase or space-separated
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
    .split(/[\s_]+/) // split by space or underscore
    .map((word) => word.toLowerCase())
    .filter(Boolean);

  return new Set(words);
}

function haveSameWords (str1: string, str2: string): boolean {
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

function ChainLogo ({ chainName, genesisHash, logo, logoRoundness = '50%', showSquare = false, size = 25, style = {}, token }: Props): React.ReactElement<Props> {
  const isDark = useIsDark();
  const imgRef = useRef<HTMLImageElement>(null);
  const _genesisHash = mapHubToRelay(genesisHash);
  const [isDarkLogo, setIsDarkLogo] = useState(false);

  const maybeUserAddedChainColor = useUserAddedChainColor(_genesisHash);
  const options = useContext(GenesisHashOptionsContext);

  const foundChainName = options.find(({ text, value }) => value === _genesisHash || (chainName && haveSameWords(text, chainName)))?.text;

  const _chainName = sanitizeChainName(foundChainName || chainName, true);

  const chainLogoInfo = getLogo2(_chainName);
  const _logo = logo || (showSquare ? chainLogoInfo?.logoSquare : chainLogoInfo?.logo);

  const filter = isDark
    ? TOKENS_WITH_BLACK_LOGO.includes(token ?? '') || CHAINS_WITH_BLACK_LOGO.includes(_chainName ?? '')
      ? 'invert(1)'
      : isDarkLogo
        ? 'invert(0.2) brightness(2)'
        : ''
    : '';

  useEffect(() => {
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

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let totalBrightness = 0;

      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        const brightness = (r + g + b) / 3;

        totalBrightness += brightness;
      }

      const avgBrightness = totalBrightness / (data.length / 4);

      if (avgBrightness < 20) {
        setIsDarkLogo(true);
      }
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.onload = handleLoad;
    }
  }, [_logo]);

  const borderRadius = showSquare ? 0 : logoRoundness;

  return (
    <>
      {_logo
        ? <>
          {_logo.startsWith('data:')
            ? <Avatar
              imgProps={{ ref: imgRef }}
              src={_logo}
              sx={{
                borderRadius,
                filter,
                height: size,
                width: size,
                ...style
              }}
              variant='square'
              />
            : <FontAwesomeIcon
              fontSize='15px'
              icon={fas[convertToCamelCase(_logo)]}
              style={{
                border: '0.5px solid',
                borderRadius,
                filter,
                height: size,
                width: size,
                ...style
              }}
              />
          }
        </>
        : _chainName
          ? <Avatar
            imgProps={{ ref: imgRef }}
            sx={{
              bgcolor: maybeUserAddedChainColor,
              borderRadius,
              fontSize: size * 0.7,
              height: size,
              width: size,
              ...style
            }}
            variant='square'
            >
            {_chainName?.charAt(0)?.toUpperCase() || ''}
          </Avatar>
          : <Box
            component='img'
            src={logoWhiteTransparent as string}
            sx={{
              bgcolor: isDark ? '#292247' : '#CFD5F0',
              borderRadius: '999px',
              filter: isDark ? 'brightness(0.4)' : 'brightness(0.9)',
              height: size,
              p: '4px',
              width: size
            }}
            />
      }
    </>
  );
}

export default React.memo(ChainLogo);
