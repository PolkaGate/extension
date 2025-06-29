// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import type { BN } from '@polkadot/util';

import { Container, Grid, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Sticker } from 'iconsax-react';
import React, { useMemo } from 'react';

import { AssetLogo, FormatBalance2, FormatPrice } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, usePrices, useTokenPrice2, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave2';
import { GlowBox } from '../../../style';
import { GlowBall } from '../../../style/VelvetBox';
import getLogo2 from '../../../util/getLogo2';
import PortfolioActionButton, { type PortfolioActionButtonProps } from './PortfolioActionButton';

const StakedToken = ({ genesisHash, token }: { genesisHash: string; token: string | undefined; }) => {
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  if (!token) {
    return;
  }

  return (
    <Grid alignItems='center' container item sx={{ columnGap: '4px', width: 'fit-content' }}>
      <AssetLogo assetSize='16px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
      <Typography color='text.highlight' variant='B-2'>
        {`Staked ${token}`}
      </Typography>
    </Grid>
  );
};

const StakingIcon = ({ type }: { type: 'solo' | 'pool'; }) => {
  return (
    <Grid container item sx={{ bottom: 0, height: '32px', position: 'absolute', right: '20px', width: '32px' }}>
      {type === 'solo'
        ? <SnowFlake color='#809ACB40' size='32' />
        : <Ice asPortfolio size='32' />
      }
    </Grid>
  );
};

interface ButtonsProps {
  buttons: PortfolioActionButtonProps[];
  isFullScreen?: boolean;
}

const Buttons = ({ buttons, isFullScreen }: ButtonsProps) => {
  return (
    <Grid alignItems='center' container item justifyContent='flex-start'
      sx={{
        bgcolor: isFullScreen ? '#1B133C' : 'transparent',
        border: isFullScreen ? '4px solid #1B133C' : 'none',
        borderRadius: isFullScreen ? '18px' : 0,
        columnGap: isFullScreen ? '4px' : '8px',
        ml: isFullScreen ? '-18px' : 0,
        mt: isFullScreen ? '6px' : 0,
        overflow: 'hidden',
        position: 'relative',
        width: 'fit-content'
      }}
    >
      {isFullScreen && <GlowBall style={{ zIndex: -1 }} />}
      {buttons.map(({ Icon, disabled, onClick, text }, index) => (
        <PortfolioActionButton
          Icon={Icon}
          disabled={disabled}
          isFullScreen={isFullScreen}
          key={index}
          onClick={onClick}
          text={text}
        />
      ))}
    </Grid>
  );
};

const OnChainInfo = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <Container disableGutters onClick={onClick} sx={{ bgcolor: '#AA83DC26', borderRadius: '9px', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '4px', m: '-6px 0 -14px auto', p: '2px 4px', width: 'fit-content' }}>
      <Sticker color='#AA83DC' size='20' variant='Bulk' />
      <Typography color='#AA83DC' variant='B-2'>
        {t('On-chain staking info')}
      </Typography>
    </Container>
  );
};

interface Props {
  genesisHash: string;
  staked: BN | undefined;
  type: 'solo' | 'pool';
  style?: SxProps<Theme>;
  buttons?: PortfolioActionButtonProps[];
  isFullScreen?: boolean;
  onInfo?: () => void;
}

export default function StakingPortfolio ({ buttons = [], genesisHash, isFullScreen = false, onInfo, staked, style, type }: Props): React.ReactElement {
  const theme = useTheme();
  const pricesInCurrency = usePrices();
  const tokenPrice = useTokenPrice2(genesisHash);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const adaptiveDecimalPoint = useMemo(() => staked && decimal && (String(staked).length >= decimal - 1 ? 2 : 4), [decimal, staked]);
  const textColor = useMemo(() => isFullScreen ? theme.palette.text.highlight : '#AA83DC', [isFullScreen, theme.palette.text.highlight]);

  const stakedInCurrency = useMemo(() => {
    if (!staked || !pricesInCurrency || !tokenPrice || !decimal) {
      return undefined;
    }

    return calcPrice(tokenPrice.price, staked as unknown as BN, decimal);
  }, [decimal, tokenPrice, pricesInCurrency, staked]);

  return (
    <GlowBox isBlueish={!isFullScreen} shortSideDividers={isFullScreen} style={{ display: 'grid', p: '20px 18px 0px', rowGap: '5px', width: 'calc(100% - 16px)', ...style }}>
      {isFullScreen && onInfo && <OnChainInfo onClick={onInfo} />}
      <StakedToken genesisHash={genesisHash} token={token} />
      <Grid container item>
        {staked === undefined
          ? (
            <Skeleton
              animation='wave'
              height={isFullScreen ? '40px' : '30px'}
              sx={{ borderRadius: '50px', fontWeight: 'bold', maxWidth: '245px', mt: '5px', transform: 'none', width: '100%' }}
              variant='text'
            />)
          : (
            <FormatPrice
              commify
              decimalColor={textColor}
              dotStyle={'big'}
              fontFamily='OdibeeSans'
              fontSize={isFullScreen ? '48px' : '40px'}
              fontWeight={400}
              height={isFullScreen ? 48 : 40}
              num={stakedInCurrency}
              width='fit-content'
              withSmallDecimal
            />)
        }
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-start' sx={{ bgcolor: staked && isFullScreen ? '#AA83DC26' : 'transparent', borderRadius: '9px', m: '-3px 0 6px', p: staked && isFullScreen ? '2px 4px' : 0, width: staked && isFullScreen ? 'fit-content' : '100%' }}>
        {staked === undefined
          ? (
            <Skeleton
              animation='wave'
              height='16px'
              sx={{ borderRadius: '10px', fontWeight: 'bold', m: '6px 0 1px', maxWidth: '75px', transform: 'none', width: '100%' }}
              variant='text'
            />)
          : (
            <FormatBalance2
              decimalPoint={adaptiveDecimalPoint}
              decimals={[decimal ?? 0]}
              style={{
                color: textColor,
                fontFamily: 'Inter',
                fontSize: isFullScreen ? '13px' : '12px',
                fontWeight: 500,
                width: 'max-content'
              }}
              tokens={[token ?? '']}
              value={staked}
            />)}
      </Grid>
      <Buttons buttons={buttons} isFullScreen={isFullScreen} />
      <StakingIcon type={type} />
    </GlowBox>
  );
}
