// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-nocheck

import type { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { Box, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { type CSSProperties, useEffect, useMemo } from 'react';

import { ms, msGreen, msWarning } from '../assets/icons';
import { useAccountName, useChainInfo, useFormatted2, useIdentity, useIsDark, useMerkleScience, useTranslation } from '../hooks';
import { Email, Web, XIcon } from '../popup/settings/icons';
import SocialIcon from '../popup/settings/partials/SocialIcon';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { isValidAddress } from '../util/utils';
import { ChainLogo, Identicon, Infotip, ShortAddress } from '.';

interface Props {
  accountInfo?: DeriveAccountInfo | null;
  address?: string | AccountId;
  direction?: 'row' | 'column';
  genesisHash: string;
  identiconSize?: number;
  identiconStyle?: string;
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

function Identity2 ({ accountInfo, address, direction = 'column', genesisHash, identiconSize = 40, identiconStyle = 'polkagate', inParentheses = false, judgement, name, noIdenticon = false, onClick, returnIdentity, showChainLogo = false, showShortAddress, showSocial = true, style, subIdOnly = false, withShortAddress }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { chain } = useChainInfo(genesisHash);
  const theme = useTheme();
  const isDark = useIsDark();
  const bgColor = !isDark ? '#CCD2EA' : undefined;

  const accountName = useAccountName(address);
  const _formatted = useFormatted2(address, undefined, chain)?.toString();
  const msData = useMerkleScience(_formatted, chain);

  const isMSgreen = ['Exchange', 'Donation'].includes(msData?.tag_type_verbose || '');
  const isMSwarning = ['Scam', 'High Risk Organization', 'Theft', 'Sanctions'].includes(msData?.tag_type_verbose || '');
  const _showSocial = msData ? false : showSocial;

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
            {identiconStyle === 'polkagate'
              ? <PolkaGateIdenticon
                address={String(_formatted || address)}
                size={identiconSize}
              />
              : <Identicon
                iconTheme={chain?.icon ?? 'polkadot'}
                isSubId={!!_accountInfo?.identity?.displayParent}
                judgement={_judgement}
                prefix={chain?.ss58Format ?? 42}
                size={identiconSize}
                value={_formatted || address}
              />}
          </Grid>
        }
        <Grid direction='column' item maxWidth='fit-content' onClick={onClick || undefined} overflow='hidden' sx={{ cursor: onClick ? 'pointer' : 'inherit', fontSize: style?.fontSize, fontWeight: style?.fontWeight, textAlign: 'left' }} textOverflow='ellipsis' whiteSpace='nowrap' xs>
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
            : <Typography variant={style?.variant}>
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
                  ? <ShortAddress address={_formatted} style={{ fontSize: style?.fontSize as string, justifyContent: 'flex-start' }} variant={style?.variant} />
                  : t('Unknown')
                : ''
              }
            </Typography>
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
        {_showSocial && _accountInfo?.identity?.email &&
          <Grid alignItems='center' columnGap='2px' container id='socials' item justifyContent='flex-end' sx={{ height: 'inherit', minWidth: 'fit-content', ml: '5px', mt: '3%', width: 'fit-content' }}>
            {_accountInfo?.identity?.email &&
              <SocialIcon Icon={<Email color={theme.palette.icon.secondary} width='10.12px' />} link={`mailto:${_accountInfo.identity.email}`} size={18} />
            }
            {_accountInfo?.identity?.web &&
              <SocialIcon Icon={<Web color={theme.palette.icon.secondary} width='10.12px' />} link={_accountInfo?.identity.web} size={18} />

            }
            {_accountInfo?.identity?.twitter &&
              <SocialIcon Icon={<XIcon color={theme.palette.icon.secondary} width='10.12px' />} bgColor={bgColor} link={`https://twitter.com/${_accountInfo.identity.twitter}`} size={18} />
            }
            {/* {_accountInfo?.identity?.riot &&
              <Link href={`https://matrix.to/#/${_accountInfo.identity.riot}`} pl='5px' rel='noreferrer' target='_blank'>
                <Box component='img' src={riot} sx={{ height: '12px', mb: '2px', width: '12px' }} />
              </Link>
            } */}
          </Grid>
        }
      </Grid>
      {
        showChainLogo &&
        <Grid item xs={1}>
          <ChainLogo genesisHash={genesisHash} />
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(Identity2);
