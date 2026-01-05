// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import { Check, I3Dcube, Trade } from 'iconsax-react';
import React, { useMemo, useRef, useState } from 'react';

import { GradientDivider } from '@polkadot/extension-polkagate/src/style/index';

import { useTranslation } from '../../../hooks';
import TopMenuItem from './components/TopMenuItem';

function TopMenus (): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<DOMRect | null>(null);

  const selectionLineStyle = useMemo(() => ({
    background: 'linear-gradient(263.83deg, rgba(255, 79, 185, 0) 9.75%, #FF4FB9 52.71%, rgba(255, 79, 185, 0) 95.13%)',
    border: 'none',
    height: '2px',
    position: 'relative',
    top: '2px',
    transform: `translateX(${position && ref.current ? position.left - ref.current.getBoundingClientRect().left : 7}px)`,
    transition: 'transform 0.3s ease-in-out',
    width: `${position?.width ? position?.width + 24 : 0}px`
  }), [position]);

  return (
    <Stack direction='column' rowGap='2px'>
      <Stack columnGap='20px' direction='row' ml='5px' mt='12px' ref={ref}>
        <TopMenuItem
          Icon={Trade}
          label={t('Main')}
          path=''
          setPosition={setPosition}
        />
        <TopMenuItem
          Icon={I3Dcube}
          label={t('Networks')}
          path='chains'
          setPosition={setPosition}
        />
        <TopMenuItem
          Icon={Check}
          label={t('Password')}
          path='password'
          setPosition={setPosition}
        />
      </Stack>
      {
        position &&
        <GradientDivider style={selectionLineStyle} />
      }
    </Stack>
  );
}

export default React.memo(TopMenus);
