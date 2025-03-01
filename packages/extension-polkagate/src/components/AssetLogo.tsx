// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext } from 'react';

import { sanitizeChainName } from '../util/utils';
import AssetDualLogo from './AssetDualLogo';
import ChainLogo from './ChainLogo';
import { GenesisHashOptionsContext } from './contexts';

interface Props {
  assetSize?: string;
  baseTokenSize?: string;
  chainName?: string;
  genesisHash?: string | undefined;
  logo?: string | undefined;
  subLogo: string | undefined;
}

function AssetLogo({ assetSize = '25px', baseTokenSize, chainName, genesisHash, logo, subLogo }: Props): React.ReactElement<Props> {
  const options = useContext(GenesisHashOptionsContext);

  const foundChainName = options.find((chain) => chain.value === genesisHash)?.text;
  const _chainName = sanitizeChainName(foundChainName || chainName);

  return (
    <>
      {subLogo && logo
        ? <AssetDualLogo
          asset={logo}
          assetSize={assetSize}
          baseLogo={subLogo}
          baseLogoSize={baseTokenSize}
        />
        : <ChainLogo
          chainName={_chainName}
          genesisHash={genesisHash}
          logo={logo || subLogo}
          size={Number(assetSize.replace('px', ''))}
        />
      }
    </>
  );
}

export default React.memo(AssetLogo);
