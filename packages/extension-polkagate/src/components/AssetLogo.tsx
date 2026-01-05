// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext } from 'react';

import { sanitizeChainName } from '../util';
import AssetDualLogo from './AssetDualLogo';
import ChainLogo from './ChainLogo';
import { GenesisHashOptionsContext } from './contexts';

interface Props {
  assetSize?: string;
  baseTokenSize?: string;
  chainName?: string;
  genesisHash?: string | undefined;
  logo?: string | undefined;
  subLogo?: string | undefined;
  subLogoPosition?: string;
  token?: string;
  logoRoundness?: string;
  style?: React.CSSProperties;
}

function AssetLogo ({ assetSize = '25px', baseTokenSize, chainName, genesisHash, logo, logoRoundness, style, subLogo, subLogoPosition, token }: Props): React.ReactElement<Props> {
  const options = useContext(GenesisHashOptionsContext);

  const foundChainName = options.find((chain) => chain.value === genesisHash)?.text;
  const _chainName = sanitizeChainName(foundChainName || chainName);

  return (
    <>
      {subLogo && logo
        ? (
          <AssetDualLogo
            asset={logo}
            assetSize={assetSize}
            baseLogo={subLogo}
            baseLogoPosition={subLogoPosition}
            baseLogoSize={baseTokenSize}
            logoRoundness={logoRoundness}
            style={style}
            token={token}
          />)
        : (
          <ChainLogo
            chainName={_chainName}
            genesisHash={genesisHash}
            logo={logo || subLogo}
            logoRoundness={logoRoundness}
            size={Number(assetSize.replace('px', ''))}
            style={style}
            token={token}
          />)
      }
    </>
  );
}

export default React.memo(AssetLogo);
