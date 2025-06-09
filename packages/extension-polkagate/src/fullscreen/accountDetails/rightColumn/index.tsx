// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { updateStorage } from '@polkadot/extension-polkagate/src/util/storage';

import { Motion } from '../../../components';
import { useAccountAssets } from '../../../hooks';
import TokenHistory from '../../../popup/tokens/partial/TokenHistory';
import ActionButtons from './ActionButtons';
import TokenInfo from './TokenInfo';
import TokenSummary from './TokenSummary';

function RightColumn (): React.ReactElement {
  const { address, genesisHash, paramAssetId } = useParams<{ address: string; genesisHash: string; paramAssetId: string }>();
  const accountAssets = useAccountAssets(address);

  const token = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === paramAssetId)
  , [accountAssets, genesisHash, paramAssetId]);

  useEffect(() => {
    address && genesisHash && updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [address]: genesisHash }).catch(console.error);
  }, [address, genesisHash]);

  return (
    <Motion style={{ display: 'block', height: '100%', overflow: 'hidden', position: 'relative', width: ' 523px' }} variant='flip'>
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
      <TokenHistory
        address={address}
        decimal={token?.decimal}
        genesisHash={genesisHash}
        token={token?.token}
      />
    </Motion>
  );
}

export default memo(RightColumn);
