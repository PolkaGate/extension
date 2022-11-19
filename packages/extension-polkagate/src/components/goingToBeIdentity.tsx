// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Email as EmailIcon, LaunchRounded as LaunchRoundedIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { Grid, Link, SxProps, Theme } from '@mui/material';
import React, { useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { useAccountName, useChain, useFormatted, useIdentity, useTranslation } from '../hooks';
import { getSubstrateAddress } from '../util/utils';
import { ChainLogo, Identicon, ShortAddress } from '.';
import { grey } from '@mui/material/colors';

interface Props {
  address?: string;
  api: ApiPromise | undefined;
  formatted?: string;
  name?: string;
  style?: SxProps<Theme>;
  showChainLogo?: boolean;
  identiconSize?: number;
  chain?: Chain;
  showShortAddress?: boolean;
}

function Identity({ address, api, chain, formatted, identiconSize = 40, name, showChainLogo = false, showSocial = true, showShortAddress, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(formatted ? getSubstrateAddress(formatted) : address);
  const _chain = useChain(address, chain);
  const _formatted = useFormatted(address, formatted);
  const identity = useIdentity(api, _formatted);
  const [judgement, setJudgement] = useState<string | undefined | null>();
  const hasSocial = !!(identity?.identity?.twitter || identity?.identity?.web || identity?.identity?.email);

  return (
    <Grid alignItems='center' container justifyContent='space-between' sx={{ ...style }} >
      <Grid alignItems='center' container item xs={showChainLogo ? 11 : 12}>
        <Grid item pr='8px' sx={1}>
          <Identicon
            iconTheme={_chain?.icon ?? 'polkadot'}
            prefix={_chain?.ss58Format ?? 42}
            size={identiconSize}
            value={_formatted}
          />
        </Grid>
        <Grid item container xs sx={{ fontSize: style?.fontSize ?? '28px', fontWeight: 400, letterSpacing: '-1.5%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {identity?.identity?.displayParent &&
            <Grid item sx={{ textOverflow: 'ellipsis' }}>
              {identity?.identity.displayParent} /
            </Grid>
          }
          {(identity?.identity?.display || identity?.nickname) &&
            <Grid item sx={identity?.identity?.displayParent && { color: grey[500], textOverflow: 'ellipsis' }}>
              {identity?.identity?.display ?? identity?.nickname}
            </Grid>
          }
          {!(identity?.identity?.displayParent || identity?.identity?.display || identity?.nickname) && (name || accountName) &&
            <Grid item sx={identity?.identity?.displayParent && { color: grey[500], textOverflow: 'ellipsis' }}>
              {name || accountName}
            </Grid>
          }
          {!(identity?.identity?.displayParent || identity?.identity?.display || identity?.nickname || name || accountName) &&
            <Grid item sx={{ textAlign: 'letf' }}>
              {identity?.accountId && showShortAddress
                ? <ShortAddress address={String(identity?.accountId)} fontSize={11} />
                : t('Unknown')
              }
            </Grid>
          }
        </Grid>
        {showSocial && 
        <Grid container item id='socials' item justifyContent='flex-start' xs={hasSocial ? 3 : 0}>
          {identity?.identity?.email &&
            <Grid item>
              <Link href={`mailto:${identity?.identity.email}`}>
                <EmailIcon
                  color='#1E5AEF'
                  sx={{ fontSize: 15 }}
                />
              </Link>
            </Grid>
          }
          {identity?.identity?.web &&
            <Grid item>
              <Link
                href={identity?.identity.web}
                rel='noreferrer'
                target='_blank'
              >
                <LaunchRoundedIcon
                  color='#007CC4'
                  sx={{ fontSize: 15 }}
                />
              </Link>
            </Grid>
          }
           {identity?.identity?.twitter &&
            <Grid item>
              <Link
                href={`https://twitter.com/${identity?.identity.twitter}`}
                rel='noreferrer'
                target='_blank'
              >
                <TwitterIcon
                  color='#2AA9E0'
                  sx={{ fontSize: 15 }}
                />
              </Link>
            </Grid>
          }
           {identity?.identity?.riot &&
            <Grid item>
              <Link
                href={`https://twitter.com/${identity?.identity.twitter}`}
                rel='noreferrer'
                target='_blank'
              >
                <TwitterIcon
                  color='#2AA9E0'
                  sx={{ fontSize: 15 }}
                />
              </Link>
            </Grid>
          }
        </Grid>
        }
      </Grid>
      {showChainLogo &&
        <Grid item>
          <ChainLogo genesisHash={_chain?.genesisHash} />
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(Identity);
