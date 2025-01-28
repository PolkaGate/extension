// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid } from '@mui/material';
import React, { useState } from 'react';

import AssetTabs from './AssetTabs';
import ChainsAssetsBox from './ChainsAssetsBox';
import NFTBox from './NFTBox';
import TokensAssetsBox from './TokensAssetsBox';

export enum TAB {
  CHAINS = 'chains',
  TOKENS = 'tokens',
  NFTS = 'nfts'
}

function AssetsBox (): React.ReactElement {
  const [tab, setTab] = useState<TAB>(TAB.CHAINS);

  return (
    <>
      <AssetTabs setTab={setTab} />
      <Container disableGutters sx={{ bgcolor: '#1B133C', borderRadius: '18px', mx: '15px', p: '4px', width: '100%' }}>
        {[TAB.CHAINS, TAB.TOKENS].includes(tab) &&
          <Grid container item sx={{ borderRadius: '14px', display: 'grid', maxHeight: '290px', overflowY: 'scroll', rowGap: tab === TAB.TOKENS ? '10px' : '4px', transition: 'all 250ms ease-out' }}>
            {tab === TAB.CHAINS && <ChainsAssetsBox />}
            {tab === TAB.TOKENS && <TokensAssetsBox />}
          </Grid>
        }
        {TAB.NFTS === tab && <NFTBox />}
      </Container>
    </>
  );
}

export default AssetsBox;
