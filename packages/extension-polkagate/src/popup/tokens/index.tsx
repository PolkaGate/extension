// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Coin, Lock1, Trade } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { calcChange, calcPrice } from '@polkadot/extension-polkagate/src/util';
import { BN_ZERO } from '@polkadot/util';

import { AssetLogo, BackWithLabel, DisplayBalance, FadeOnScroll, FormatPrice, Motion } from '../../components';
import { useAccountAssets, useBackground, useSelectedAccount, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { GlowBox } from '../../style';
import { toTitleCase } from '../../util';
import getLogo2, { type LogoInfo } from '../../util/getLogo2';
import DailyChange from '../home/partial/DailyChange';
import ReservedLockedPopup from './partial/ReservedLockedPopup';
import TokenDetailBox from './partial/TokenDetailBox';
import TokenHistory from './partial/TokenHistory';
import TokenStakingInfo from './partial/TokenStakingInfo';
import { useTokenInfoDetails } from './useTokenInfoDetails';

const BackButton = ({ logoInfo, token }: { token: FetchedBalance | undefined; logoInfo: LogoInfo | undefined }) => (
  <Grid alignItems='center' container item sx={{ columnGap: '6px', width: 'fit-content' }}>
    <AssetLogo assetSize='24px' baseTokenSize='16px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={undefined} subLogoPosition='' />
    <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
      {token?.chainName ? toTitleCase(token.chainName) : ''}
    </Typography>
  </Grid>
);

function Tokens (): React.ReactElement {
  useBackground('default');

  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const refContainer = useRef<HTMLDivElement>(null);
  const address = useSelectedAccount()?.address;

  const { genesisHash, paramAssetId } = useParams<{ genesisHash: string; paramAssetId: string }>();
  const accountAssets = useAccountAssets(address);
  const token = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === paramAssetId)
  , [accountAssets, genesisHash, paramAssetId]);

  const logoInfo = useMemo(() => getLogo2(token?.genesisHash, token?.token), [token?.genesisHash, token?.token]);

  const { closeMenu,
    displayPopup,
    hasAmount,
    lockedBalance,
    lockedTooltip,
    onTransferable,
    pricesInCurrency,
    reservedBalance,
    state,
    tokenPrice,
    transferable } = useTokenInfoDetails(address, genesisHash, token);

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const tokenPriceChange = pricesInCurrency?.prices[token?.priceId ?? '']?.change ?? 0;
  const change = calcChange(tokenPrice, Number(token?.totalBalance) / (10 ** (token?.decimal ?? 0)), tokenPriceChange);
  const totalBalancePrice = useMemo(() => calcPrice(priceOf(token?.priceId ?? '') ?? 0, token?.totalBalance ?? BN_ZERO, token?.decimal ?? 0), [priceOf, token?.decimal, token?.priceId, token?.totalBalance]);

  const backHome = useCallback(() => navigate('/') as void, [navigate]);

  return (
    <Motion variant='flip'>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <BackWithLabel
          content={<BackButton logoInfo={logoInfo} token={token} />}
          onClick={backHome}
          style={{ height: '40px', pb: 0 }}
        />
        <Container disableGutters ref={refContainer} sx={{ display: 'block', height: 'fit-content', maxHeight: '504px', overflowY: 'auto', pb: '60px', pt: '15px' }}>
          <GlowBox style={{ justifyContent: 'center', justifyItems: 'center', rowGap: '5px' }}>
            <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', mt: '-12px', width: 'fit-content' }}>
              <AssetLogo assetSize='48px' baseTokenSize='24px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} subLogoPosition='-6px -8px auto auto' />
            </Grid>
            <Typography color='text.secondary' variant='B-2'>
              {token?.token}
            </Typography>
            <FormatPrice
              commify
              decimalColor={theme.palette.text.secondary}
              dotStyle={'big'}
              fontFamily='OdibeeSans'
              fontSize='40px'
              fontWeight={400}
              height={40}
              num={totalBalancePrice}
              width='fit-content'
              withSmallDecimal
            />
            <Grid alignItems='center' container item sx={{ columnGap: '5px', lineHeight: '10px', width: 'fit-content' }}>
              <DisplayBalance
                balance={token?.totalBalance}
                decimal={token?.decimal}
                style={{
                  color: '#BEAAD8',
                  width: 'max-content'
                }}
                token={token?.token}
              />
              {token?.priceId && pricesInCurrency?.prices[token?.priceId]?.change &&
                <DailyChange
                  change={change}
                  textVariant='B-1'
                />
              }
            </Grid>
          </GlowBox>
          <Grid container item sx={{ display: 'flex', gap: '4px', p: '15px', pb: '10px' }}>
            <TokenDetailBox
              Icon={Trade}
              amount={transferable}
              decimal={token?.decimal}
              onClick={hasAmount(transferable) ? onTransferable : undefined}
              priceId={token?.priceId}
              title={t('Transferable')}
              token={token?.token}
            />
            <TokenDetailBox
              Icon={Lock1}
              amount={lockedBalance}
              decimal={token?.decimal}
              description={lockedTooltip}
              onClick={hasAmount(lockedBalance) ? displayPopup('locked') : undefined}
              priceId={token?.priceId}
              title={t('Locked')}
              token={token?.token}
            />
            <TokenDetailBox
              Icon={Coin}
              amount={reservedBalance}
              decimal={token?.decimal}
              onClick={hasAmount(reservedBalance) ? displayPopup('reserved') : undefined}
              priceId={token?.priceId}
              title={t('Reserved')}
              token={token?.token}
            />
            <TokenStakingInfo
              genesisHash={genesisHash}
              tokenDetail={token}
            />
          </Grid>
          <TokenHistory
            address={address}
            decimal={token?.decimal}
            genesisHash={genesisHash}
            token={token?.token}
          />
          <FadeOnScroll containerRef={refContainer} />
        </Container>
      </Grid>
      <HomeMenu />
      <ReservedLockedPopup
        TitleIcon={state.data?.titleIcon}
        decimal={token?.decimal}
        handleClose={closeMenu}
        items={state.data?.items ?? {}}
        openMenu={!!state.type}
        price={tokenPrice}
        title={state.type ?? ''}
        token={token?.token}
      />
    </Motion>
  );
}

export default memo(Tokens);
