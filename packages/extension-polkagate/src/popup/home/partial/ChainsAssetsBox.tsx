// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '../../../hooks/useAssetsBalances';
import type { Prices } from '../../../util/types';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { selectableNetworks } from '@polkadot/networks';

import { AssetLogo, FormatPrice } from '../../../components';
import { useIsExtensionPopup, usePrices, useSelectedAccount } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import getLogo2, { type LogoInfo } from '../../../util/getLogo2';
import { TokenBalanceDisplay, TokenPriceInfo } from './TokensAssetsBox';

type Assets = Record<string, FetchedBalance[]> | null | undefined;
interface AssetDetailType {
  assets: FetchedBalance[];
  chainTotalBalance: number;
  chainName: string | undefined;
  genesisHash: string;
  logoInfo: LogoInfo | undefined;
  token: string | undefined;
}
type Summary = AssetDetailType[] | null | undefined;

function AssetsHeader ({ assetsDetail }: { assetsDetail: AssetDetailType }) {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container item justifyContent='space-between'>
      <Grid alignItems='center' container item sx={{ bgcolor: 'secondary.contrastText', borderRadius: '9px', columnGap: '4px', p: '2px 3px', pr: '4px', width: 'fit-content' }}>
        <AssetLogo assetSize='18px' baseTokenSize='16px' genesisHash={assetsDetail.genesisHash} logo={assetsDetail?.logoInfo?.logoSquare} logoRoundness='6px' subLogo={undefined} />
        <Typography color='text.secondary' variant='B-2'>
          {assetsDetail.chainName}
        </Typography>
      </Grid>
      <Grid container item sx={{ bgcolor: 'secondary.contrastText', borderRadius: '9px', columnGap: '4px', p: '4px', width: 'fit-content' }}>
        <FormatPrice
          commify
          fontFamily='Inter'
          fontSize='12px'
          fontWeight={500}
          num={assetsDetail.chainTotalBalance}
          skeletonHeight={14}
          textColor={theme.palette.secondary.light}
          width='fit-content'
        />
      </Grid>
    </Grid>
  );
}

function AssetsDetail ({ asset }: { asset: FetchedBalance }) {
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();
  const navigate = useNavigate();
  const account = useSelectedAccount();

  const pricesInCurrency = usePrices();
  const onHoverColor = theme.palette.mode === 'dark' ? '#1B133C' : '#f4f7ff';
  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const logoInfo = getLogo2(asset.genesisHash, asset.token);
  const balancePrice = calcPrice(priceOf(asset.priceId), asset.totalBalance, asset.decimal);

  const onTokenClick = useCallback(() => {
    isExtension
      ? navigate(`token/${asset.genesisHash}/${asset.assetId}`)
      : account?.address && navigate(`/accountfs/${account.address}/${asset.genesisHash}/${asset.assetId}`);
  }, [account?.address, asset.assetId, asset.genesisHash, isExtension, navigate]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' onClick={onTokenClick} sx={{ ':hover': { background: onHoverColor, px: '8px' }, borderRadius: '12px', cursor: 'pointer', py: '4px', transition: 'all 250ms ease-out' }}>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
        <AssetLogo assetSize='36px' baseTokenSize='16px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
        <TokenPriceInfo
          priceId={asset.priceId}
          token={asset.token}
        />
      </Grid>
      <TokenBalanceDisplay
        decimal={asset.decimal}
        token={asset.token}
        totalBalanceBN={asset.totalBalance}
        totalBalancePrice={balancePrice}
      />
    </Grid>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' }, y: 0 }
};

function ChainsAssetsBox ({ accountAssets, pricesInCurrency, selectedChains }: { accountAssets: FetchedBalance[]; selectedChains: string[]; pricesInCurrency: Prices; }) {
  const theme = useTheme();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const assets: Assets = useMemo(() => {
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
        const { genesisHash } = balance;

        // Initialize the array for the genesisHash if it doesn't exist
        if (!acc[genesisHash]) {
          acc[genesisHash] = [];
        }

        // Push the current balance item to the respective array
        acc[genesisHash].push(balance);

        return acc;
      }, {});
    } else {
      return accountAssets;
    }
  }, [accountAssets, selectedChains]);

  const summary: Summary = useMemo(() => {
    if (!assets) {
      return assets;
    }

    return Object.entries(assets).map(([genesisHash, balances]) => {
      const chainTotalBalance = balances.reduce((sum, balance) => {
        const totalPrice = calcPrice(priceOf(balance.priceId), balance.totalBalance, balance.decimal);

        return sum + totalPrice;
      }, 0);

      const sortedAssets = balances.sort((a, b) => {
        const totalPriceA = calcPrice(priceOf(a.priceId), a.totalBalance, a.decimal);
        const totalPriceB = calcPrice(priceOf(b.priceId), b.totalBalance, b.decimal);

        return totalPriceB - totalPriceA;
      });
      const network = selectableNetworks.find(({ genesisHash: networkGenesisHash, symbols }) => genesisHash === networkGenesisHash[0] && symbols.length);
      const token = network?.symbols[0];
      const logoInfo = getLogo2(genesisHash, token);
      const chainName = network?.displayName;

      return {
        assets: sortedAssets,
        chainName,
        chainTotalBalance,
        genesisHash,
        logoInfo,
        token
      };
    })
      .sort((a, b) => b.chainTotalBalance - a.chainTotalBalance);
  }, [assets, priceOf]);

  return (
    <>
      {summary?.map((assetsDetail, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Grid container item sx={{ background: theme.palette.background.paper, borderRadius: '14px', p: '10px', rowGap: '6px' }}>
            <AssetsHeader assetsDetail={assetsDetail} />
            {assetsDetail.assets.map((asset, index) => {
              const showDivider = assetsDetail.assets.length !== index + 1;

              return (
                <motion.div key={index} style={{ display: 'grid', rowGap: '6px', width: 'inherit' }} variants={itemVariants}>
                  <AssetsDetail asset={asset} />
                  {showDivider && <Divider sx={{ bgcolor: '#1B133C', height: '1px', ml: '-10px', width: '325px' }} />}
                </motion.div>
              );
            })}
          </Grid>
        </motion.div>
      ))}
    </>
  );
}

export default memo(ChainsAssetsBox);
