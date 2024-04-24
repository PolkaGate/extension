// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Grid, useTheme } from '@mui/material';
import React from 'react';

import { convertToCamelCase } from '../fullscreen/governance/utils/util';
import allChains from '../util/chains';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import { sanitizeChainName } from '../util/utils';
import AssetIcon from './AssetIcon';

interface Props {
  chainName?: string;
  genesisHash?: string | undefined;
  logo?: string | undefined;
  assetSize?: string;
  baseTokenSize?: string;
  subLogo: string | undefined;
}

function DisplayLogo({ assetSize = '25px', baseTokenSize, chainName, genesisHash, logo, subLogo }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const foundChainName = allChains.find((chain) => chain.genesisHash === genesisHash)?.chain;
  const _chainName = sanitizeChainName(foundChainName || chainName);

  return (
    <>
      {subLogo && logo &&
        <AssetIcon
          asset={logo}
          assetSize={assetSize}
          baseLogo={subLogo}
          baseLogoSize={baseTokenSize}
        />
      }
      {!subLogo && logo &&
        <Avatar
          src={logo}
          sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(_chainName || '') && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: assetSize, pr: 0, width: assetSize }}
          variant='square'
        />
      }
      {subLogo && !logo &&
        (subLogo.startsWith('data:')
          ? <Avatar
            src={subLogo}
            sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(_chainName ?? '') && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: assetSize, pr: 0, width: assetSize }}
            variant='square'
          />
          : <FontAwesomeIcon
            fontSize='15px'
            icon={fas[convertToCamelCase(subLogo)]}
            style={{ border: '0.5px solid', borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(_chainName ?? '') && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: assetSize, width: assetSize }}
          />)
      }
      {!subLogo && !logo &&
        <Grid
          sx={{
            bgcolor: 'action.disabledBackground',
            border: '1px solid',
            borderColor: 'secondary.light',
            borderRadius: '50%',
            height: assetSize,
            width: assetSize
          }}
        >
        </Grid>
      }
    </>
  );
}

export default React.memo(DisplayLogo);
