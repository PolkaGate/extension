// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { calcPrice } from '@polkadot/extension-polkagate/src/util';

import { AssetNull } from '../../../components';
import { useAccountAssets, useIsExtensionPopup, usePrices, useSelectedAccount, useSelectedChains } from '../../../hooks';
import { VelvetBox } from '../../../style';
import AssetLoading from './AssetLoading';
import AssetTabs from './AssetTabs';
import ChainsAssetsBox from './ChainsAssetsBox';
import ManageNetworks from './ManageNetworks';
import NFTBox from './NFTBox';
import TokensAssetsBox from './TokensAssetsBox';

export enum TAB {
  CHAINS = 'chains',
  TOKENS = 'tokens',
  NFTS = 'nfts'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 } // Delay between items
  }
};

function AssetsBox({ loadingItemsCount }: { loadingItemsCount?: number }): React.ReactElement {
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);
  const selectedChains = useSelectedChains();
  const pricesInCurrency = usePrices();
  const isExtension = useIsExtensionPopup();
  const { address, genesisHash, paramAssetId } = useParams<{ address: string, genesisHash: string, paramAssetId: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TAB>();

  const isLoading = accountAssets === undefined;
  const nothingToShow = accountAssets === null;

  useEffect(() => {
    // Handle navigation logic specific to the fullscreen account view
    if (!paramAssetId || !accountAssets?.length || !address) {
      return;
    }

    const exactMatch = accountAssets.find((a) => a.assetId.toString() === paramAssetId && a.genesisHash === genesisHash);

    if (exactMatch) {
      return;
    }

    const sameIdAsset = accountAssets.find((a) => a.assetId.toString() === paramAssetId);

    if (sameIdAsset) {
      return navigate(`/accountfs/${address}/${sameIdAsset.genesisHash}/${paramAssetId}`) as void;
    }

    // Fallback: find asset with maximum value
    const prices = pricesInCurrency?.prices;
    const init = {
      asset: accountAssets[0],
      worth: calcPrice(prices?.[accountAssets[0].priceId]?.value ?? 0, accountAssets[0].totalBalance, accountAssets[0].decimal)
    };

    const maxValueAsset = accountAssets.reduce((max, asset) => {
      const price = prices?.[asset.priceId]?.value ?? 0;
      const worth = calcPrice(price, asset.totalBalance, asset.decimal);

      return worth > max.worth
        ? {
          asset,
          worth
        }
        : max;
    }, init);

    navigate(`/accountfs/${address}/${maxValueAsset.asset.genesisHash}/${maxValueAsset.asset.assetId}`) as void;
  }, [accountAssets, address, genesisHash, navigate, paramAssetId, pricesInCurrency?.prices]);

  useEffect(() => {
    tab
      ? window.localStorage.setItem('HomeTab', tab)
      : setTab(window.localStorage.getItem('HomeTab') as TAB ?? TAB.TOKENS);
  }, [tab]);

  const renderContent = useCallback((loadingItemsCount?: number) => {
    if (TAB.NFTS === tab) {
      return <NFTBox />;
    }

    if (isLoading || !tab || !account || !selectedChains || !pricesInCurrency) {
      return <AssetLoading itemsCount={loadingItemsCount} />;
    }

    if (nothingToShow) {
      return <AssetNull />;
    }

    if ([TAB.CHAINS, TAB.TOKENS].includes(tab)) {
      return (
        <motion.div
          animate='visible'
          initial='hidden'
          variants={containerVariants}
        >
          <Grid container item sx={{ borderRadius: '14px', display: 'grid', position: 'relative', rowGap: tab === TAB.TOKENS ? '5px' : '4px', zIndex: 1 }}>
            {tab === TAB.CHAINS &&
              <ChainsAssetsBox
                accountAssets={accountAssets}
                pricesInCurrency={pricesInCurrency}
                selectedChains={selectedChains}
              />
            }
            {tab === TAB.TOKENS &&
              <TokensAssetsBox
                accountAssets={accountAssets}
                pricesInCurrency={pricesInCurrency}
                selectedChains={selectedChains}
              />}
          </Grid>
        </motion.div>
      );
    }

    return <AssetLoading />;
  }, [account, accountAssets, isLoading, nothingToShow, pricesInCurrency, selectedChains, tab]);

  return (
    <>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ width: isExtension ? '90%' : '96%' }}>
        <AssetTabs setTab={setTab} tab={tab} />
        <ManageNetworks />
      </Stack>
      <VelvetBox style={{ margin: isExtension ? '0 15px' : 0, minHeight: '70px', padding: isExtension ? '4px' : 0 }}>
        {renderContent(loadingItemsCount)}
      </VelvetBox>
    </>
  );
}

export default AssetsBox;
