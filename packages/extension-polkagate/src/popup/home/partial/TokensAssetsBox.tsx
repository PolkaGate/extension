// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { BN } from '@polkadot/util';
import type { Prices } from '../../../util/types';

import { Badge, Collapse, Container, Divider, Grid, type Theme, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { CloseCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { calcPrice, toTitleCase } from '@polkadot/extension-polkagate/src/util';
import { BN_ZERO } from '@polkadot/util';

import { AssetLogo } from '../../../components';
import { useIsDark, useIsExtensionPopup, useSelectedAccount } from '../../../hooks';
import allChains from '../../../util/chains';
import getLogo2, { type LogoInfo } from '../../../util/getLogo2';
import Drawer from './Drawer';
import { TokenBalanceDisplay } from './TokenBalanceDisplay';
import { TokenPriceInfo } from './TokenPriceInfo';

type Assets = Record<string, FetchedBalance[]> | null | undefined;
interface AssetDetailType {
  assets: (FetchedBalance & { totalPrice: number })[];
  assetsTotalBalancePrice: number;
  assetsTotalBalanceBN: BN;
  genesisHash: string | undefined;
  logoInfo: LogoInfo | undefined;
  token: string | undefined;
  priceId: string | undefined;
  decimal: number | undefined;
}

type Summary = AssetDetailType[] | null | undefined;

function TokensItems({ onTokenClick, theme, tokenDetail }: { onTokenClick: () => void, tokenDetail: FetchedBalance & { totalPrice: number }, theme: Theme }) {
  const bgcolor = theme.palette.mode === 'dark' ? '#2D1E4A' : '#CCD2EA59';
  const { chainName, decimal, genesisHash, token, totalBalance, totalPrice } = tokenDetail;
  const logoInfo = getLogo2(genesisHash, token);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' onClick={onTokenClick} sx={{ ':hover': { background: bgcolor }, borderRadius: '12px', cursor: 'pointer', p: '4px 8px', transition: 'all 250ms ease-out' }}>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
        <Grid item sx={{ border: '3px solid', borderColor: bgcolor, borderRadius: '8px' }}>
          <AssetLogo
            assetSize='26px'
            baseTokenSize='18px'
            genesisHash={genesisHash}
            logo={logoInfo?.logoSquare}
            logoRoundness='8px'
            subLogo={logoInfo?.subLogo}
            subLogoPosition='-3px -8px auto auto'
            token={token}
          />
        </Grid>
        <Grid container direction='column' item sx={{ width: 'fit-content' }}>
          <Typography color='text.secondary' sx={{ bgcolor, borderRadius: '8px', px: '3px', width: 'fit-content' }} variant='B-1'>
            {token}
          </Typography>
          <Typography color='text.secondary' variant='S-2'>
            {toTitleCase(chainName)}
          </Typography>
        </Grid>
      </Grid>
      <TokenBalanceDisplay
        decimal={decimal}
        token={token}
        totalBalanceBN={totalBalance}
        totalBalancePrice={totalPrice}
      />
    </Grid>
  );
}

const MemoizedTokensItems = memo(TokensItems);

function TokenBox({ address, theme, tokenDetail }: { address: string | undefined, theme: Theme, tokenDetail: AssetDetailType }) {
  const isExtension = useIsExtensionPopup();
  const navigate = useNavigate();
  const isDark = useIsDark();

  const bgColor = isDark ? '#05091C' : '#EDF1FF';
  const badgeBgColor = isDark ? '#05091C' : '#F5F4FF';
  const closeColor = isDark ? '#674394' : '#CCD2EA';
  const dividerColor = isDark ? '#2D1E4A' : '#CCD2EA66';
  const tokenBoxColor = isDark ? '#1B133C' : '#FFFFFF';
  const { assets, assetsTotalBalanceBN, assetsTotalBalancePrice, decimal, genesisHash, logoInfo, priceId, token } = tokenDetail;

  const [expand, setExpand] = useState<boolean>(false);

  const toggleExpand = useCallback(() => setExpand((isExpanded) => !isExpanded), []);
  const closeCircleStyle = useMemo(() => ({
    marginLeft: '8px',
    transition: 'all 250ms ease-out',
    transitionDelay: expand ? '200ms' : 'unset',
    width: expand ? '42px' : 0
  }), [expand]);

  const getTokenClickHandler = useCallback((token: FetchedBalance) => () => {
    isExtension
      ? navigate(`token/${token.genesisHash}/${token.assetId}`) as void
      : address && navigate(`/accountfs/${address}/${token.genesisHash}/${token.assetId}`) as void;
  }, [isExtension, navigate, address]);

  return (
    <div>
      <Grid container item sx={{ background: bgColor, borderRadius: '14px', cursor: 'pointer', p: '12px 10px' }}>
        <Container disableGutters onClick={toggleExpand} sx={{ alignItems: 'center', display: 'flex' }}>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ transition: 'all 250ms ease-out' }} xs>
            <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
              <Badge
                badgeContent={assets.length} sx={{
                  '& .MuiBadge-badge': {
                    background: badgeBgColor,
                    color: 'primary.main',
                    fontSize: '13px',
                    height: '16px',
                    lineHeight: '18.2px',
                    right: 5,
                    top: 10,
                    width: '19px'
                  }
                }}
              >
                <AssetLogo
                  assetSize='36px'
                  baseTokenSize='16px'
                  genesisHash={genesisHash}
                  logo={logoInfo?.logo ?? logoInfo?.subLogo}
                  token={token}
                />
              </Badge>
              <TokenPriceInfo
                priceId={priceId}
                token={token}
              />
            </Grid>
            <TokenBalanceDisplay
              decimal={decimal}
              token={token}
              totalBalanceBN={assetsTotalBalanceBN}
              totalBalancePrice={assetsTotalBalancePrice}
            />
          </Grid>
          <CloseCircle color={closeColor} size='32' style={closeCircleStyle} variant='Bold' />
        </Container>
        <Collapse in={expand} sx={{ width: '100%' }}>
          <Grid container item sx={{ background: tokenBoxColor, borderRadius: '12px', mt: '10px', p: '4px 2px', rowGap: '4px' }}>
            {assets.map((token, index) => {
              const showDivider = assets.length !== index + 1;

              return (
                <React.Fragment key={`${index}_fragment`}>
                  <MemoizedTokensItems
                    onTokenClick={getTokenClickHandler(token)}
                    theme={theme}
                    tokenDetail={token}
                  />
                  {showDivider &&
                    <Divider sx={{ bgcolor: dividerColor, height: '1px', width: '100%' }} />
                  }
                </React.Fragment>
              );
            })}
          </Grid>
        </Collapse>
      </Grid>
      <Drawer length={expand ? 0 : assets.length} />
    </div>
  );
}

