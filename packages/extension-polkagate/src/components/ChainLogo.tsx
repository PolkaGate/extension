// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Box } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { logoWhiteTransparent } from '../assets/logos';
import { useUserAddedChainColor } from '../fullscreen/addNewChain/utils';
import { convertToCamelCase } from '../fullscreen/governance/utils/util';
import { useIsDark } from '../hooks';
import getLogo2 from '../util/getLogo2';
import { sanitizeChainName } from '../util/utils';
import { GenesisHashOptionsContext } from './contexts';

interface Props {
  chainName?: string;
  genesisHash?: string | undefined | null;
  logo?: string;
  size?: number;
  logoRoundness?: string;
  style?: React.CSSProperties;
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

function ChainLogo ({ chainName, genesisHash, logo, logoRoundness = '50%', size = 25, style = {} }: Props): React.ReactElement<Props> {
  const isDark = useIsDark();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDarkLogo, setIsDarkLogo] = useState(false);

  const maybeUserAddedChainColor = useUserAddedChainColor(genesisHash);
  const options = useContext(GenesisHashOptionsContext);

  const foundChainName = options.find(({ text, value }) => value === genesisHash || (chainName && haveSameWords(text, chainName)))?.text;

  const _chainName = sanitizeChainName(foundChainName || chainName);
  const _logo = logo || getLogo2(_chainName)?.logo;

  const filter = isDarkLogo && isDark ? 'invert(0.2) brightness(2)' : '';

  useEffect(() => {
    const img = imgRef.current;

    if (!img) {
      return;
    }

    const handleLoad = () => {
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

  return (
    <>
      {_logo
        ? <>
          {_logo.startsWith('data:')
            ? <Avatar
              imgProps={{ ref: imgRef }}
              src={_logo}
              sx={{
                borderRadius: logoRoundness,
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
                borderRadius: logoRoundness,
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
              borderRadius: logoRoundness,
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
