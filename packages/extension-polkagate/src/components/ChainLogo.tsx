// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Grid, useTheme } from '@mui/material';
import React from 'react';

import { convertToCamelCase } from '../popup/governance/utils/util';
import allChains from '../util/chains';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo from '../util/getLogo';
import { sanitizeChainName } from '../util/utils';

interface Props {
  chainName?: string;
  genesisHash?: string | undefined;
  showDefault?: boolean;
  size?: number;
}

function ChainLogo({ chainName, genesisHash, showDefault = true, size = 25 }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const foundChainName = allChains.find((chain) => chain.genesisHash === genesisHash)?.chain;
  const _chainName = sanitizeChainName(foundChainName || chainName);
  const logo = getLogo(_chainName);

  return (
    <>
      {logo
        ? <>
          {logo.startsWith('data:')
            ? <Avatar
              src={logo}
              sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(_chainName) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: size, width: size }}
              variant='square' />
            : <FontAwesomeIcon
              fontSize='15px'
              icon={fas[convertToCamelCase(logo)]}
              style={{ borderRadius: '50%', border: '0.5px solid', width:size, height:size, filter: (CHAINS_WITH_BLACK_LOGO.includes(_chainName) && theme.palette.mode === 'dark') ? 'invert(1)' : '' }}
            />
          }
        </>
        : showDefault && <Grid
          sx={{
            bgcolor: 'action.disabledBackground',
            border: '1px solid',
            borderColor: 'secondary.light',
            borderRadius: '50%',
            height: `${size + 6}px`,
            width: `${size + 6}px`
          }}
        >
        </Grid>
      }
    </>
  );
}

export default React.memo(ChainLogo);
