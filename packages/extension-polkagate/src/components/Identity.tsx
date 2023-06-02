// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Email as EmailIcon, Language as LanguageIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { Box, Grid, Link, SxProps, Theme, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useEffect, useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { ms, msGreen, msWarning, riot } from '../assets/icons';
import { useAccountInfo, useAccountName, useChain, useFormatted, useMerkleScience, useTranslation } from '../hooks';
import { getSubstrateAddress } from '../util/utils';
import { ChainLogo, Identicon, Infotip, ShortAddress } from '.';

interface Props {
  accountInfo?: DeriveAccountInfo;
  address?: string | AccountId;
  api?: ApiPromise;
  chain?: Chain;
  formatted?: string | AccountId;
  identiconSize?: number;
  judgement?: any;
  name?: string;
  noIdenticon?: boolean;
  returnIdentity?: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | undefined>>;// to return back identity when needed
  style?: SxProps<Theme>;
  showChainLogo?: boolean;
  showShortAddress?: boolean;
  showSocial?: boolean;
  withShortAddress?: boolean;
}

function Identity({ accountInfo, address, api, chain, formatted, identiconSize = 40, judgement, name, noIdenticon = false, returnIdentity, showChainLogo = false, showShortAddress, showSocial = true, style, withShortAddress }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(formatted ? getSubstrateAddress(formatted) : address);
  const _chain = useChain(address, chain);
  const _formatted = useFormatted(address, formatted);
  const msData = useMerkleScience(_formatted, chain);

  const isMSgreen = ['Exchange', 'Donation'].includes(msData?.tag_type_verbose);
  const isMSwarning = ['Scam', 'High Risk Organization', 'Theft', 'Sanctions'].includes(msData?.tag_type_verbose);
  const _showSocial = msData ? false : showSocial;

  const _accountInfo = useAccountInfo(api, _formatted, accountInfo);
  const _judgement = useMemo(() => _accountInfo?.identity?.judgements && JSON.stringify(_accountInfo?.identity?.judgements).match(/reasonable|knownGood/gi), [_accountInfo?.identity?.judgements]);
  const socialIcons = (_accountInfo?.identity?.twitter ? 1 : 0) + (_accountInfo?.identity?.web ? 1 : 0) + (_accountInfo?.identity?.email ? 1 : 0) + (_accountInfo?.identity?.riot ? 1 : 0);

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
          </Grid>
        }
        <Grid container direction='column' item sx={{ fontSize: style?.fontSize ?? '28px', fontWeight: 400, maxWidth: `calc(97% - ${(_showSocial ? socialIcons * 20 : 0) + identiconSize}px)`, width: 'max-content' }}>
          <Grid container flexWrap='nowrap' item maxWidth='100%' overflow='hidden' whiteSpace='nowrap'>
            {msData
              ? <Grid container item >
                <Grid display='flex' item xs={1.25}>
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
                <Grid xs={10.5} color={isMSgreen ? 'success.main' : isMSwarning ? 'warning.main' : ''} item>
                  {msData.tag_type_verbose === 'Scam' ? 'Scam (Phishing)' : msData.tag_name_verbose}
                </Grid>
              </Grid>
              : <>
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
                      ? <ShortAddress address={formatted} style={{ fontSize: '11px' }} />
                      : t('Unknown')
                    }
                  </Grid>
                }
              </>
            }
          </Grid>
          {withShortAddress &&
            <Grid container item>
              <ShortAddress address={formatted} charsCount={6} style={{ fontSize: '11px', justifyContent: 'flex-start', lineHeight: '15px' }} />
            </Grid>
          }
        </Grid>
        {_showSocial &&
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
      {
        showChainLogo &&
        <Grid item>
          <ChainLogo genesisHash={_chain?.genesisHash} />
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(Identity);
