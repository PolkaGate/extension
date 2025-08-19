// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { FetchedBalance } from '../../../hooks/useAssetsBalances';
import type { Prices } from '../../../util/types';

import { Badge, Collapse, Container, Divider, Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { CloseCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toTitleCase } from '@polkadot/extension-polkagate/src/util';
import { BN_ZERO } from '@polkadot/util';
import allChains from '../../../util/chains';

import { AssetLogo } from '../../../components';
import { useIsExtensionPopup, usePrices, useSelectedAccount } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import getLogo2, { type LogoInfo } from '../../../util/getLogo2';
import { Drawer } from './Drawer';
import { TokenPriceInfo } from './TokenPriceInfo';
import { TokenBalanceDisplay } from './TokenBalanceDisplay';

type Assets = Record<string, FetchedBalance[]> | null | undefined;
interface AssetDetailType {
  assets: FetchedBalance[];
  assetsTotalBalancePrice: number;
  assetsTotalBalanceBN: BN;
  genesisHash: string | undefined;
  logoInfo: LogoInfo | undefined;
  token: string | undefined;
  priceId: string | undefined;
  decimal: number | undefined;
}

type Summary = AssetDetailType[] | null | undefined;

function TokensItems({ tokenDetail }: { tokenDetail: FetchedBalance }) {
  const theme = useTheme();
  const account = useSelectedAccount();
  const isExtension = useIsExtensionPopup();
  const navigate = useNavigate();

  const bgcolor = theme.palette.mode === 'dark' ? '#2D1E4A' : '#CCD2EA59';
  const pricesInCurrency = usePrices();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const logoInfo = getLogo2(tokenDetail.genesisHash, tokenDetail.token);
  const balancePrice = calcPrice(priceOf(tokenDetail.priceId), tokenDetail.totalBalance, tokenDetail.decimal);

  const onTokenClick = useCallback(() => {
    isExtension
      ? navigate(`token/${tokenDetail.genesisHash}/${tokenDetail.assetId}`) as void
      : account?.address && navigate(`/accountfs/${account.address}/${tokenDetail.genesisHash}/${tokenDetail.assetId}`) as void;
  }, [isExtension, navigate, tokenDetail.genesisHash, tokenDetail.assetId, account?.address]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' onClick={onTokenClick} sx={{ ':hover': { background: bgcolor }, borderRadius: '12px', cursor: 'pointer', p: '4px 8px', transition: 'all 250ms ease-out' }}>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
        <Grid item sx={{ border: '3px solid', borderColor: bgcolor, borderRadius: '8px' }}>
          <AssetLogo assetSize='26px' baseTokenSize='18px' genesisHash={tokenDetail.genesisHash} logo={logoInfo?.logoSquare} logoRoundness='8px' subLogo={logoInfo?.subLogo} subLogoPosition='-3px -8px auto auto' />
        </Grid>
        <Grid container direction='column' item sx={{ width: 'fit-content' }}>
          <Typography color='text.secondary' sx={{ bgcolor, borderRadius: '8px', px: '3px', width: 'fit-content' }} variant='B-1'>
            {tokenDetail.token}
          </Typography>
          <Typography color='text.secondary' variant='S-2'>
            {toTitleCase(tokenDetail.chainName)}
          </Typography>
        </Grid>
      </Grid>
      <TokenBalanceDisplay
        decimal={tokenDetail.decimal}
        token={tokenDetail.token}
        totalBalanceBN={tokenDetail.totalBalance}
        totalBalancePrice={balancePrice}
      />
    </Grid>
  );
}

function TokenBox({ tokenDetail }: { tokenDetail: AssetDetailType }) {
  const theme = useTheme();

  const isDark = theme.palette.mode === 'dark';
  const bgColor = isDark ? '#05091C' : '#EDF1FF';
  const badgeBgColor = isDark ? '#05091C' : '#F5F4FF';
  const closeColor = isDark ? '#674394' : '#CCD2EA';
  const dividerColor = isDark ? '#2D1E4A' : '#CCD2EA66';
  const tokenBoxColor = isDark ? '#1B133C' : '#FFFFFF';

  const [expand, setExpand] = useState<boolean>(false);

  const toggleExpand = useCallback(() => setExpand((isExpanded) => !isExpanded), []);

  return (
    <div>
      <Grid container item sx={{ background: bgColor, borderRadius: '14px', cursor: 'pointer', p: '12px 10px' }}>
        <Container disableGutters onClick={toggleExpand} sx={{ alignItems: 'center', display: 'flex' }}>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ transition: 'all 250ms ease-out' }} xs>
            <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
              <Badge
                badgeContent={tokenDetail.assets.length} sx={{
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
                <AssetLogo assetSize='36px' baseTokenSize='16px' genesisHash={tokenDetail.genesisHash} logo={tokenDetail.logoInfo?.logo ?? tokenDetail.logoInfo?.subLogo} token={tokenDetail.token} />
              </Badge>
              <TokenPriceInfo
                priceId={tokenDetail.priceId}
                token={tokenDetail.token}
              />
            </Grid>
            <TokenBalanceDisplay
              decimal={tokenDetail.decimal}
              token={tokenDetail.token}
              totalBalanceBN={tokenDetail.assetsTotalBalanceBN}
              totalBalancePrice={tokenDetail.assetsTotalBalancePrice}
            />
          </Grid>
          <CloseCircle color={closeColor} size='32' style={{ marginLeft: '8px', transition: 'all 250ms ease-out', transitionDelay: expand ? '200ms' : 'unset', width: expand ? '42px' : 0 }} variant='Bold' />
        </Container>
        <Collapse in={expand} sx={{ width: '100%' }}>
          <Grid container item sx={{ background: tokenBoxColor, borderRadius: '12px', mt: '10px', p: '4px 2px', rowGap: '4px' }}>
            {tokenDetail.assets.map((token, index) => {
              const showDivider = tokenDetail.assets.length !== index + 1;

              return (
                <React.Fragment key={`${index}_fragment`}>
                  <TokensItems
                    key={index}
                    tokenDetail={token}
                  />
                  {showDivider && <Divider sx={{ bgcolor: dividerColor, height: '1px', width: '100%' }} />}
                </React.Fragment>
              );
            })}
          </Grid>
        </Collapse>
      </Grid>
      <Drawer length={expand ? 0 : tokenDetail.assets.length} />
    </div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' }, y: 0 }
};

function TokensAssetsBox({ accountAssets, pricesInCurrency, selectedChains }: { accountAssets: FetchedBalance[]; selectedChains: string[]; pricesInCurrency: Prices; }) {
  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const tokens: Assets = useMemo(() => {
    if (!selectedChains) {
      return undefined;
    }

    if (accountAssets) {
      if (accountAssets.length === 0) {
        return null;
      }

      // filter non selected chains && non zero chains
      const filtered = accountAssets.filter(
        ({ genesisHash, totalBalance }) =>
          selectedChains.includes(genesisHash) && !totalBalance.isZero()
      );

      return filtered.reduce<Record<string, FetchedBalance[]>>((acc, balance) => {
        const { token } = balance;

        // Initialize the array for the token if it doesn't exist
        if (!acc[token]) {
          acc[token] = [];
        }

        // Push the current balance item to the respective array
        acc[token].push(balance);

        return acc;
      }, {});
    } else {
      return accountAssets;
    }
  }, [accountAssets, selectedChains]);

  const summary: Summary = useMemo(() => {
    if (!tokens) {
      return tokens;
    }

    return Object.entries(tokens).map(([token, assets]) => {
      const assetsTotalBalance = assets.reduce((sum, asset) => ({
        totalBalanceBN: sum.totalBalanceBN.add(asset.totalBalance),
        totalBalancePrice: sum.totalBalancePrice + calcPrice(priceOf(asset.priceId), asset.totalBalance, asset.decimal)
      }), { totalBalanceBN: BN_ZERO, totalBalancePrice: 0 });

      const network = assets.find(({ token: tokenNetwork }) => tokenNetwork.toLowerCase() === token.toLowerCase());

      const priceId = assets[0].priceId;

      const sortedAssets = assets.slice().sort((a, b) => {
        const totalPriceA = calcPrice(priceOf(a.priceId), a.totalBalance, a.decimal);
        const totalPriceB = calcPrice(priceOf(b.priceId), b.totalBalance, b.decimal);

        return totalPriceB - totalPriceA;
      });

      let genesisHash: string | undefined;
      let decimal: number | undefined;

      if (network) {
        genesisHash = network?.genesisHash.toString();
        decimal = network?.decimal;
      } else {
        const network = allChains.find(({ name, tokenSymbol }) => {
          const isExcluded = /Asset Hub|People/.test(name);
          const matchesToken = tokenSymbol.toLowerCase() === token.toLowerCase();

          return !isExcluded && matchesToken;
        });
        genesisHash = network?.genesisHash;
        decimal = network?.tokenDecimal;
      }

      const logoInfo = getLogo2(genesisHash, token);

      return {
        assets: sortedAssets,
        assetsTotalBalanceBN: assetsTotalBalance.totalBalanceBN,
        assetsTotalBalancePrice: assetsTotalBalance.totalBalancePrice,
        decimal,
        genesisHash,
        logoInfo,
        priceId,
        token
      };
    })
      .sort((a, b) => b.assetsTotalBalancePrice - a.assetsTotalBalancePrice);
  }, [tokens, priceOf]);

  return (
    <>
      {summary?.map((tokenDetail, index) => (
        <motion.div key={index} variants={itemVariants}>
          <TokenBox tokenDetail={tokenDetail} />
        </motion.div>
      ))}
    </>
  );
}

export default memo(TokensAssetsBox);
