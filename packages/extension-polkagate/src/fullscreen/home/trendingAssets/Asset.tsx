// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PriceValue } from '@polkadot/extension-polkagate/src/util/types';

import { Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import DailyChange from '@polkadot/extension-polkagate/src/popup/home/partial/DailyChange';
import resolveLogoInfo from '@polkadot/extension-polkagate/src/util/logo/resolveLogoInfo';

import { CurrencyContext, Logo } from '../../../components';

const Asset = React.forwardRef<HTMLDivElement, { asset: PriceValue, onClick: React.Dispatch<React.SetStateAction<string | undefined>> }>(({ asset, onClick }, ref) => {
  const { currency } = useContext(CurrencyContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [hoveredIndex, setHoveredIndex] = useState<boolean>(false);

  const _onClick = useCallback(() => {
    onClick(asset.symbol);
  }, [asset.symbol, onClick]);

  const onMouseEnter = useCallback(() => {
    setHoveredIndex(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredIndex(false);
  }, []);

  const logoInfo = resolveLogoInfo(asset.genesisHash, asset.symbol);

  return (
    <Stack
      direction='column'
      onClick={_onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={ref}
      sx={{
        bgcolor: hoveredIndex ? (isDark ? '#2D1E4A' : '#F3F6FD') : (isDark ? '#05091C' : '#FFFFFF'),
        border: isDark ? 'none' : '1px solid #DDE3F4',
        borderRadius: '14px',
        cursor: 'pointer',
        minWidth: '122px',
        mr: '5px',
        p: '15px',
        transform: hoveredIndex ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.2s ease-in-out',
        width: 'fit-content'
      }}
    >
      <Logo assetSize='36px' baseTokenSize='14px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} style={{ width: 'fit-content' }} token={asset?.symbol} />
      <Typography color='text.primary' sx={{ mt: '10px', textAlign: 'left', textWrap: 'nowrap' }} variant='B-2'>
        {asset.symbol} / {currency?.code}
      </Typography>
      <Stack direction='row'>
        <Typography color='text.primary' sx={{ textAlign: 'left' }} variant='B-2'>
          {currency?.sign}{asset.value.toFixed(2)}
        </Typography>
        <DailyChange
          change={asset.change}
          iconSize={12}
          showHours={false}
          showPercentage
          style={{ marginLeft: '5px', minWidth: '57px', padding: '0px 2px' }}
          textVariant='B-4'
        />
      </Stack>
    </Stack>

  );
});

Asset.displayName = 'Asset';

export default React.memo(Asset);