const MemoizedTokenBox = memo(TokenBox);

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' }, y: 0 }
};

function TokensAssetsBox({ accountAssets, pricesInCurrency, selectedChains }: { accountAssets: FetchedBalance[]; selectedChains: string[]; pricesInCurrency: Prices; }) {
  const theme = useTheme();
  const address = useSelectedAccount()?.address;

  const tokens: Assets = useMemo(() => {
    if (!selectedChains) {
      return undefined;
    }

    if (accountAssets) {
      if (accountAssets.length === 0) {
        return null;
      }

      return accountAssets.reduce<Record<string, FetchedBalance[]>>((acc, balance) => {
        if (selectedChains.includes(balance.genesisHash) && !balance.totalBalance.isZero()) {
          const normalizedToken = balance.token.toUpperCase(); // since there are tokens like USDT and USDt

          (acc[normalizedToken] ||= []).push(balance);
        }

        return acc;
      }, {});
    } else {
      return accountAssets;
    }
  }, [accountAssets, selectedChains]);

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};

    if (!accountAssets) {
      return map;
    }

    accountAssets.forEach((asset) => {
      if (asset.priceId) {
        map[asset.priceId] = pricesInCurrency?.prices?.[asset.priceId]?.value || 0;
      }
    });

    return map;
  }, [accountAssets, pricesInCurrency?.prices]);

  const summary: Summary = useMemo(() => {
    if (!tokens) {
      return undefined;
    }

    return Object.entries(tokens).map(([token, assets]) => {
      let totalBalanceBN = BN_ZERO;
      let totalBalancePrice = 0;

      const enriched = assets.map((asset) => {
        const totalPrice = calcPrice(priceMap[asset.priceId], asset.totalBalance, asset.decimal);

        totalBalanceBN = totalBalanceBN.add(asset.totalBalance);
        totalBalancePrice += totalPrice;

        return { ...asset, totalPrice };
      });

      const sortedAssets = enriched.slice().sort((a, b) => b.totalPrice - a.totalPrice);
      const baseToken = sortedAssets[0];

      let genesisHash: string | undefined;
      let decimal: number | undefined;

      if (baseToken) {
        genesisHash = baseToken.genesisHash.toString();
        decimal = baseToken.decimal;
      } else { // @AMIRKHANEF does this fallback really needed?
        const baseTokenFallback = allChains.find(({ name, tokenSymbol }) => !/Asset Hub|People/.test(name) && tokenSymbol.toLowerCase() === token.toLowerCase());

        genesisHash = baseTokenFallback?.genesisHash;
        decimal = baseTokenFallback?.tokenDecimal;
      }

      const logoInfo = getLogo2(genesisHash, token);

      return {
        assets: sortedAssets,
        assetsTotalBalanceBN: totalBalanceBN,
        assetsTotalBalancePrice: totalBalancePrice,
        decimal,
        genesisHash,
        logoInfo,
        priceId: baseToken.priceId,
        token
      };
    }).sort((a, b) => b.assetsTotalBalancePrice - a.assetsTotalBalancePrice);
  }, [tokens, priceMap]);

  return (
    <>
      {summary?.map((tokenDetail) => (
        <motion.div key={tokenDetail.token} variants={itemVariants}>
          <MemoizedTokenBox
            address={address}
            theme={theme}
            tokenDetail={tokenDetail}
          />
        </motion.div>
      ))}
    </>
  );
}

export default memo(TokensAssetsBox);
