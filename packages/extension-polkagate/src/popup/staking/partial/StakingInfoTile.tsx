// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import { Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown, type Icon } from 'iconsax-react';
import React, { useMemo, useRef } from 'react';

import { type BN, noop } from '@polkadot/util';

import { CryptoFiatBalance, MyTooltip } from '../../../components';
import { useIsHovered } from '../../../hooks';

interface TileActionButtonProps {
  text: string;
  Icon: Icon;
  onClick: () => void;
  noText?: boolean;
  isRow?: boolean;
  isDisabled?: boolean;
  style?: SxProps<Theme>;
}

export function TileActionButton ({ Icon, isDisabled = false, isRow = false, noText = false, onClick, style, text }: TileActionButtonProps): React.ReactElement {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const hovered = useIsHovered(containerRef);

  return (
    <>
      <MyTooltip color='#1c498a' content={text} notShow={!noText} placement='top'>
        <Grid alignItems='center' container item justifyContent='center' onClick={isDisabled ? noop : onClick} ref={containerRef}
          sx={{
            ':hover': isDisabled ? {} : { bgcolor: theme.palette.text.highlight, borderColor: 'transparent' },
            bgcolor: '#110F2A',
            border: isRow ? 'none' : '2px solid #060518',
            borderRadius: '11px',
            columnGap: '4px',
            cursor: isDisabled ? 'default' : 'pointer',
            flexWrap: 'nowrap',
            p: '4px 7px',
            transition: 'all 150ms ease-out',
            ...style
          }}
          xs
        >
          <Icon color={isDisabled ? '#809acb8c' : hovered ? '#ffffff' : theme.palette.text.highlight} size='19' variant='Bulk' />
          {!noText &&
            <Typography color={isDisabled ? '#809acb8c' : hovered ? '#ffffff' : 'text.highlight'} sx={{ transition: 'all 150ms ease-out', width: 'max-content' }} variant='B-4'>
              {text}
            </Typography>}
        </Grid>
      </MyTooltip>
    </>
  );
}

export interface Props {
  title: string;
  Icon: Icon;
  layoutDirection?: 'row' | 'column';
  cryptoAmount: BN | undefined;
  fiatAmount: number;
  decimal: number;
  token: string;
  buttonsArray?: TileActionButtonProps[];
  onExpand?: () => void;
}

export default function StakingInfoTile ({ Icon, buttonsArray = [], cryptoAmount, decimal, fiatAmount, layoutDirection = 'column', onExpand, title, token }: Props): React.ReactElement {
  const theme = useTheme();

  const isDisabled = useMemo(() => Boolean(cryptoAmount?.isZero()), [cryptoAmount]);

  const isDisabledColor = isDisabled ? '#809acb8c' : theme.palette.text.highlight;

  return (
    <Grid alignItems={layoutDirection === 'row' ? 'flex-start' : 'center'} container item
      sx={{ bgcolor: '#2D1E4A4D', borderRadius: '14px', minWidth: 'calc((100% - 8px) / 3)', overflow: 'hidden', p: '4px', position: 'relative', width: layoutDirection === 'row' ? 'fit-content' : '100%' }}
    >
      <Container disableGutters
        sx={{
          alignItems: layoutDirection === 'row' ? 'flex-start' : 'center',
          display: 'flex',
          flexDirection: layoutDirection === 'row' ? 'column' : 'row',
          gap: '10px',
          justifyContent: layoutDirection === 'row' ? 'space-between' : 'flex-start',
          p: '8px',
          width: '100%'
        }}
      >
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ width: layoutDirection === 'row' ? '100%' : 'fit-content' }}>
          <Icon color={isDisabledColor} size='20' variant='Bulk' />
          {layoutDirection === 'row' && onExpand &&
            <ArrowCircleDown color={isDisabledColor} onClick={onExpand} size='22' style={{ cursor: 'pointer', marginRight: '-4px', marginTop: '-4px' }} variant='Bulk' />}
        </Grid>
        <Grid alignItems='center' container item sx={{ flexWrap: 'nowrap' }} xs>
          <Typography color={isDisabledColor} sx={{ textWrap: 'nowrap' }} variant='B-1'>
            {title}
          </Typography>
          {layoutDirection === 'column' && onExpand &&
            <ArrowCircleDown color={isDisabledColor} onClick={onExpand} size='20' style={{ cursor: 'pointer', marginLeft: '4px' }} variant='Bulk' />}
        </Grid>
        <CryptoFiatBalance
          cryptoBalance={cryptoAmount}
          cryptoProps={{ style: { color: isDisabledColor } }}
          decimal={decimal}
          fiatBalance={fiatAmount}
          fiatProps={{ decimalColor: isDisabledColor, textColor: isDisabled ? '#809acb8c' : theme.palette.text.primary }}
          skeletonAlignment='flex-start'
          skeletonColor='none'
          style={{
            alignItems: layoutDirection === 'row' ? 'start' : 'end',
            rowGap: '3px',
            textAlign: layoutDirection === 'row' ? 'left' : 'right',
            width: '100%'
          }}
          token={token}
        />
      </Container>
      {buttonsArray.length > 0 &&
        <Container disableGutters
          sx={{
            alignItems: 'center',
            bgcolor: layoutDirection === 'row' ? '#060518' : 'none',
            borderRadius: '12px',
            display: 'flex',
            gap: layoutDirection === 'row' ? '2px' : '4px',
            minWidth: '104px',
            ml: layoutDirection === 'row' ? 'auto' : '8px',
            mt: '8px',
            p: '2px',
            width: 'fit-content'
          }}
        >
          {buttonsArray.map((button, index) => (
            <TileActionButton
              Icon={button.Icon}
              isDisabled={isDisabled}
              isRow={layoutDirection === 'row'}
              key={index}
              noText={buttonsArray.length > 1 && layoutDirection === 'row'}
              onClick={button.onClick}
              text={button.text}
            />
          ))}
        </Container>}
      {isDisabled &&
        <Grid container item sx={{ bgcolor: '#0802144D', height: '100%', inset: 0, position: 'absolute', width: '100%', zIndex: 10 }} />
      }
    </Grid>
  );
}
