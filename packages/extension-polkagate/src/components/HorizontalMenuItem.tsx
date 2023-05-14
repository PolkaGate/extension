// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { } from 'react';

interface Props {
  title: string;
  icon: any;
  divider?: boolean;
  onClick: () => void;
  exceptionWidth?: number;
  textDisabled?: boolean;
  isLoading?: boolean;
  labelMarginTop?: string;
  titleFontSize?: number;
  titleLineHeight?: number;
  dividerHeight?: number;
  textSelected?: boolean;
}

export default function HorizontalMenuItem({ divider = false, dividerHeight = 30, exceptionWidth = 0, icon, isLoading = false, labelMarginTop = '0px', onClick, textDisabled, textSelected, title, titleFontSize = 12, titleLineHeight = 1.5 }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <>
      {isLoading
        ? <Grid alignItems='center' container direction='column' item justifyContent='center' maxWidth='fit-content'>
          <Skeleton sx={{ borderRadius: '50%', display: 'inline-block', height: '30px', transform: 'none', width: '30px' }} />
          <Skeleton sx={{ display: 'inline-block', height: '12px', mt: '7px', transform: 'none', width: '30px' }} />
        </Grid>
        : <Grid container direction='column' item justifyContent='center' maxWidth={exceptionWidth !== 0 ? `${exceptionWidth}px` : 'fit-content'} onClick={!textDisabled && onClick} sx={{ cursor: 'pointer' }}>
          <Grid container item justifyContent='center'>
            <IconButton sx={{ alignSelf: 'center', m: 'auto', p: 0, transform: 'scale(0.9)', width: 'fit-content', opacity: textDisabled && 0.5 }}>
              {icon}
            </IconButton>
          </Grid>
          <Grid item textAlign='center'>
            <Typography fontSize={`${titleFontSize}px`} fontWeight={theme.palette.mode === 'dark' ? 300 : 400} lineHeight={titleLineHeight} sx={{ color: textDisabled ? 'action.disabledBackground' : textSelected && 'secondary.light', pt: '3px', mt: labelMarginTop }}>
              {title}
            </Typography>
          </Grid>
        </Grid>
      }
      {divider &&
        <Grid alignItems='center' item justifyContent='center'>
          <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: `${dividerHeight}px`, m: '7px 2px 0', width: '2px' }} />
        </Grid>
      }
    </>
  );
}
