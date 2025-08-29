// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack } from '@mui/material';
import React from 'react';

export function HideNumberShape1 (): React.ReactElement {
  const renderRow = (count: number, offset = 0) => (
    <Stack direction='row' key={offset} sx={{ ml: offset ? '12px' : 0 }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <Box
            sx={{
              animation: 'fadeIn 0.4s forwards',
              animationDelay: `${(offset + index) * 0.05}s`,
              background: 'rgba(73, 26, 125, 0.34)',
              filter: 'brightness(115%) contrast(120%)',
              height: '12px',
              width: '12px'
            }}
          />
          <Box
            sx={{
              animation: 'fadeIn 0.4s forwards',
              animationDelay: `${(offset + index) * 0.05 + 0.02}s`,
              background: 'rgba(0, 0, 0, 0.23)',
              filter: 'brightness(150%) contrast(120%)',
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
        {renderRow(10)}
        {renderRow(10, 12)}
        {renderRow(10)}
      </Stack>
    </>
  );
}

export function HideNumberShape2 ({ style = {} }: { style: React.CSSProperties }): React.ReactElement {
  const renderRow = (count: number, offset = 0) => (
    <Stack
      direction='row'
      key={offset}
      sx={{
        flexShrink: 1,
        minWidth: 0,
        ml: offset ? '12px' : 0,
        overflow: 'hidden'
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
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

  return (
    <Grid container item sx={{ ...style }}>
      <>
        <style>
          {`
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(4px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
        <Stack direction='column' sx={{ flexShrink: 1, minWidth: 0, overflow: 'hidden', width: '67px' }}>
          {renderRow(3, 12)}
          {renderRow(3)}
        </Stack>
      </>
    </Grid>
  );
}
