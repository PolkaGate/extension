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

import { Box, Divider, Grid, Link, Typography } from '@mui/material';
import React from 'react';

import { subscan } from '../../assets/icons/';
import { ShortAddress } from '../../components';
import { useAccount, useChainName, useFormatted } from '../../hooks';

interface Props {
  address: string;
  identity: DeriveAccountRegistration | null | undefined

}

function AccountBrief({ address, identity }: Props): React.ReactElement<Props> {
  const formatted = useFormatted(address);
  const account = useAccount(address);
  const chainName = useChainName(address);

  const subscanLink = (address: string) => `https://${chainName}.subscan.io/account/${String(address)}`;

  return (
    < >
      <Grid alignItems='center' container justifyContent='center' xs={12}>
        <Typography sx={{ fontSize: '36px', fontWeight: 400, lineHeight: '33px', mt: '10px', maxWidth: '92%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {identity?.display || account?.name}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='center'>
        <Grid item>
          <ShortAddress address={formatted} charsCount={20} showCopy style={{ fontSize: '10px', fontWeight: 300 }} />
        </Grid>
        <Grid item>
          <Link
            href={`${subscanLink(formatted)}`}
            rel='noreferrer'
            target='_blank'
            underline='none'
          >
            <Box alt={'subscan'} component='img' height='20px' mt='5px' src={subscan} width='20px' />
          </Link>
        </Grid>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '10px' }} />
    </>
  );
}

export default React.memo(AccountBrief);