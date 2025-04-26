// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Container, Grid, Skeleton, Typography } from '@mui/material';
import { ArrowCircleDown, type Icon } from 'iconsax-react';
import React, { useRef } from 'react';

import { Tooltip } from '../../../components';
import { useIsHovered } from '../../../hooks';
import { ColumnAmounts } from '../../tokens/partial/ColumnAmounts';

interface TileActionButtonProps {
  text: string;
  Icon: Icon;
  onClick: () => void;
  noText?: boolean;
}

function TileActionButton ({ Icon, noText = false, onClick, text }: TileActionButtonProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const hovered = useIsHovered(containerRef);

  return (
    <>
      <Grid alignItems='center' container item justifyContent='center' onClick={onClick} ref={containerRef} sx={{ ':hover': { bgcolor: '#809ACB', borderColor: 'transparent' }, bgcolor: '#110F2A', borderRadius: '11px', columnGap: '4px', cursor: 'pointer', flexWrap: 'nowrap', p: '4px 7px', transition: 'all 150ms ease-out' }} xs>
        <Icon color={hovered ? '#ffffff' : '#809ACB'} size='19' variant='Bulk' />
        {!noText &&
          <Typography color={hovered ? '#ffffff' : 'text.highlight'} sx={{ transition: 'all 150ms ease-out', width: 'max-content' }} variant='B-2'>
            {text}
          </Typography>}
      </Grid>
      <Tooltip
        content={text}
        placement='top'
        positionAdjustment={{ left: -37, top: -6 }}
        targetRef={noText ? containerRef : null}
      />
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
  if (cryptoAmount?.isZero()) {
    return <></>;
  }

  return (
    <Grid alignItems='center' container item sx={{ bgcolor: '#2D1E4A4D', borderRadius: '14px', minWidth: 'calc((100% - 8px) / 3)', p: '4px', width: layoutDirection === 'row' ? 'fit-content' : '100%' }}>
      <Container disableGutters sx={{ alignItems: layoutDirection === 'row' ? 'flex-start' : 'center', display: 'flex', flexDirection: layoutDirection === 'row' ? 'column' : 'row', gap: '6px', justifyContent: layoutDirection === 'row' ? 'space-between' : 'flex-start', p: '8px', width: '100%' }}>
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ width: layoutDirection === 'row' ? '100%' : 'fit-content' }}>
          <Icon color='#809ACB' size='20' variant='Bulk' />
          {layoutDirection === 'row' && onExpand && <ArrowCircleDown color='#809ACB' onClick={onExpand} size='22' style={{ cursor: 'pointer', marginRight: '-4px', marginTop: '-4px' }} variant='Bulk' />}
        </Grid>
        <Grid alignItems='center' container item xs>
          <Typography color='text.highlight' variant='B-1'>
            {title}
          </Typography>
          {layoutDirection === 'column' && onExpand && <ArrowCircleDown color='#809ACB' onClick={onExpand} size='20' style={{ cursor: 'pointer', marginLeft: '4px' }} variant='Bulk' />}
        </Grid>
        {
          cryptoAmount === undefined
            ? (
              <Skeleton
                animation='wave'
                height='24px'
                sx={{ borderRadius: '50px', fontWeight: 'bold', transform: 'none', width: layoutDirection === 'row' ? '35px' : '65px' }}
                variant='text'
              />)
            : (
              <ColumnAmounts
                cryptoAmount={cryptoAmount}
                decimal={decimal}
                fiatAmount={fiatAmount}
                placement={layoutDirection === 'row' ? 'left' : 'right'}
                token={token}
              />)
        }
      </Container>
      {buttonsArray.length > 0 &&
        <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#060518', borderRadius: '12px', display: 'flex', gap: '2px', minWidth: '104px', ml: layoutDirection === 'row' ? 'auto' : '8px', p: '2px', width: 'fit-content' }}>
          {buttonsArray.map((button, index) => (
            <TileActionButton
              Icon={button.Icon}
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
