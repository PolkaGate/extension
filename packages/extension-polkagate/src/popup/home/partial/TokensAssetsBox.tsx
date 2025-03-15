// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';
import type { FetchedBalance } from '../../../hooks/useAssetsBalances';
import type { Prices } from '../../../util/types';

import { Badge, Collapse, Container, Divider, Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { CloseCircle } from 'iconsax-react';
import React, { memo, useCallback, useContext, useMemo, useState } from 'react';

import { selectableNetworks } from '@polkadot/networks';
import { BN_ZERO } from '@polkadot/util';

import { ActionContext, AssetLogo, FormatBalance2, FormatPrice } from '../../../components';
import { useIsDark, usePrices } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import getLogo2, { type LogoInfo } from '../../../util/getLogo2';
import DailyChange from './DailyChange';

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

export const Drawer = ({ length }: { length: number }) => {
  const theme = useTheme();
  const colorD1 = theme.palette.mode === 'dark' ? '#24234DCC' : '#CFD5F0';
  const colorD2 = theme.palette.mode === 'dark' ? '#26255773' : '#DFE4FA';

  return (
    <Container disableGutters sx={{ display: 'flex', height: length === 0 ? 0 : length > 1 ? '18px' : '9px', justifyContent: 'center', overflow: 'hidden', position: 'relative', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '100%' }}>
      <div style={{ background: colorD1, borderRadius: '14px', height: length ? '50px' : 0, position: 'absolute', top: '-41px', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '300px', zIndex: 1 }} />
      <div style={{ background: colorD2, borderRadius: '14px', bottom: 0, height: length > 1 ? '50px' : 0, position: 'absolute', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '275px' }} />
    </Container>
  );
};

export function TokenPriceInfo ({ priceId, token }: { priceId?: string, token?: string }) {
  const pricesInCurrency = usePrices();
  const isDark = useIsDark();

  return (
    <Grid container direction='column' item sx={{ width: 'fit-content' }}>
      <Typography color='text.primary' textAlign='left' variant='B-2'>
        {token}
      </Typography>
      <Grid alignItems='center' container item sx={{ columnGap: '5px', lineHeight: '10px', width: 'fit-content' }}>
        <FormatPrice
          commify
          fontFamily='Inter'
          fontSize='12px'
          fontWeight={500}
          ignoreHide
          num={pricesInCurrency?.prices[priceId ?? '']?.value ?? 0}
          skeletonHeight={14}
          textColor={isDark ? '#AA83DC' : '#8299BD'}
          width='fit-content'
        />
        {priceId && pricesInCurrency?.prices[priceId]?.change &&
          <DailyChange
            change={pricesInCurrency.prices[priceId].change}
            iconSize={12}
            showHours={false}
            showPercentage
            textVariant='B-4'
          />
        }
      </Grid>
    </Grid>
  );
}

export function TokenBalanceDisplay ({ decimal = 0, token = '', totalBalanceBN, totalBalancePrice }: { decimal?: number, totalBalanceBN: BN, totalBalancePrice: number, token?: string }) {
  const theme = useTheme();
  const balanceColor = theme.palette.mode === 'dark' ? '#BEAAD8' : '#291443';
  const priceColor = theme.palette.mode === 'dark' ? '#BEAAD8' : '#8F97B8';

  return (
    <Grid alignItems='flex-end' container direction='column' item sx={{ '> div.balance': { color: priceColor, ...theme.typography['S-2'] }, rowGap: '6px', width: 'fit-content' }}>
      <FormatPrice
        commify
        decimalColor={theme.palette.text.secondary}
        fontFamily='Inter'
        fontSize='14px'
        fontWeight={600}
        num={totalBalancePrice}
        skeletonHeight={14}
        width='fit-content'
      />
      <FormatBalance2
        decimalPoint={2}
        decimals={[decimal]}
        style={{
          color: balanceColor,
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '10px'
        }}
        tokens={[token]}
        value={totalBalanceBN}
      />
    </Grid>
  );
}

function TokensItems ({ tokenDetail }: { tokenDetail: FetchedBalance }) {
  const theme = useTheme();
  const bgcolor = theme.palette.mode === 'dark' ? '#2D1E4A' : '#CCD2EA59';

  const onAction = useContext(ActionContext);
  const pricesInCurrency = usePrices();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);
  const formatCamelCaseText = useCallback((input: string) => {
    return input
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before uppercase letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  }, []);

  const logoInfo = getLogo2(tokenDetail.genesisHash, tokenDetail.token);
  const balancePrice = calcPrice(priceOf(tokenDetail.priceId), tokenDetail.totalBalance, tokenDetail.decimal);

  const onTokenClick = useCallback(() => {
    onAction(`token/${tokenDetail.genesisHash}/${tokenDetail.assetId}`);
  }, [tokenDetail.assetId, tokenDetail.genesisHash, onAction]);

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
            {formatCamelCaseText(tokenDetail.chainName)}
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

function TokenBox ({ tokenDetail }: { tokenDetail: AssetDetailType }) {
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
      <Grid container item onClick={toggleExpand} sx={{ background: bgColor, borderRadius: '14px', cursor: 'pointer', p: '12px 10px' }}>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex' }}>
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
                <AssetLogo assetSize='36px' baseTokenSize='16px' genesisHash={tokenDetail.genesisHash} logo={tokenDetail.logoInfo?.logo ?? tokenDetail.logoInfo?.subLogo} subLogo={undefined} />
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
                <>
                  <TokensItems
                    key={index}
                    tokenDetail={token}
                  />
                  {showDivider && <Divider sx={{ bgcolor: dividerColor, height: '1px', width: '100%' }} />}
                </>
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

function TokensAssetsBox ({ accountAssets, pricesInCurrency, selectedChains }: { accountAssets: FetchedBalance[]; selectedChains: string[]; pricesInCurrency: Prices; }) {
  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const tokens: Assets = useMemo(() => {
    if (!selectedChains) {
      return undefined;
    }

    if (accountAssets) {
      if (accountAssets.length === 0) {
        return null;
      }

      // filter non selected chains
      const filteredUnselected = accountAssets.filter(({ genesisHash }) => selectedChains.includes(genesisHash));

      // filter non zero chains
      const filteredNonZero = filteredUnselected.filter(({ totalBalance }) => !totalBalance.isZero());

      return filteredNonZero.reduce<Record<string, FetchedBalance[]>>((acc, balance) => {
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

      const network = selectableNetworks.find(({ displayName, symbols }) => {
        const isExcluded = /Asset Hub|People/.test(displayName);
        const matchesToken = symbols[0]?.toLowerCase() === token.toLowerCase();

        return !isExcluded && matchesToken;
      });
      const priceId = assets[0].priceId;

      const sortedAssets = assets.sort((a, b) => {
        const totalPriceA = calcPrice(priceOf(a.priceId), a.totalBalance, a.decimal);
        const totalPriceB = calcPrice(priceOf(b.priceId), b.totalBalance, b.decimal);

        return totalPriceB - totalPriceA;
      });

      let genesisHash: string | undefined;
      let logoInfo: LogoInfo | undefined;
      let decimal: number | undefined;

      if (network) {
        genesisHash = network?.genesisHash[0].toString();
        logoInfo = getLogo2(network?.genesisHash.toString(), token);
        decimal = network?.decimals[0];
      } else {
        const network = assets.find(({ token: tokenNetwork }) => tokenNetwork.toLowerCase() === token.toLowerCase());

        genesisHash = network?.genesisHash.toString();
        logoInfo = getLogo2(genesisHash, token);
        decimal = network?.decimal;
      }

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
