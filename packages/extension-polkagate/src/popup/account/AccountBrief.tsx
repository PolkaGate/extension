// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component 
 * */

import '@vaadin/icons';

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { Box, Divider, Grid, IconButton, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { subscan } from '../../assets/icons/';
import { ShortAddress } from '../../components';
import { useAccount, useChainName, useFormatted } from '../../hooks';
import { showAccount } from '../../messaging';

interface Props {
  address: string;
  identity: DeriveAccountRegistration | null | undefined

}

function AccountBrief({ address, identity }: Props): React.ReactElement<Props> {
  const formatted = useFormatted(address);
  const account = useAccount(address);
  const chainName = useChainName(address);
  const theme = useTheme();

  const _toggleVisibility = useCallback(
    (): void => {
      address && showAccount(address, account?.isHidden || false).catch(console.error);
    },
    [address, account?.isHidden]
  );

  const subscanLink = (address: string) => `https://${chainName}.subscan.io/account/${String(address)}`;

  return (
    < >
      <Grid alignItems='center' container justifyContent='center' xs={12}>
        <Typography sx={{ fontSize: '26px', fontWeight: 400, lineHeight: '50px', maxWidth: '82%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {identity?.display || account?.name}
        </Typography>
        <span>
          <IconButton
            onClick={_toggleVisibility}
            sx={{ height: '15px', m: '4px 6px 4px 10px', p: 0, width: '24px' }}
          >
            <vaadin-icon icon={account?.isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ height: '20px', color: `${theme.palette.secondary.light}` }} />
          </IconButton>

        </span>
        <Link
          href={`${subscanLink(formatted)}`}
          rel='noreferrer'
          target='_blank'
          underline='none'
        >
          <Box component='img' mt='10px' src={subscan} />
        </Link>
      </Grid>
      <ShortAddress address={formatted} charsCount={0} showCopy style={{ fontSize: '10px', fontWeight: 300 }} />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '10px' }} />
    </>
  );
}

export default React.memo(AccountBrief);