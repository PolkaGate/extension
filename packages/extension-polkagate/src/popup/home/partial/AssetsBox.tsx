// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, styled, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { SafeBox } from '../../../assets/icons';
import { useAccountAssets, useSelectedAccount, useTranslation } from '../../../hooks';
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

const GlowBall = styled('div')({
  background: '#CC429D',
  borderRadius: '50%',
  filter: 'blur(25px)',
  height: '32px',
  left: 0,
  opacity: 1,
  pointerEvents: 'none', // Ensures the glow doesn't interfere with interactions
  position: 'absolute',
  top: 0,
  width: '32px'
});

const AssetNull = () => {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'grid', justifyItems: 'center', py: '33px', width: '100%' }}>
      <Box
        component='img'
        src={SafeBox as string}
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
        <Grid container item sx={{ borderRadius: '14px', display: 'grid', maxHeight: '290px', overflowY: 'scroll', position: 'relative', rowGap: tab === TAB.TOKENS ? '5px' : '4px', transition: 'all 250ms ease-out', zIndex: 1 }}>
          {tab === TAB.CHAINS && <ChainsAssetsBox />}
          {tab === TAB.TOKENS && <TokensAssetsBox />}
        </Grid>
      );
    }

    return null;
  }, [isLoading, nothingToShow, tab]);

  const isLoading = accountAssets === undefined;
  const nothingToShow = accountAssets === null;

  const renderContent = useCallback(() => {
    if (TAB.NFTS === tab) {
      return <NFTBox />;
    }

    if (isLoading) {
      return <AssetLoading />;
    }

    if (nothingToShow) {
      return <AssetNull />;
    }

    if ([TAB.CHAINS, TAB.TOKENS].includes(tab)) {
      return (
        <Grid container item sx={{ borderRadius: '14px', display: 'grid', maxHeight: '290px', overflowY: 'scroll', position: 'relative', rowGap: tab === TAB.TOKENS ? '10px' : '4px', transition: 'all 250ms ease-out', zIndex: 1 }}>
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
      <Container disableGutters sx={{ bgcolor: '#1B133C', borderRadius: '18px', mx: '15px', overflow: 'hidden', p: '4px', position: 'relative', width: '100%' }}>
        {renderContent()}
        <GlowBall />
      </Container>
    </>
  );
}

export default AssetsBox;
