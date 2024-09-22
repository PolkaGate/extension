// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, useTheme } from '@mui/material';
import React from 'react';

import { UseUserAddedChainColor } from '../fullscreen/addNewChain/utils';
import { convertToCamelCase } from '../fullscreen/governance/utils/util';
import { useGenesisHashOptions } from '../hooks';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo2 from '../util/getLogo2';
import { sanitizeChainName } from '../util/utils';

interface Props {
  chainName?: string;
  genesisHash?: string | undefined;
  logo?: string;
  size?: number;
}

function ChainLogo ({ chainName, genesisHash, logo, size = 25 }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const mayBeUserAddedChainColor = UseUserAddedChainColor(genesisHash);
  const options = useGenesisHashOptions();

  const foundChainName = options.find(({ text, value }) => value === genesisHash || text === chainName)?.text;
  const _chainName = sanitizeChainName(foundChainName || chainName);
  const _logo = logo || getLogo2(_chainName)?.logo;
  const filter = (CHAINS_WITH_BLACK_LOGO.includes(_chainName || '') && theme.palette.mode === 'dark') ? 'invert(1)' : '';

  return (
    <>
      {_logo
        ? <>
          {_logo.startsWith('data:')
            ? <Avatar
              src={_logo}
              sx={{
                borderRadius: '50%',
                filter,
                height: size,
                width: size
              }}
              variant='square'
            />
            : <FontAwesomeIcon
              fontSize='15px'
              icon={fas[convertToCamelCase(_logo)]}
              style={{
                border: '0.5px solid',
                borderRadius: '50%',
                filter,
                height: size,
                width: size
              }}
            />
          }
        </>
        : <Avatar
          sx={{
            bgcolor: mayBeUserAddedChainColor,
            borderRadius: '50%',
            fontSize: size * 0.7,
            height: size,
            width: size
          }}
          variant='square'
        >
          {_chainName?.charAt(0)?.toUpperCase() || ''}
        </Avatar>
      }
    </>
  );
}

export default React.memo(ChainLogo);
