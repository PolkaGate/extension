// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Container, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown, type Icon } from 'iconsax-react';
import React, { useRef } from 'react';

import { MyTooltip } from '../../../components';
import { useIsHovered } from '../../../hooks';
import { ColumnAmounts } from '../../tokens/partial/ColumnAmounts';

interface TileActionButtonProps {
  text: string;
  Icon: Icon;
  onClick: () => void;
  noText?: boolean;
  isRow?: boolean;
}

function TileActionButton ({ Icon, isRow = false, noText = false, onClick, text }: TileActionButtonProps): React.ReactElement {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const hovered = useIsHovered(containerRef);

  return (
    <>
      <MyTooltip
        content={text}
        notShow={!noText}
        placement='top'
      >
        <Grid
          alignItems='center'
          container
          item
          justifyContent='center'
          onClick={onClick}
          ref={containerRef}
          sx={{
            ':hover': { bgcolor: theme.palette.text.highlight, borderColor: 'transparent' },
            bgcolor: '#110F2A',
            border: isRow ? 'none' : '2px solid #060518',
            borderRadius: '11px',
            columnGap: '4px',
            cursor: 'pointer',
            flexWrap: 'nowrap',
            p: '4px 7px',
            transition: 'all 150ms ease-out'
          }}
          xs
        >
          <Icon color={hovered ? '#ffffff' : theme.palette.text.highlight} size='19' variant='Bulk' />
          {!noText &&
          <Typography color={hovered ? '#ffffff' : 'text.highlight'} sx={{ transition: 'all 150ms ease-out', width: 'max-content' }} variant='B-4'>
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

  if (cryptoAmount?.isZero()) {
    return <></>;
  }

  return (
    <Grid
      alignItems='center'
      container item
      sx={{ bgcolor: '#2D1E4A4D', borderRadius: '14px', minWidth: 'calc((100% - 8px) / 3)', p: '4px', width: layoutDirection === 'row' ? 'fit-content' : '100%' }}
    >
      <Container
        disableGutters
        sx={{
          alignItems: layoutDirection === 'row' ? 'flex-start' : 'center',
          display: 'flex',
          flexDirection: layoutDirection === 'row' ? 'column' : 'row',
          gap: '6px',
          justifyContent: layoutDirection === 'row' ? 'space-between' : 'flex-start',
          p: '8px',
          width: '100%'
        }}
      >
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ width: layoutDirection === 'row' ? '100%' : 'fit-content' }}>
          <Icon color={theme.palette.text.highlight} size='20' variant='Bulk' />
          {layoutDirection === 'row' && onExpand &&
            <ArrowCircleDown color={theme.palette.text.highlight} onClick={onExpand} size='22' style={{ cursor: 'pointer', marginRight: '-4px', marginTop: '-4px' }} variant='Bulk' />}
        </Grid>
        <Grid alignItems='center' container item xs>
          <Typography color='text.highlight' variant='B-1'>
            {title}
          </Typography>
          {layoutDirection === 'column' && onExpand &&
            <ArrowCircleDown color={theme.palette.text.highlight} onClick={onExpand} size='20' style={{ cursor: 'pointer', marginLeft: '4px' }} variant='Bulk' />}
        </Grid>
        {
          cryptoAmount === undefined
            ? (
              <Skeleton
                animation='wave'
                height='18px'
                sx={{ borderRadius: '10px', fontWeight: 'bold', my: layoutDirection === 'row' ? '3px' : '9px', transform: 'none', width: '65px' }}
                variant='text'
              />)
            : (
              <ColumnAmounts
                color={theme.palette.text.highlight}
                cryptoAmount={cryptoAmount}
                decimal={decimal}
                fiatAmount={fiatAmount}
                placement={layoutDirection === 'row' ? 'left' : 'right'}
                token={token}
              />)
        }
      </Container>
      {buttonsArray.length > 0 &&
        <Container
          disableGutters
          sx={{
            alignItems: 'center',
            bgcolor: layoutDirection === 'row' ? '#060518' : 'none',
            borderRadius: '12px',
            display: 'flex',
            gap: layoutDirection === 'row' ? '2px' : '4px',
            minWidth: '104px',
            ml: layoutDirection === 'row' ? 'auto' : '8px',
            p: '2px',
            width: 'fit-content'
          }}
        >
          {buttonsArray.map((button, index) => (
            <TileActionButton
              Icon={button.Icon}
              isRow={layoutDirection === 'row'}
              key={index}
              noText={buttonsArray.length > 1 && layoutDirection === 'row'}
              onClick={button.onClick}
              text={button.text}
            />
          ))}
        </Container>}
    </Grid>
  );
}
