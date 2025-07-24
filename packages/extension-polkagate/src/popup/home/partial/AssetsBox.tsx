// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

import { AssetNull } from '../../../components';
import { useAccountAssets, useIsExtensionPopup, usePrices, useSelectedAccount, useSelectedChains } from '../../../hooks';
import { VelvetBox } from '../../../style';
import AssetLoading from './AssetLoading';
import AssetTabs from './AssetTabs';
import ChainsAssetsBox from './ChainsAssetsBox';
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

function AssetsBox ({ loadingItemsCount }: { loadingItemsCount?: number }): React.ReactElement {
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);
  const selectedChains = useSelectedChains();
  const pricesInCurrency = usePrices();
  const isExtension = useIsExtensionPopup();

  const [tab, setTab] = useState<TAB>();

  const isLoading = accountAssets === undefined;
  const nothingToShow = accountAssets === null;

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
      <AssetTabs setTab={setTab} tab={tab} />
      <VelvetBox style={{ margin: isExtension ? '0 15px' : 0, minHeight: '70px', padding: isExtension ? '4px' : 0 }}>
        {renderContent(loadingItemsCount)}
      </VelvetBox>
    </>
  );
}

export default AssetsBox;
