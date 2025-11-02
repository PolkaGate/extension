// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { lazy, memo, Suspense, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { updateStorage } from '@polkadot/extension-polkagate/src/util/storage';

import { Motion } from '../../../components';
import { useAccountAssets } from '../../../hooks';
import ActionButtons from './ActionButtons';
import TokenInfo from './TokenInfo';
import TokenSummary from './TokenSummary';

const LazyTokenHistory = lazy(() => import('../../../popup/tokens/partial/TokenHistory'));

function RightColumn (): React.ReactElement {
  const { address, genesisHash, paramAssetId } = useParams<{ address: string; genesisHash: string; paramAssetId: string }>();
  const accountAssets = useAccountAssets(address);

  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowHistory(true), 0); // defer to next tick

    return () => clearTimeout(timeout);
  }, []);

  const token = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === paramAssetId)
  , [accountAssets, genesisHash, paramAssetId]);

  useEffect(() => {
    address && genesisHash && updateStorage(STORAGE_KEY.ACCOUNT_SELECTED_CHAIN, { [address]: genesisHash }).catch(console.error);
  }, [address, genesisHash]);

  return (
    <Motion style={{ display: 'block', height: '100%', overflow: 'hidden', position: 'relative', width: ' 523px' }} variant='fade'>
      <TokenSummary
        address={address}
        token={token}
      />
      <ActionButtons
        address={address}
        assetId={paramAssetId}
        genesisHash={genesisHash}
      />
      <TokenInfo
        address={address}
        genesisHash={genesisHash}
        token={token}
      />
      {showHistory && (
        <Suspense fallback={null}>
          <LazyTokenHistory
            address={address}
            decimal={token?.decimal}
            genesisHash={genesisHash}
            token={token?.token}
          />
        </Suspense>
      )}
    </Motion>
  );
}

export default memo(RightColumn);
