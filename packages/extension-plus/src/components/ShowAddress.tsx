// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { ContentCopyOutlined as ContentCopyOutlinedIcon } from '@mui/icons-material';
import { Avatar, Grid, Link } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import Identicon from '@polkadot/react-identicon';

import { Chain } from '../../../extension-chains/src/types';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import getLogo from '../util/getLogo';
import Identity from './Identity';
import ShortAddress from './ShortAddress';

interface Props {
  api: ApiPromise;
  address: string;
  chain: Chain;
  role?: string;
}

export default function ShowAddress({ address, api, chain, role }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chainName = chain?.name.replace(' Relay Chain', '');

  return (
    <Grid
      container
      item
      xs={12}>
      <Grid
        item
        sx={{ color: grey[600], fontSize: 11, fontWeight: '600', textAlign: 'left', pr: 1 }}
        xs={3}>
        {role}:
      </Grid>
      {address &&
        <Grid
          alignItems='center'
          container
          item
          xs={9}>
          <Grid
            alignItems='center'
            container
            item
            xs={10}
            sx={{ fontSize: 11 }}>
            <Identity
              address={address}
              api={api}
              chain={chain} />
          </Grid>
          <Grid
            item
            xs={1}>
            <Link
              href={`https://${chainName}.subscan.io/account/${address}`}
              rel='noreferrer'
              target='_blank'
              underline='none'
            >
              <Avatar
                alt={'subscan'}
                src={getLogo('subscan')}
                sx={{ height: 15, width: 15 }}
              />
            </Link>
          </Grid>
          <Grid
            item
            sx={{ textAlign: 'center' }}
            xs={1}>
            <CopyToClipboard text={address}>
              <ContentCopyOutlinedIcon
                color='primary'
                sx={{ cursor: 'pointer', fontSize: 15 }} />
            </CopyToClipboard>
          </Grid>
        </Grid>
      }
    </Grid>
  );
}
