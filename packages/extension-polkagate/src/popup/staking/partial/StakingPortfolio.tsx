// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Container, Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Sticker } from 'iconsax-react';
import React, { useMemo } from 'react';

import { calcPrice } from '@polkadot/extension-polkagate/src/util';

import { Logo, DisplayBalance, FormatPrice, MySkeleton } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, useIsDark, usePrices, useTokenPrice, useTranslation } from '../../../hooks';
import { GlowBox } from '../../../style';
import { GlowBall } from '../../../style/VelvetBox';
import resolveLogoInfo from '../../../util/logo/resolveLogoInfo';
import PortfolioActionButton, { type PortfolioActionButtonProps } from './PortfolioActionButton';

const StakedToken = ({ genesisHash, isFullScreen, token }: { genesisHash: string; isFullScreen: boolean; token: string | undefined; }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const logoInfo = useMemo(() => resolveLogoInfo(genesisHash, token), [genesisHash, token]);

  if (!token) {
    return;
  }

  return (
    <Grid alignItems='center' container item sx={{ columnGap: '4px', width: 'fit-content' }}>
      <Logo assetSize='16px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
      <Typography color={isFullScreen ? (isDark ? '#AA83DC' : '#7A68A4') : 'text.highlight'} variant='B-2'>
        {t('Staked {{token}}', { replace: { token } })}
      </Typography>
    </Grid>
  );
};

const StakingIcon = ({ isFullScreen, type }: { isFullScreen: boolean; type: 'solo' | 'pool'; }) => {
  const isDark = useIsDark();

  return (
    <Grid container item sx={{ bottom: '10px', height: '32px', position: 'absolute', right: '20px', width: '32px' }}>
      {type === 'solo'
        ? <SnowFlake color={isFullScreen ? (isDark ? '#CB80BC' : '#BBA8DE') : isDark ? '#809ACB40' : '#3988FF'} size='32' style={{ opacity: isFullScreen ? '30%' : 1 }} />
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
  const isDark = useIsDark();

  return (
    <Grid
      alignItems='center' container item justifyContent='flex-start'
      sx={{
        bgcolor: isFullScreen ? (isDark ? '#1B133C' : 'transparent') : 'transparent',
        border: isFullScreen ? `4px solid ${isDark ? '#1B133C' : 'transparent'}` : 'none',
        borderRadius: isFullScreen ? '18px' : 0,
        columnGap: isFullScreen ? '4px' : '8px',
        mb: !isFullScreen && !isDark ? '8px' : 0,
        ml: isFullScreen ? '-18px' : 0,
        mt: isFullScreen ? '6px' : 0,
        overflow: 'hidden',
        position: 'relative',
        width: 'fit-content'
      }}
    >
      {isFullScreen && isDark && <GlowBall style={{ zIndex: -1 }} />}
      {isLoading
        ? (<Stack columnGap='10px' direction='row'>
          <MySkeleton
            bgcolor={isDark ? '#1A1836' : '#E8EDF9'}
            height={isFullScreen ? 36 : 31}
            style={{ borderRadius: '11px', margin: isFullScreen ? '4px 0' : '0 0 1px', width: isFullScreen ? '137px' : '91px' }}
          />
          <MySkeleton
            bgcolor={isDark ? '#1A1836' : '#E8EDF9'}
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
          <Grid sx={{ bgcolor: isDark ? '#1b133cab' : '#f5f7ffc7', inset: 0, position: 'absolute' }} />
        </>
      }
    </Grid>
  );
};

const OnChainInfo = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  const isDark = useIsDark();

  return (
    <Container disableGutters onClick={onClick} sx={{ bgcolor: isDark ? '#AA83DC26' : '#F3F6FD', border: isDark ? 'none' : '1px solid #DDE3F4', borderRadius: '9px', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '4px', m: '-6px 0 -14px auto', p: '2px 4px', width: 'fit-content' }}>
      <Sticker color={isDark ? '#AA83DC' : '#745E9F'} size='20' variant='Bulk' />
      <Typography color={isDark ? '#AA83DC' : '#745E9F'} variant='B-2'>
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
  const isDark = theme.palette.mode === 'dark';
  const isLightPopup = !isFullScreen && !isDark;
  const pricesInCurrency = usePrices();
  const tokenPrice = useTokenPrice(genesisHash);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const textColor = useMemo(
    () =>
      isFullScreen
        ? (isDark ? '#AA83DC' : '#7A68A4')
        : isLightPopup
          ? '#745E9F'
          : theme.palette.text.highlight,
    [isDark, isFullScreen, isLightPopup, theme.palette.text.highlight]
  );

  const stakedInCurrency = useMemo(() => {
    if (!staked || !pricesInCurrency || !tokenPrice || !decimal) {
      return undefined;
    }

    return calcPrice(tokenPrice.price, staked as unknown as BN, decimal);
  }, [decimal, tokenPrice, pricesInCurrency, staked]);

  return (
    <GlowBox
      isBlueish={!isFullScreen && isDark}
      shortSideDividers={isFullScreen}
      style={{
        bgcolor: isLightPopup ? '#FFFFFF' : undefined,
        border: isLightPopup ? '1px solid #E3E8F7' : undefined,
        boxShadow: isLightPopup ? '0px 12px 24px rgba(148, 163, 184, 0.12)' : undefined,
        display: 'grid',
        p: isFullScreen ? '20px 18px 14px' : '20px 18px 0px',
        rowGap: '5px',
        width: 'calc(100% - 16px)',
        ...style
      }}
    >
      {isFullScreen && onInfo && <OnChainInfo onClick={onInfo} />}
      <StakedToken genesisHash={genesisHash} isFullScreen={isFullScreen} token={token} />
      <Grid container item>
        {staked === undefined
        ? (
            <Stack direction='column'>
              <MySkeleton
                bgcolor={theme.palette.mode === 'dark' ? '#BEAAD840' : '#E4EAF9'}
                style={{ margin: isFullScreen ? '5px 0 0px' : '5px 0 0', width: '258px' }}
              />
              <MySkeleton
                bgcolor={theme.palette.mode === 'dark' ? '#BEAAD840' : '#E4EAF9'}
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
          backgroundColor: isFullScreen ? (theme.palette.mode === 'dark' ? '#AA83DC26' : 'transparent') : 'transparent',
          borderRadius: '9px',
          color: textColor,
          fontFamily: 'Inter',
          fontSize: isFullScreen ? '13px' : '12px',
          fontWeight: 500,
          padding: isFullScreen ? (theme.palette.mode === 'dark' ? '3px 4px 1px' : 0) : 0
        }}
        token={token}
        useAdaptiveDecimalPoint
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
