// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import { Container, Grid, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown, type Icon } from 'iconsax-react';
import React, { useMemo, useRef } from 'react';

import { type BN, noop } from '@polkadot/util';

import { CryptoFiatBalance, FormatBalance2, FormatPrice, MyTooltip } from '../../../components';
import { useIsHideNumbers, useIsHovered } from '../../../hooks';

interface TileActionButtonProps {
  text: string;
  Icon: Icon;
  iconVariant?: 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone';
  onClick: () => void;
  noText?: boolean;
  isRow?: boolean;
  isDisabled?: boolean;
  style?: SxProps<Theme>;
  isFullScreen?: boolean;
}

export function TileActionButton ({ Icon, iconVariant = 'Bulk', isDisabled = false, isFullScreen, isRow = false, noText = false, onClick, style, text }: TileActionButtonProps): React.ReactElement {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const hovered = useIsHovered(containerRef);

  const color = useMemo(() =>
    isDisabled
      ? isFullScreen ? '#AA83DC' : '#809acb8c'
      : hovered
        ? '#ffffff'
        : isFullScreen
          ? '#AA83DC'
          : theme.palette.text.highlight
  , [hovered, isDisabled, isFullScreen, theme.palette.text.highlight]);

  return (
    <>
      <MyTooltip color='#1c498a' content={text} notShow={!noText} placement='top'>
        <Grid alignItems='center' container item justifyContent='center' onClick={isDisabled ? noop : onClick} ref={containerRef}
          sx={{
            ':hover': isDisabled ? {} : { bgcolor: isFullScreen ? '#674394' : theme.palette.text.highlight, borderColor: 'transparent' },
            bgcolor: isFullScreen ? isDisabled ? '#1B133C' : '#2D1E4A' : '#110F2A',
            border: isRow ? 'none' : '2px solid #060518',
            borderRadius: '11px',
            columnGap: '4px',
            cursor: isDisabled ? 'default' : 'pointer',
            flexWrap: 'nowrap',
            opacity: isFullScreen && isDisabled ? '30%' : 1,
            p: isFullScreen ? '8.5px 6px' : '4px 7px',
            transition: 'all 150ms ease-out',
            ...style
          }}
          xs
        >
          <Icon color={color} size='19' variant={iconVariant} />
          {!noText &&
            <Typography color={color} sx={{ transition: 'all 150ms ease-out', width: 'max-content' }} variant='B-4'>
              {text}
            </Typography>}
        </Grid>
      </MyTooltip>
    </>
  );
}

interface StakingFiatCryptoFSProps {
  staked: BN | undefined;
  stakedInCurrency: number | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

const StakingFiatCryptoFS = ({ decimal, staked, stakedInCurrency, token }: StakingFiatCryptoFSProps) => {
  const theme = useTheme();
  const { isHideNumbers } = useIsHideNumbers();

  const adaptiveDecimalPoint = useMemo(() => staked && decimal && (String(staked).length >= decimal - 1 ? 2 : 4), [decimal, staked]);

  const isDisabled = useMemo(() => Boolean(staked?.isZero()), [staked]);

  return (
    <Grid container item>
      <Grid container item>
        {staked === undefined
          ? (
            <Skeleton
              animation='wave'
              height='24px'
              sx={{ borderRadius: '50px', fontWeight: 'bold', maxWidth: '105px', my: '4px', transform: 'none', width: '100%' }}
              variant='text'
            />)
          : (
            <FormatPrice
              commify
              decimalColor={isDisabled ? '#674394' : '#fff'}
              dotStyle='normal'
              fontFamily='OdibeeSans'
              fontSize={isHideNumbers ? '16px' : '30px'}
              fontWeight={400}
              height={30}
              num={stakedInCurrency}
              textColor={isDisabled ? '#674394' : undefined}
              width='fit-content'
            />)
        }
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-start'>
        {staked === undefined
          ? (
            <Skeleton
              animation='wave'
              height='16px'
              sx={{ borderRadius: '10px', fontWeight: 'bold', m: '6px 0 1px', maxWidth: '60px', transform: 'none', width: '100%' }}
              variant='text'
            />)
          : (
            <FormatBalance2
              decimalPoint={adaptiveDecimalPoint}
              decimals={[decimal ?? 0]}
              style={{
                color: isDisabled ? '#674394' : theme.palette.text.secondary,
                fontFamily: 'Inter',
                fontSize: '12px',
                fontWeight: 500,
                marginTop: '6px',
                width: 'max-content'
              }}
              tokens={[token ?? '']}
              value={staked}
            />)}
      </Grid>
    </Grid>
  );
};

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
  style?: SxProps<Theme>;
  isFullScreen?: boolean;
}

