// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack } from '@mui/material';
import React from 'react';

import useIsDark from '../../hooks/useIsDark';

export function HideNumberShape1(): React.ReactElement {
  const isDark = useIsDark();
  const primaryBlockColor = isDark ? 'rgba(73, 26, 125, 0.34)' : 'rgba(151, 120, 180, 0.15)';
  const secondaryBlockColor = isDark ? 'rgba(0, 0, 0, 0.23)' : 'rgba(123, 113, 138, 0.20)';

  const renderRow = (count: number, offset = 0, rowId: number) => (
    <Stack direction='row' key={`row-${rowId}-${offset}`} sx={{ ml: offset ? '12px' : 0 }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={`cell-${rowId}-${offset}-${index}`}>
          <Box
            sx={{
              animation: 'fadeIn 0.4s forwards',
              animationDelay: `${(offset + index) * 0.05}s`,
              background: primaryBlockColor,
              filter: isDark ? 'brightness(115%) contrast(120%)' : 'none',
              height: '12px',
              width: '12px'
            }}
          />
          <Box
            sx={{
              animation: 'fadeIn 0.4s forwards',
              animationDelay: `${(offset + index) * 0.05 + 0.02}s`,
              background: secondaryBlockColor,
              filter: isDark ? 'brightness(150%) contrast(120%)' : 'none',
              height: '12px',
              width: '12px'
            }}
          />
        </React.Fragment>
      ))}
    </Stack>
  );

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(4px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <Stack direction='column'>
        {renderRow(10, 0, 0)}
        {renderRow(10, 12, 1)}
        {renderRow(10, 0, 2)}
      </Stack>
    </>
  );
}

export function HideNumberShape2({ style = {} }: { style: React.CSSProperties }): React.ReactElement {
  const isDark = useIsDark();
  const primaryBlockColor = '#c6aed759';
  const secondaryBlockColor = '#DED2E8';

  const renderDarkRow = (count: number, offset = 0, rowId: number) => (
    <Stack
      direction='row'
      key={`row-${rowId}-${offset}`}
      sx={{
        flexShrink: 1,
        minWidth: 0,
        ml: offset ? '12px' : 0,
        overflow: 'hidden'
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={`cell-${rowId}-${offset}-${index}`}>
          <Box
            sx={{
              animation: 'fadeInUp 0.4s forwards',
              animationDelay: `${(offset + index) * 0.05}s`,
              background: '#302553',
              flexShrink: 0,
              height: '12px',
              width: '12px'
            }}
          />
          <Box
            sx={{
              animation: 'fadeInUp 0.4s forwards',
              animationDelay: `${(offset + index) * 0.05 + 0.02}s`,
              background: '#05091C',
              flexShrink: 0,
              height: '12px',
              width: '12px'
            }}
          />
        </React.Fragment>
      ))}
    </Stack>
  );

  const getBlockColor = (rowId: number, index: number) => {
    if ((rowId + index) % 2 !== 0) {
      return 'transparent';
    }

    return index % 3 === 0 ? primaryBlockColor : secondaryBlockColor;
  };

  const renderLightRow = (count: number, rowId: number) => (
    <Stack
      direction='row'
      key={`row-${rowId}`}
      sx={{
        flexShrink: 1,
        minWidth: 0,
        overflow: 'hidden'
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={`cell-${rowId}-${index}`}
          sx={{
            animation: 'fadeInUp 0.4s forwards',
            animationDelay: `${(rowId + index) * 0.04}s`,
            background: getBlockColor(rowId, index),
            flexShrink: 0,
            height: '12px',
            width: '12px'
          }}
        />
      ))}
    </Stack>
  );

  return (
    <Grid container item sx={isDark ? { ...style } : { alignItems: 'center', justifyContent: 'flex-end', minWidth: 0, overflow: 'hidden', ...style }}>
      <>
        <style>
          {`
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(4px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
        <Stack direction='column' sx={isDark ? { flexShrink: 1, minWidth: 0, overflow: 'hidden', width: '67px' } : { alignItems: 'flex-end', flexShrink: 0, ml: 'auto', minWidth: 0, overflow: 'hidden', width: '67px' }}>
          {isDark
            ? (
              <>
                {renderDarkRow(3, 12, 0)}
                {renderDarkRow(3, 0, 1)}
              </>)
            : (
              <>
                {renderLightRow(6, 0)}
                {renderLightRow(6, 1)}
              </>)
          }
        </Stack>
      </>
    </Grid>
  );
}
