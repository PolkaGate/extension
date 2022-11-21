// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Email as EmailIcon, Language as LanguageIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { Box, Grid, Link, SxProps, Theme } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { riot } from '../assets/icons';
import { useAccountInfo, useAccountName, useChain, useFormatted, useTranslation } from '../hooks';
import { getSubstrateAddress } from '../util/utils';
import { ChainLogo, Identicon, ShortAddress } from '.';

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
  showSocial?: boolean;
}

function Identity({ address, api, chain, formatted, identiconSize = 40, name, showChainLogo = false, showShortAddress, showSocial = true, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(formatted ? getSubstrateAddress(formatted) : address);
  const _chain = useChain(address, chain);
  const _formatted = useFormatted(address, formatted);
  const accountInfo = useAccountInfo(api, _formatted);
  const judgement = useMemo(() => accountInfo?.identity?.judgements && JSON.stringify(accountInfo?.identity?.judgements).match(/reasonable|knownGood/gi), [accountInfo?.identity?.judgements]);
  const socialIcons = (accountInfo?.identity?.twitter ? 1 : 0) + (accountInfo?.identity?.web ? 1 : 0) + (accountInfo?.identity?.email ? 1 : 0) + (accountInfo?.identity?.riot ? 1 : 0);

  return (
    <Grid alignItems='center' container justifyContent='space-between' sx={{ ...style }}>
      <Grid alignItems='center' container item xs={showChainLogo ? 11 : 12}>
        <Grid item pr='5px' sx={1}>
          <Identicon
            iconTheme={_chain?.icon ?? 'polkadot'}
            judgement={judgement}
            prefix={_chain?.ss58Format ?? 42}
            size={identiconSize}
            value={_formatted}
          />
        </Grid>
        <Grid container item sx={{ flexWrap: 'nowrap', fontSize: style?.fontSize ?? '28px', fontWeight: 400, width: 'fit-content', letterSpacing: '-1.5%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: `calc(95% - ${(socialIcons * 20) + identiconSize}px)` }}>
          {accountInfo?.identity?.displayParent &&
            <Grid item >
              {accountInfo?.identity.displayParent}/
            </Grid>
          }
          {(accountInfo?.identity?.display || accountInfo?.nickname) &&
            <Grid item sx={accountInfo?.identity?.displayParent && { color: grey[500] }}>
              {accountInfo?.identity?.display ?? accountInfo?.nickname}
            </Grid>
          }
          {!(accountInfo?.identity?.displayParent || accountInfo?.identity?.display || accountInfo?.nickname) && (name || accountName) &&
            <Grid item sx={accountInfo?.identity?.displayParent && { color: grey[500] }}>
              {name || accountName}
            </Grid>
          }
          {!(accountInfo?.identity?.displayParent || accountInfo?.identity?.display || accountInfo?.nickname || name || accountName) &&
            <Grid item sx={{ textAlign: 'left' }}>
              {showShortAddress
                ? <ShortAddress address={formatted} style={{ fontSize: '11px' }} />
                : t('Unknown')
              }
            </Grid>
          }
        </Grid>
        {showSocial &&
          <Grid alignItems='center' container id='socials' item justifyContent='flex-end' width='fit-content' pl='5px'>
            {accountInfo?.identity?.email &&
              <Grid item>
                <Link href={`mailto:${accountInfo.identity.email}`}>
                  <EmailIcon sx={{ color: '#1E5AEF', fontSize: 15 }} />
                </Link>
              </Grid>
            }
            {accountInfo?.identity?.web &&
              <Grid item pl='5px'>
                <Link href={accountInfo?.identity.web} rel='noreferrer' target='_blank'>
                  <LanguageIcon sx={{ color: '#007CC4', fontSize: 15 }} />
                </Link>
              </Grid>
            }
            {accountInfo?.identity?.twitter &&
              <Grid item pl='5px'>
                <Link href={`https://twitter.com/${accountInfo.identity.twitter}`} rel='noreferrer' target='_blank'>
                  <TwitterIcon sx={{ color: '#2AA9E0', fontSize: 15 }} />
                </Link>
              </Grid>
            }
            {accountInfo?.identity?.riot &&
              <Grid item pl='5px'>
                <Link href={`https://matrix.to/#/${accountInfo.identity.riot}`} rel='noreferrer' target='_blank'>
                  <Box component='img' src={riot} sx={{ height: '12px', width: '12px' }} />
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
