// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { Prices } from '../../../util/types';

import { Divider, Grid, type Theme, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AssetLogo, ChainLogo, FormatPrice } from '../../../components';
import { useAllChains, useIsExtensionPopup, useSelectedAccount } from '../../../hooks';
import getLogo2 from '../../../util/getLogo2';
import { type AssetDetailType, buildChainsAssetsSummary } from '../../helpers/buildChainsAssetsSummary';
import { TokenBalanceDisplay } from './TokenBalanceDisplay';
import { TokenPriceInfo } from './TokenPriceInfo';

type Assets = Record<string, FetchedBalance[]> | null | undefined;

type Summary = AssetDetailType[] | null | undefined;

interface ChainHeaderProps {
  chainName: string | undefined;
  chainTotalBalance: number;
  genesisHash: string;
  theme: Theme;
  token: string | undefined;
}

function ChainHeader({ chainName, chainTotalBalance, genesisHash, theme, token }: ChainHeaderProps) {
  return (
    <Grid alignItems='center' container item justifyContent='space-between'>
      <Grid alignItems='center' container item sx={{ bgcolor: 'secondary.contrastText', borderRadius: '9px', columnGap: '4px', p: '2px 3px', pr: '4px', width: 'fit-content' }}>
        <ChainLogo genesisHash={genesisHash} showSquare size={18} token={token} />
        <Typography color='text.secondary' variant='B-2'>
          {chainName}
        </Typography>
      </Grid>
      <Grid container item sx={{ bgcolor: 'secondary.contrastText', borderRadius: '9px', columnGap: '4px', p: '4px', width: 'fit-content' }}>
        <FormatPrice
          commify
          fontFamily='Inter'
          fontSize='12px'
          fontWeight={500}
          num={chainTotalBalance}
          skeletonHeight={14}
          textColor={theme.palette.secondary.light}
          width='fit-content'
        />
      </Grid>
    </Grid>
  );
}

const MemoizedChainHeader = memo(ChainHeader);

interface AssetDetailProps {
  address: string | undefined;
  asset: FetchedBalance & { totalPrice: number; };
  isExtension: boolean;
  theme: Theme;
}

function AssetsDetail({ address, asset, isExtension, theme }: AssetDetailProps) {
  const navigate = useNavigate();
  const params = useParams<{ address: string, genesisHash: string, paramAssetId: string }>();

  const isSelected = useMemo(() => params?.genesisHash === asset.genesisHash && params?.paramAssetId === String(asset.assetId), [asset.assetId, asset.genesisHash, params]);

  const onHoverColor = theme.palette.mode === 'dark' ? '#1B133C' : '#f4f7ff';
  const logoInfo = getLogo2(asset.genesisHash, asset.token);

  const onTokenClick = useCallback(() => {
    isExtension
      ? navigate(`token/${asset.genesisHash}/${asset.assetId}`) as void
      : address && navigate(`/accountfs/${address}/${asset.genesisHash}/${asset.assetId}`) as void;
  }, [address, asset.assetId, asset.genesisHash, isExtension, navigate]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' onClick={onTokenClick} sx={{ ':hover': { background: onHoverColor, px: '8px' }, background: isSelected ? onHoverColor : undefined, borderRadius: '12px', cursor: 'pointer', px: isSelected ? '8px' : undefined, py: '4px', transition: 'all 250ms ease-out' }}>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
        <AssetLogo assetSize='36px' baseTokenSize='16px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} token={asset.token} />
        <TokenPriceInfo
          priceId={asset.priceId}
          token={asset.token}
        />
      </Grid>
      <TokenBalanceDisplay
        decimal={asset.decimal}
        token={asset.token}
        totalBalanceBN={asset.totalBalance}
        totalBalancePrice={asset.totalPrice}
      />
    </Grid>
  );
}

const MemoizedAssetsDetail = memo(AssetsDetail);

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' }, y: 0 }
};

const gridStyle = { display: 'grid', rowGap: '6px', width: 'inherit' };

function ChainsAssetsBox({ accountAssets, pricesInCurrency, selectedChains }: { accountAssets: FetchedBalance[]; selectedChains: string[]; pricesInCurrency: Prices; }) {
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();
  const allChains = useAllChains();
  const address = useSelectedAccount()?.address;

  const assets: Assets = useMemo(() => {
    if (!accountAssets) {
      return accountAssets;
    }

    if (accountAssets.length === 0) {
      return null;
    }

    return accountAssets
      .filter(({ genesisHash, totalBalance }) =>
        selectedChains.includes(genesisHash) && !totalBalance.isZero()
      )
      .reduce<Record<string, FetchedBalance[]>>((acc, balance) => {
        (acc[balance.genesisHash] ||= []).push(balance);

        return acc;
      }, {});
  }, [accountAssets, selectedChains]);

  const summary: Summary = useMemo(() =>
    buildChainsAssetsSummary(allChains, assets, pricesInCurrency)
    , [allChains, assets, pricesInCurrency]);

  return (
    <>
      {summary?.map(({ assets, chainName, chainTotalBalance, genesisHash, token }) => (
        <motion.div key={genesisHash} variants={itemVariants}>
          <Grid container item sx={{ background: theme.palette.background.paper, borderRadius: '14px', p: '10px', rowGap: '6px' }}>
            <MemoizedChainHeader
              chainName={chainName}
              chainTotalBalance={chainTotalBalance}
              genesisHash={genesisHash}
              theme={theme}
              token={token}
            />
            {assets.map((asset, index) => {
              const showDivider = assets.length !== index + 1;

              return (
                <motion.div key={`${asset.genesisHash}-${asset.assetId}`} style={gridStyle} variants={itemVariants}>
                  <MemoizedAssetsDetail
                    address={address}
                    asset={asset}
                    isExtension={isExtension}
                    theme={theme}
                  />
                  {
                    showDivider &&
                    <Divider sx={{ bgcolor: '#1B133C', height: '1px', mx: '-10px' }} />
                  }
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