export default function StakingInfoTile ({ Icon, buttonsArray = [], cryptoAmount, decimal, fiatAmount, isFullScreen, layoutDirection = 'column', onExpand, style, title, token }: Props): React.ReactElement {
  const theme = useTheme();

  const isDisabled = useMemo(() => Boolean(cryptoAmount?.isZero()), [cryptoAmount]);
  const isRow = useMemo(() => layoutDirection === 'row', [layoutDirection]);
  const disabledColor = isFullScreen ? '#674394' : '#809acb8c';
  const adjustedColor = isDisabled ? disabledColor : isFullScreen ? '#AA83DC' : theme.palette.text.highlight;

  return (
    <Grid alignItems={isRow ? 'flex-start' : 'center'} container item
      sx={{
        bgcolor: isFullScreen ? '#05091C' : '#2D1E4A4D',
        borderRadius: '14px',
        minWidth: 'calc((100% - 8px) / 3)',
        overflow: 'hidden',
        p: '4px',
        position: 'relative',
        width: isRow ? 'fit-content' : '100%',
        ...style
      }}
    >
      <Container disableGutters
        sx={{
          alignItems: isRow ? 'flex-start' : 'center',
          display: 'flex',
          flexDirection: isRow ? 'column' : 'row',
          gap: isFullScreen ? '5px' : '10px',
          justifyContent: isRow ? 'space-between' : 'flex-start',
          p: isFullScreen ? '14px' : '8px',
          width: '100%'
        }}
      >
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ width: isRow ? '100%' : 'fit-content' }}>
          <Icon color={adjustedColor} size='20' style={isFullScreen ? { backgroundColor: '#2D1E4A', borderRadius: '999px', height: '36px', padding: '8px', width: '36px' } : {}} variant='Bulk' />
          {isRow && onExpand &&
            <ArrowCircleDown color={adjustedColor} onClick={onExpand} size='22' style={{ cursor: 'pointer', marginRight: isFullScreen ? '-14px' : '-4px', marginTop: isFullScreen ? '-42px' : '-4px' }} variant='Bulk' />}
        </Grid>
        <Grid alignItems='center' container item sx={{ flexWrap: 'nowrap' }} xs>
          <Typography color={adjustedColor} sx={{ textWrap: 'nowrap' }} variant='B-1'>
            {title}
          </Typography>
          {layoutDirection === 'column' && onExpand &&
            <ArrowCircleDown color={adjustedColor} onClick={onExpand} size='20' style={{ cursor: 'pointer', marginLeft: '4px' }} variant='Bulk' />}
        </Grid>
        {isFullScreen
          ? (
            <StakingFiatCryptoFS
              decimal={decimal}
              staked={cryptoAmount}
              stakedInCurrency={fiatAmount}
              token={token}
            />)
          : (
            <CryptoFiatBalance
              cryptoBalance={cryptoAmount}
              cryptoProps={{ style: { color: adjustedColor } }}
              decimal={decimal}
              fiatBalance={fiatAmount}
              fiatProps={{ decimalColor: adjustedColor, textColor: isDisabled ? '#809acb8c' : theme.palette.text.primary }}
              skeletonAlignment='flex-start'
              skeletonColor='none'
              style={{
                alignItems: isRow ? 'start' : 'end',
                rowGap: '3px',
                textAlign: isRow ? 'left' : 'right',
                width: '100%'
              }}
              token={token}
            />)}
      </Container>
      {buttonsArray.length > 0 &&
        <Container disableGutters
          sx={{
            alignItems: 'center',
            bgcolor: isRow ? '#060518' : 'none',
            borderRadius: '12px',
            display: 'flex',
            gap: isRow ? '2px' : '4px',
            minWidth: '104px',
            ml: isRow ? 'auto' : '8px',
            mt: '8px',
            p: '2px',
            width: isFullScreen ? '100%' : 'fit-content'
          }}
        >
          {buttonsArray.map((button, index) => (
            <TileActionButton
              Icon={button.Icon}
              iconVariant={button.iconVariant}
              isDisabled={isDisabled}
              isFullScreen={isFullScreen}
              isRow={isRow}
              key={index}
              noText={buttonsArray.length > 1 && isRow}
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
