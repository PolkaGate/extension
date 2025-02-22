// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { safeBox, safeBoxLight } from '../../../assets/icons';
import { useAccountAssets, useIsDark, useSelectedAccount, useTranslation } from '../../../hooks';
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

const AssetNull = () => {
  const { t } = useTranslation();
  const isDark = useIsDark();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'grid', justifyItems: 'center', py: '33px', width: '100%' }}>
      <Box
        component='img'
        src={(isDark ? safeBox : safeBoxLight) as string}
        sx={{ width: '135px' }}
      />
      <Typography pt='10px' variant='B-2'>
        {t("You don't have any tokens yet")}
      </Typography>
    </Container>
  );
};

function AssetsBox (): React.ReactElement {
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);

  const [tab, setTab] = useState<TAB>();

  const isLoading = accountAssets === undefined;
  const nothingToShow = accountAssets === null;

  useEffect(() => {
    if (tab) {
      window.localStorage.setItem('HomeTab', tab);
    } else {
      setTab(window.localStorage.getItem('HomeTab') as TAB ?? TAB.CHAINS);
    }
  }, [tab]);

  const renderContent = useCallback(() => {
    if (TAB.NFTS === tab) {
      return <NFTBox />;
    }

    if (isLoading || !tab) {
      return <AssetLoading />;
    }

    if (nothingToShow) {
      return <AssetNull />;
    }

    if ([TAB.CHAINS, TAB.TOKENS].includes(tab)) {
      return (
        <Grid container item sx={{ borderRadius: '14px', display: 'grid', maxHeight: '320px', overflowY: 'scroll', position: 'relative', rowGap: tab === TAB.TOKENS ? '5px' : '4px', transition: 'all 250ms ease-out', zIndex: 1 }}>
          {tab === TAB.CHAINS && <ChainsAssetsBox />}
          {tab === TAB.TOKENS && <TokensAssetsBox />}
        </Grid>
      );
    }

    return null;
  }, [isLoading, nothingToShow, tab]);

  return (
    <>
      <AssetTabs setTab={setTab} tab={tab} />
      <VelvetBox style={{ mx: '15px' }}>
        {renderContent()}
      </VelvetBox>
    </>
  );
}

export default AssetsBox;
