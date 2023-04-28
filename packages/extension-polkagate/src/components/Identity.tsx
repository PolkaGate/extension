// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Email as EmailIcon, Language as LanguageIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { Box, Grid, Link, SxProps, Theme } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useEffect, useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { riot } from '../assets/icons';
import { useAccountInfo, useAccountName, useChain, useFormatted, useTranslation } from '../hooks';
import useFormatted2 from '../hooks/useFormatted2';
import { getSubstrateAddress } from '../util/utils';
import { ChainLogo, Identicon, ShortAddress } from '.';

interface Props {
  accountInfo?: DeriveAccountInfo;
  address?: string | AccountId;
  api?: ApiPromise;
  formatted?: string | AccountId;
  name?: string;
  style?: SxProps<Theme>;
  showChainLogo?: boolean;
  identiconSize?: number;
  chain?: Chain | null;
  showShortAddress?: boolean;
  withShortAddress?: boolean;
  showSocial?: boolean;
  noIdenticon?: boolean;
  judgement?: any;
  returnIdentity?: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | undefined>>;// to return back identity when needed
}

function Identity({ accountInfo, address, api, chain, formatted, identiconSize = 40, judgement, name, noIdenticon = false, returnIdentity, showChainLogo = false, showShortAddress, showSocial = true, style, withShortAddress }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(formatted ? getSubstrateAddress(formatted) : address);
  const _chain = useChain(address, chain);
  const _formatted = useFormatted2(address, formatted, _chain);
  const _accountInfo = useAccountInfo(api, _formatted, accountInfo);
  const _judgement = useMemo(() => _accountInfo?.identity?.judgements && JSON.stringify(_accountInfo?.identity?.judgements).match(/reasonable|knownGood/gi), [_accountInfo?.identity?.judgements]);
  const socialIcons = (_accountInfo?.identity?.twitter ? 1 : 0) + (_accountInfo?.identity?.web ? 1 : 0) + (_accountInfo?.identity?.email ? 1 : 0) + (_accountInfo?.identity?.riot ? 1 : 0);

  useEffect(() => {
    returnIdentity && _accountInfo?.identity && returnIdentity(_accountInfo.identity);
  }, [_accountInfo, returnIdentity]);

  return (
    <Grid alignItems='center' container justifyContent='space-between' sx={{ ...style }}>
      <Grid alignItems='center' container item xs={showChainLogo || noIdenticon ? 11 : 12}>
        {!noIdenticon &&
          <Grid item m='auto 0' pr='5px'>
            <Identicon
              iconTheme={_chain?.icon ?? 'polkadot'}
              judgement={judgement || _judgement}
              prefix={_chain?.ss58Format ?? 42}
              size={identiconSize}
              value={_formatted || address}
            />
          </Grid>}
        <Grid container direction='column' item sx={{ fontSize: style?.fontSize ?? '28px', fontWeight: 400, maxWidth: `calc(97% - ${(showSocial ? socialIcons * 20 : 0) + identiconSize}px)`, width: 'max-content' }}>
          <Grid container flexWrap='nowrap' item maxWidth='100%' overflow='hidden' whiteSpace='nowrap'>
            {_accountInfo?.identity?.displayParent &&
              <Grid item>
                {_accountInfo?.identity.displayParent}/
              </Grid>
            }
            {(_accountInfo?.identity?.display || _accountInfo?.nickname) &&
              <Grid item sx={_accountInfo?.identity?.displayParent && { color: grey[500] }}>
                {_accountInfo?.identity?.display ?? _accountInfo?.nickname}
              </Grid>
            }
            {!(_accountInfo?.identity?.displayParent || _accountInfo?.identity?.display || _accountInfo?.nickname) && (name || accountName) &&
              <Grid item sx={_accountInfo?.identity?.displayParent && { color: grey[500] }}>
                {name || accountName}
              </Grid>
            }
            {!(_accountInfo?.identity?.displayParent || _accountInfo?.identity?.display || _accountInfo?.nickname || name || accountName) &&
              <Grid item sx={{ textAlign: 'left' }}>
                {showShortAddress
                  ? <ShortAddress address={formatted} style={{ fontSize: style?.fontSize || '11px' }} />
                  : t('Unknown')
                }
              </Grid>
            }
          </Grid>
          {withShortAddress &&
            <Grid container item>
              <ShortAddress address={formatted} charsCount={6} style={{ fontSize: '11px', justifyContent: 'flex-start', lineHeight: '15px' }} />
            </Grid>
          }
        </Grid>
        {showSocial &&
          <Grid container id='socials' item justifyContent='flex-end' pl='5px' width='fit-content'>
            {_accountInfo?.identity?.email &&
              <Grid item>
                <Link href={`mailto:${_accountInfo.identity.email}`}>
                  <EmailIcon sx={{ color: '#1E5AEF', fontSize: 15 }} />
                </Link>
              </Grid>
            }
            {_accountInfo?.identity?.web &&
              <Grid item pl='5px'>
                <Link href={_accountInfo?.identity.web} rel='noreferrer' target='_blank'>
                  <LanguageIcon sx={{ color: '#007CC4', fontSize: 15 }} />
                </Link>
              </Grid>
            }
            {_accountInfo?.identity?.twitter &&
              <Grid item pl='5px'>
                <Link href={`https://twitter.com/${_accountInfo.identity.twitter}`} rel='noreferrer' target='_blank'>
                  <TwitterIcon sx={{ color: '#2AA9E0', fontSize: 15 }} />
                </Link>
              </Grid>
            }
            {_accountInfo?.identity?.riot &&
              <Grid item pl='5px'>
                <Link href={`https://matrix.to/#/${_accountInfo.identity.riot}`} rel='noreferrer' target='_blank'>
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
