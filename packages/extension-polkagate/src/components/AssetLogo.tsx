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
  subLogo?: string | undefined;
  subLogoPosition?: string;
  logoRoundness?: string;
  style?: React.CSSProperties;
}

function AssetLogo ({ assetSize = '25px', baseTokenSize, chainName, genesisHash, logo, logoRoundness, style, subLogo, subLogoPosition }: Props): React.ReactElement<Props> {
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
          baseLogoPosition={subLogoPosition}
          baseLogoSize={baseTokenSize}
          logoRoundness={logoRoundness}
          style={style}

        />
        : <ChainLogo
          chainName={_chainName}
          genesisHash={genesisHash}
          logo={logo || subLogo}
          logoRoundness={logoRoundness}
          size={Number(assetSize.replace('px', ''))}
          style={style}
        />
      }
    </>
  );
}

export default React.memo(AssetLogo);
