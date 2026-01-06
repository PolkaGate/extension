// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Container, Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Sticker } from 'iconsax-react';
import React, { useMemo } from 'react';

import { calcPrice } from '@polkadot/extension-polkagate/src/util';

import { AssetLogo, DisplayBalance, FormatPrice, MySkeleton } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, usePrices, useTokenPrice, useTranslation } from '../../../hooks';
import { GlowBox } from '../../../style';
import { GlowBall } from '../../../style/VelvetBox';
import getLogo2 from '../../../util/getLogo2';
import PortfolioActionButton, { type PortfolioActionButtonProps } from './PortfolioActionButton';

const StakedToken = ({ genesisHash, isFullScreen, token }: { genesisHash: string; isFullScreen: boolean; token: string | undefined; }) => {
  const { t } = useTranslation();

  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  if (!token) {
    return;
  }

  return (
    <Grid alignItems='center' container item sx={{ columnGap: '4px', width: 'fit-content' }}>
      <AssetLogo assetSize='16px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
      <Typography color={isFullScreen ? '#AA83DC' : 'text.highlight'} variant='B-2'>
        {t('Staked {{token}}', { replace: { token } })}
      </Typography>
    </Grid>
  );
};

const StakingIcon = ({ isFullScreen, type }: { isFullScreen: boolean; type: 'solo' | 'pool'; }) => {
  return (
    <Grid container item sx={{ bottom: isFullScreen ? '10px' : 0, height: '32px', position: 'absolute', right: '20px', width: '32px' }}>
      {type === 'solo'
        ? <SnowFlake color={isFullScreen ? '#CB80BC' : '#809ACB40'} size='32' style={{ opacity: isFullScreen ? '30%' : 1 }} />
        : <Ice asPortfolio isFullScreen={isFullScreen} size='32' />
      }
    </Grid>
  );
};

interface ButtonsProps {
  buttons: PortfolioActionButtonProps[];
  isLoading?: boolean;
  isFullScreen?: boolean;
  disabled?: boolean;
}

const Buttons = ({ buttons, disabled, isFullScreen, isLoading }: ButtonsProps) => {
  return (
    <Grid
      alignItems='center' container item justifyContent='flex-start'
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
      {isLoading
        ? (<Stack columnGap='10px' direction='row'>
          <MySkeleton
            bgcolor='#1A1836'
            height={isFullScreen ? 36 : 31}
            style={{ borderRadius: '11px', margin: isFullScreen ? '4px 0' : '0 0 1px', width: isFullScreen ? '137px' : '91px' }}
          />
          <MySkeleton
            bgcolor='#1A1836'
            height={isFullScreen ? 36 : 31}
            style={{ borderRadius: '11px', margin: isFullScreen ? '4px 0' : '0 0 1px', width: isFullScreen ? '137px' : '121px' }}
          />
        </Stack>)
        : (<>
          {
            buttons.map(({ Icon, disabled, onClick, text }, index) => (
              <PortfolioActionButton
                Icon={Icon}
                disabled={disabled}
                isFullScreen={isFullScreen}
                key={index}
                onClick={onClick}
                text={text}
              />))
          }
        </>)
      }
      {disabled &&
        <>
          <GlowBall />
          <Grid sx={{ bgcolor: '#1b133cab', inset: 0, position: 'absolute' }} />
        </>
      }
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
  disabled?: boolean;
}

export default function StakingPortfolio({ buttons = [], disabled, genesisHash, isFullScreen = false, onInfo, staked, style, type }: Props): React.ReactElement {
  const theme = useTheme();
  const pricesInCurrency = usePrices();
  const tokenPrice = useTokenPrice(genesisHash);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const textColor = useMemo(() => isFullScreen ? '#AA83DC' : theme.palette.text.highlight, [isFullScreen, theme.palette.text.highlight]);

  const stakedInCurrency = useMemo(() => {
    if (!staked || !pricesInCurrency || !tokenPrice || !decimal) {
      return undefined;
    }

    return calcPrice(tokenPrice.price, staked as unknown as BN, decimal);
  }, [decimal, tokenPrice, pricesInCurrency, staked]);

  return (
    <GlowBox isBlueish={!isFullScreen} shortSideDividers={isFullScreen} style={{ display: 'grid', p: '20px 18px 0px', rowGap: '5px', width: 'calc(100% - 16px)', ...style }}>
      {isFullScreen && onInfo && <OnChainInfo onClick={onInfo} />}
      <StakedToken genesisHash={genesisHash} isFullScreen={isFullScreen} token={token} />
      <Grid container item>
        {staked === undefined
          ? (
            <Stack direction='column'>
              <MySkeleton
                bgcolor='#BEAAD840'
                style={{ margin: isFullScreen ? '5px 0 0px' : '5px 0 0', width: '258px' }}
              />
              <MySkeleton
                bgcolor='#BEAAD840'
                style={{ margin: isFullScreen ? '8px 0 8px' : '5px 0 0', width: '155px' }}
              />
            </Stack>
          )
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
      <DisplayBalance
        balance={staked}
        decimal={decimal}
        skeletonStyle={{ bgcolor: '#BEAAD840', borderRadius: '10px', margin: '10px 0 1px', width: '88px' }}
        style={{
          backgroundColor: isFullScreen ? '#AA83DC26' : 'transparent',
          borderRadius: '9px',
          color: textColor,
          fontFamily: 'Inter',
          fontSize: isFullScreen ? '13px' : '12px',
          fontWeight: 500,
          padding: isFullScreen ? '3px 4px 1px' : 0
        }}
        token={token}
      />
      <Buttons
        buttons={buttons}
        disabled={disabled}
        isFullScreen={isFullScreen}
        isLoading={staked === undefined}
      />
      <StakingIcon isFullScreen={isFullScreen} type={type} />
    </GlowBox>
  );
}
