// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetsWithUiAndPrice } from './types';

import { Container, LinearProgress, linearProgressClasses, Stack, styled, Typography } from '@mui/material';
import React, { useContext, useRef } from 'react';

import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';

import { AssetLogo, CurrencyContext, FadeOnScroll, FormatPrice } from '../../../components';
import { useTranslation } from '../../../hooks';
import { normalizePercent, truncateToMaxYDecimals } from './helpers';

interface BarColorProps {
  barColor?: string;
  barHeight?: number;
}

const BorderLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'barColor' && prop !== 'barHeight'
})<BarColorProps>(({ barColor, barHeight = 12, theme }) => ({
  borderRadius: 5,
  height: barHeight,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#2D1E4A',
    ...theme.applyStyles('dark', {
      backgroundColor: '#2D1E4A'
    })
  },
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: barColor || '#1a90ff',
    borderRadius: 5,
    height: '100%',
    transition: 'transform 0.3s ease-in-out',
    ...theme.applyStyles('dark', {
      backgroundColor: barColor || '#308fe8'
    })
  }
}));

const WIDTHS = {
  1: 22,
  2: 24,
  3: 27,
  4: 27
};

function AssetsRows ({ assets }: { assets: AssetsWithUiAndPrice[] }): React.ReactElement {
  const { t } = useTranslation();
  const { currency } = useContext(CurrencyContext);
  const refContainer = useRef<HTMLDivElement>(null);

  return (
    <Container disableGutters>
      <Stack direction='row' justifyContent='space-between' sx={{ m: '8px 12px 5px' }}>
        <Typography color='#BEAAD8' textAlign='left' variant='B-1' width={`${WIDTHS[1]}%`}>
          {t('Token')}
        </Typography>
        <Typography color='#BEAAD8' textAlign='left' variant='B-1' width={`${WIDTHS[2]}%`}>
          {t('Cost')}
        </Typography>
        <Typography color='#BEAAD8' textAlign='left' variant='B-1' width={`${WIDTHS[3]}%`}>
          {t('Allocation')}
        </Typography>
        <Typography color='#BEAAD8' textAlign='right' variant='B-1' width={`${WIDTHS[4]}%`}>
          {t('Value')}
        </Typography>
      </Stack>
      <Container disableGutters ref={refContainer} sx={{ maxHeight: 'calc(100vh - 515px)', minHeight: '255px', overflowY: 'auto' }}>
        {assets.map(({ genesisHash, percent, price, token, totalBalance, ui }, index) => {
          const logoInfo = getLogo2(genesisHash, token);

          return (
            <Stack alignItems='center' direction='row' key={index} sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '47px', my: '4px', px: '10px' }}>
              <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start' width={`${WIDTHS[1]}%`}>
                <AssetLogo assetSize='18px' baseTokenSize='10px' genesisHash={genesisHash} logo={logoInfo?.logo} token={token} />
                <Typography variant='B-2'>
                  {token}
                </Typography>
              </Stack>
              <Typography color='#BEAAD8' textAlign='left' variant='B-2' width={`${WIDTHS[2]}%`}>
                {currency?.sign} {price ? truncateToMaxYDecimals(price, 4) : 0}
              </Typography>
              <Stack alignItems='center' direction='row' justifyContent='start' width={`${WIDTHS[3]}%`}>
                <Typography color='#BEAAD8' minWidth='60px' sx={{ textAlign: 'left', textWrap: 'nowrap' }} variant='B-2'>
                  {percent >= 0.01 ? truncateToMaxYDecimals(percent, 2) : '~ 0'}%
                </Typography>
                <BorderLinearProgress barColor={ui.color} barHeight={8} sx={{ width: '72px' }} value={normalizePercent(percent)} variant='determinate' />
              </Stack>
              <FormatPrice
                commify
                decimalColor='#BEAAD8'
                fontFamily='Inter'
                fontSize='14px'
                fontWeight={600}
                num={totalBalance}
                onHideShape='shape2'
                style={{ display: 'flex', justifyContent: 'end', width: `${WIDTHS[4]}%` }}
                textAlign='right'
              />
            </Stack>
          );
        })
        }
        <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} style={{ borderRadius: '14px', justifySelf: 'center', width: '100%' }} />
      </Container>
    </Container>
  );
}

export default React.memo(AssetsRows);
