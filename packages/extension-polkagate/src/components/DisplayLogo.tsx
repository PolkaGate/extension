// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Grid, useTheme } from '@mui/material';
import React from 'react';

import { selectableNetworks } from '@polkadot/networks';

import { assetHub, lcDOT, LDOT, USDC, USDT } from '../assets/icons';
import { convertToCamelCase } from '../popup/governance/utils/util';
import allChains from '../util/chains';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo from '../util/getLogo';
import { sanitizeChainName } from '../util/utils';
import AssetIcon from './AssetIcon';

interface Props {
  chainName?: string;
  genesisHash?: string | undefined;
  size?: number;
  assetToken?: string | undefined;
  assetSize?: string;
  baseTokenSize?: string;
}

const SUPPORTED_TOKENS = ['DOT', 'KSM', 'ACA'];
const SUPPORTED_ETH_TOKENS = ['USDt', 'USDC'];
const SUPPORTED_ACALA_TOKENS = ['LDOT', 'lcDOT'];

function DisplayLogo({ assetSize, assetToken, baseTokenSize, chainName, genesisHash, size = 25 }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const foundChainName = allChains.find((chain) => chain.genesisHash === genesisHash)?.chain;
  const foundAsset = assetToken && SUPPORTED_TOKENS.includes(assetToken) ? selectableNetworks.find((net) => net.symbols[0] === assetToken)?.displayName : undefined;
  const _chainName = sanitizeChainName(foundChainName || chainName);
  const logo = getLogo(_chainName);
  const assetLogo = getLogo(foundAsset);

  const foundETHAsset = assetToken && SUPPORTED_ETH_TOKENS.includes(assetToken)
    ? assetToken === 'USDt'
      ? USDT as string
      : USDC as string
    : undefined;
  const foundAcalaAsset = assetToken && SUPPORTED_ACALA_TOKENS.includes(assetToken)
    ? assetToken === 'LDOT'
      ? LDOT as string
      : lcDOT as string
    : undefined;

  return (
    <>
      {logo && assetToken &&
        <AssetIcon
          asset={assetLogo ?? foundETHAsset ?? foundAcalaAsset ?? assetHub}
          assetSize={assetSize}
          baseLogo={logo}
          baseLogoSize={baseTokenSize}
        />
      }
      {!logo && assetToken &&
        <Avatar
          src={foundAcalaAsset ?? foundETHAsset ?? assetLogo}
          sx={{ borderRadius: '50%', height: size, pr: 0, width: size }}
          variant='square'
        />
      }
      {logo && !assetToken &&
        (logo.startsWith('data:')
          ? <Avatar
            src={logo}
            sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(_chainName ?? '') && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: size, pr: 0, width: size }}
            variant='square'
          />
          : <FontAwesomeIcon
            fontSize='15px'
            icon={fas[convertToCamelCase(logo)]}
            style={{ border: '0.5px solid', borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(_chainName ?? '') && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: size, width: size }}
          />)
      }
      {!logo && !assetToken &&
        <Grid
          sx={{
            bgcolor: 'action.disabledBackground',
            border: '1px solid',
            borderColor: 'secondary.light',
            borderRadius: '50%',
            height: `${size}px`,
            width: `${size}px`
          }}
        >
        </Grid>
      }
    </>
  );
}

export default React.memo(DisplayLogo);
