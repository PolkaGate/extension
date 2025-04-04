// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { Email as EmailIcon, Language as LanguageIcon, X as XIcon } from '@mui/icons-material';
import { Box, Grid, Link, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { type CSSProperties, useEffect, useMemo } from 'react';

import { ms, msGreen, msWarning, riot } from '../assets/icons';
import { useAccountName, useChain, useFormatted2, useIdentity, useMerkleScience, useTranslation } from '../hooks';
import { getSubstrateAddress, isValidAddress } from '../util/utils';
import { ChainLogo, Identicon, Infotip, ShortAddress } from '.';

interface Props {
  accountInfo?: DeriveAccountInfo | null;
  address?: string | AccountId;
  api?: ApiPromise;
  chain?: Chain | null;
  direction?: 'row' | 'column';
  formatted?: string | AccountId;
  identiconSize?: number;
  inParentheses?: boolean;
  judgement?: unknown;
  name?: string;
  noIdenticon?: boolean;
  onClick?: () => void;
  returnIdentity?: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | undefined>>;// to return back identity when needed
  showChainLogo?: boolean;
  showShortAddress?: boolean;
  showSocial?: boolean;
  style?: SxProps<Theme> | CSSProperties;
  subIdOnly?: boolean;
  withShortAddress?: boolean;
}

function Identity({ accountInfo, address, api, chain, direction = 'column', formatted, identiconSize = 40, inParentheses = false, judgement, name, noIdenticon = false, onClick, returnIdentity, showChainLogo = false, showShortAddress, showSocial = true, style, subIdOnly = false, withShortAddress }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const isDark = theme.palette.mode === 'dark';

  const accountName = useAccountName(formatted ? getSubstrateAddress(formatted) : address);
  const _chain = useChain(address, chain);
  const _formatted = useFormatted2(address, formatted, chain)?.toString();
  const msData = useMerkleScience(_formatted, chain);

  const isMSgreen = ['Exchange', 'Donation'].includes(msData?.tag_type_verbose as string);
  const isMSwarning = ['Scam', 'High Risk Organization', 'Theft', 'Sanctions'].includes(msData?.tag_type_verbose as string);
  const _showSocial = msData ? false : showSocial;

  const genesisHash = chain?.genesisHash || api?.genesisHash?.toHex();
  const _accountInfo = useIdentity(genesisHash, _formatted, accountInfo);

  const _judgement = useMemo(() => judgement || (_accountInfo?.identity?.judgements && JSON.stringify(_accountInfo?.identity?.judgements).match(/reasonable|knownGood/gi)), [_accountInfo?.identity?.judgements, judgement]);

  const merkleScienceTooltip = useMemo(() => (msData &&
    <Typography variant='body2'>
      <Grid container justifyContent='flex-start'>
        <Grid item textAlign='left' xs={12}>
          {t('Data from Merkle Science (NOT onchain data)')}
        </Grid>
        <Grid item textAlign='left' xs={12}>
          {t(` - Type: ${msData.tag_type_verbose}`)}
        </Grid>
        <Grid item textAlign='left' xs={12}>
          {t(` - Subtype: ${msData.tag_subtype_verbose}`)}
        </Grid>
        {msData.tag_type_verbose === 'Scam' &&
          <Grid item textAlign='left' xs={12}>
            {t(` - Name: ${msData.tag_name_verbose}`)}
          </Grid>
        }
      </Grid>
    </Typography>
  ), [msData, t]);

  useEffect(() => {
    returnIdentity && _accountInfo?.identity && returnIdentity(_accountInfo.identity);
  }, [_accountInfo, returnIdentity]);

  return (
    <Grid alignItems='center' container justifyContent='space-between' sx={{ maxWidth: '100%', width: 'fit-content', ...style }}>
      <Grid alignItems='center' container item xs={showChainLogo ? 11 : 12}>
        {!noIdenticon &&
          <Grid item m='auto 0' pr='5px' width='fit-content'>
            <Identicon
              iconTheme={_chain?.icon ?? 'polkadot'}
              isSubId={!!_accountInfo?.identity?.displayParent}
              judgement={_judgement}
              prefix={_chain?.ss58Format ?? 42}
              size={identiconSize}
              value={_formatted || address}
            />
          </Grid>
        }
        <Grid direction='column' item maxWidth='fit-content' onClick={onClick || undefined} overflow='hidden' sx={{ cursor: onClick ? 'pointer' : 'inherit', fontSize: style?.fontSize as string ?? '28px', fontWeight: 400, textAlign: 'left' }} textOverflow='ellipsis' whiteSpace='nowrap' xs>
          {msData
            ? <Grid container item sx={{ flexWrap: 'nowrap' }}>
              <Grid display='flex' item sx={{ width: '25px' }}>
                <Infotip text={merkleScienceTooltip}>
                  <Box
                    component='img'
                    src={
                      isMSgreen
                        ? msGreen as string
                        : isMSwarning
                          ? msWarning as string
                          : ms as string
                    }
                    sx={{ width: '20px' }}
                  />
                </Infotip>
              </Grid>
              <Grid color={isMSgreen ? 'success.main' : isMSwarning ? 'warning.main' : ''} item sx={{ maxWidth: 'calc(100% - 25px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {msData.tag_type_verbose === 'Scam' ? 'Scam (Phishing)' : msData.tag_name_verbose}
              </Grid>
            </Grid>
            : <>
              {_accountInfo?.identity.displayParent && !subIdOnly ? _accountInfo?.identity.displayParent + '/' : ''}
              {_accountInfo?.identity?.display && !subIdOnly
                ? _accountInfo?.identity.displayParent
                  ? <span style={{ color: grey[500] }}>{_accountInfo?.identity?.display}</span>
                  : _accountInfo?.identity?.display
                : ''}
              {_accountInfo?.identity.display && subIdOnly &&
                _accountInfo?.identity?.display
              }
              {_accountInfo?.nickname
                ? _accountInfo?.nickname
                : ''
              }
              {!(_accountInfo?.identity?.displayParent || _accountInfo?.identity?.display || _accountInfo?.nickname) && name
                ? name
                : ''
              }
              {!(_accountInfo?.identity?.displayParent || _accountInfo?.identity?.display || _accountInfo?.nickname || name) && accountName
                ? accountName
                : ''
              }
              {!(_accountInfo?.identity?.displayParent || _accountInfo?.identity?.display || _accountInfo?.nickname || name || accountName)
                ? showShortAddress && isValidAddress(String(_formatted))
                  ? <ShortAddress address={_formatted} style={{ fontSize: style?.fontSize as string || '11px', justifyContent: 'flex-start' }} />
                  : t('Unknown')
                : ''
              }
            </>
          }
          {withShortAddress && direction === 'column' &&
            <Grid container item>
              <ShortAddress address={_formatted} charsCount={6} inParentheses={inParentheses} style={{ fontSize: '11px', justifyContent: 'flex-start', lineHeight: '15px' }} />
            </Grid>
          }
        </Grid>
        {withShortAddress && direction === 'row' &&
          <Grid container item justifyContent='flex-end' sx={{ height: 'inherit', minWidth: 'fit-content', mt: '3%', px: '5px', width: 'fit-content' }}>
            <ShortAddress address={_formatted} charsCount={6} inParentheses={inParentheses} style={{ fontSize: '11px', justifyContent: 'flex-start' }} />
          </Grid>
        }
        {_showSocial &&
          <Grid container id='socials' item justifyContent='flex-end' sx={{ height: 'inherit', minWidth: 'fit-content', mt: '3%', px: '5px', width: 'fit-content' }}>
            {_accountInfo?.identity?.email &&
              <Link href={`mailto:${_accountInfo.identity.email}`}>
                <EmailIcon sx={{ color: '#007CC4', fontSize: 15 }} />
              </Link>
            }
            {_accountInfo?.identity?.web &&
              <Link href={_accountInfo?.identity.web} pl='5px' rel='noreferrer' target='_blank'>
                <LanguageIcon sx={{ color: 'success.main', fontSize: 15 }} />
              </Link>
            }
            {_accountInfo?.identity?.twitter &&
              <Link href={`https://twitter.com/${_accountInfo.identity.twitter}`} pl='5px' rel='noreferrer' target='_blank'>
                <XIcon sx={{ color: isDark ? 'white' : 'black', fontSize: 14 }} />
              </Link>
            }
            {_accountInfo?.identity?.riot &&
              <Link href={`https://matrix.to/#/${_accountInfo.identity.riot}`} pl='5px' rel='noreferrer' target='_blank'>
                <Box component='img' src={riot} sx={{ height: '12px', mb: '2px', width: '12px' }} />
              </Link>
            }
          </Grid>
        }
      </Grid>
      {
        showChainLogo &&
        <Grid item xs={1}>
          <ChainLogo genesisHash={_chain?.genesisHash} />
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(Identity);
