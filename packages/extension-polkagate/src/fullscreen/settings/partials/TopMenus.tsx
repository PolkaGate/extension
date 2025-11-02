// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import { Check, Electricity, MouseCircle, Setting3 } from 'iconsax-react';
import React, { useMemo, useRef, useState } from 'react';

import { GradientDivider } from '@polkadot/extension-polkagate/src/style/index';

import { useTranslation } from '../../../hooks';
import TopMenuItem from './TopMenuItem';

function TopMenus (): React.ReactElement {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<DOMRect | null>(null);

  const selectionLineStyle = useMemo(() => ({
    background: 'linear-gradient(263.83deg, rgba(255, 79, 185, 0) 9.75%, #FF4FB9 52.71%, rgba(255, 79, 185, 0) 95.13%)',
    border: 'none',
    height: '2px',
    position: 'relative',
    top: '5px',
    transform: `translateX(${position && ref.current ? position.left - ref.current.getBoundingClientRect().left : 7}px)`,
    transition: 'transform 0.3s ease-in-out',
    width: `${position?.width ? position?.width + 24 : 0}px`
  }), [position]);

  return (
    <Stack direction='column' rowGap='2px' sx={{ width: '100%' }}>
      <Stack columnGap='20px' direction='row' ml='5px' mt='12px' ref={ref}>
        <TopMenuItem
          Icon={MouseCircle}
          label={t('Extension Settings')}
          path=''
          setPosition={setPosition}
        />
        <TopMenuItem
          Icon={Setting3}
          label={t('Account Settings')}
          path='account'
          setPosition={setPosition}
        />
        <TopMenuItem
          Icon={Electricity}
          label={t('Network Settings')}
          path='network'
          setPosition={setPosition}
        />
        <TopMenuItem
          Icon={Check}
          label={t('About PolkaGate')}
          path='about'
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
