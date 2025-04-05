// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Stack, Typography, useTheme } from '@mui/material';
import React, { type CSSProperties } from 'react';

export type DotsStyle = 'big' | 'small' | 'normal';

interface Props {
  color?: string;
  decimalColor?: string;
  preText?: string;
  postText?: string;
  postTextStyle?: CSSProperties;
  preTextFontSize?: string | undefined;
  preTextFontWeight?: number | undefined;
  style?: DotsStyle
}

const Dots = ({ color, decimalColor, postText, postTextStyle, preText, preTextFontSize, preTextFontWeight, style }: Props) => {
  const theme = useTheme();

  const [height1, size1, weight1] = style === 'big'
    ? [35, 40, 900]
    : style === 'small'
      ? [12, 12, 500]
      : [12, 14, 600];
  const [height2, size2, weight2] = style === 'big' ? [30, 25, 400] : [12, 20, 400];

  const DigitsInDot = ({ isDecimal, side }: { side: 'left' | 'right', isDecimal?: boolean }) => (
    <Typography sx={{ color: isDecimal ? decimalColor : undefined, fontFamily: 'Inter', fontSize: `${size1}px`, fontWeight: weight1, lineHeight: `${height1}px`, paddingLeft: style === 'big' ? '5px' : 0 }}>
      {style === 'big'
        ? '• •'
        : style === 'small'
          ? '••'
          : side === 'left'
            ? <span>•<span style={{ color: decimalColor }}>,</span>•••</span>
            : '••'
      }
    </Typography>
  );

  const fontFamily = style === 'big' ? 'OdibeeSans' : 'Inter';

  return (
    <Stack alignItems='baseline' direction='row' sx={{ color }}>
      <Typography sx={{ fontFamily, fontSize: preTextFontSize, fontWeight: preTextFontWeight, lineHeight: `${height1}px` }}>
        {preText}
      </Typography>
      <DigitsInDot side='left' />
      <Typography px='3px' sx={{ color: color || theme.palette.text.secondary, fontFamily, fontSize: `${size2}px`, fontWeight: weight2, lineHeight: `${height2}px`, px: style === 'big' ? '5px' : 0 }}>
        .
      </Typography>
      <DigitsInDot isDecimal={style !== 'big'} side='right' />
      {postText &&
        <Typography sx={{ ...postTextStyle }}>
          &nbsp;{postText}
        </Typography>
      }
    </Stack>
  );
};

export default React.memo(Dots);
