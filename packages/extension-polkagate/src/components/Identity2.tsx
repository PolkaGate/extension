// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import type { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { MsData } from '../util/getMS';
import type { MyIconTheme } from '../util/types';

import { Box, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { type CSSProperties, useEffect, useMemo } from 'react';

import { ms, msGreen, msWarning } from '../assets/icons';
import { useAccountName, useChainInfo, useFormatted, useIdentity, useIsBlueish, useIsDark, useMerkleScience, useTranslation } from '../hooks';
import { Email, Web, XIcon } from '../popup/settings/icons';
import SocialIcon from '../popup/settings/partials/SocialIcon';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { toTitleCase } from '../util';
import { isValidAddress } from '../util/utils';
import { ChainLogo, GlowCheck, Identicon, Infotip, ShortAddress } from '.';

interface Props {
  accountInfo?: DeriveAccountInfo | null;
  address?: string | AccountId;
  addressStyle?: SxProps<Theme> | CSSProperties;
  charsCount?: number;
  columnGap?: string;
  direction?: 'row' | 'column';
  genesisHash: string;
  identiconSize?: number;
  identiconStyle?: SxProps<Theme> | CSSProperties;
  identiconType?: string;
  inParentheses?: boolean;
  inTitleCase?: boolean;
  isSelected?: boolean;
  judgement?: unknown;
  name?: string;
  nameStyle?: SxProps<Theme> | CSSProperties;
  noIdenticon?: boolean;
  onClick?: () => void;
  returnIdentity?: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | undefined>>;// to return back identity when needed
  showChainLogo?: boolean;
  showShortAddress?: boolean;
  showSocial?: boolean;
  socialStyles?: SxProps<Theme> | CSSProperties;
  style?: SxProps<Theme> | CSSProperties;
  subIdOnly?: boolean;
  withShortAddress?: boolean;
}

interface MerkleProps {
  msData: MsData
}

function MerkleScienceTag ({ msData }: MerkleProps): React.ReactElement<Props> {
  const { t } = useTranslation();

  const { isMSgreen, isMSwarning } = useMemo(() => ({
    isMSgreen: ['Exchange', 'Donation'].includes(msData?.tag_type_verbose ?? ''),
    isMSwarning: ['Scam', 'High Risk Organization', 'Theft', 'Sanctions'].includes(msData?.tag_type_verbose ?? '')
  }), [msData?.tag_type_verbose]);

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

  return (
    <Grid container item sx={{ flexWrap: 'nowrap' }}>
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
  );
}

interface IdenticonDisplayProps extends Partial<Props> {
  chain: Chain | null | undefined;
  isSubId?: boolean;
}

function IdenticonDisplay ({ address, chain, identiconSize, identiconStyle = {}, identiconType = 'polkagate', isSelected, isSubId, judgement }: IdenticonDisplayProps): React.ReactElement<Props> {
  return (
    <Grid alignItems='center' container item m='auto 0' pr='5px' sx={{ ...identiconStyle }} width='fit-content'>
      {isSelected
        ? (
          <GlowCheck
            show={true}
            size={`${identiconSize}px`}
            timeout={100}
          />)
        : identiconType === 'polkagate'
          ? (
            <PolkaGateIdenticon
              address={String(address)}
              size={identiconSize}
            />)
          : (
            <Identicon
              iconTheme={(chain?.icon ?? 'polkadot') as MyIconTheme}
              isSubId={isSubId}
              judgement={judgement}
              prefix={chain?.ss58Format ?? 42}
              size={identiconSize}
              value={address}
            />)
      }
    </Grid>
  );
}

interface DisplayNameProps extends Partial<Props> {
  shortAddressProps: React.ComponentProps<typeof ShortAddress>;
  accountInfo: DeriveAccountInfo | null | undefined
}

function DisplayName ({ accountInfo, address, inTitleCase, name, nameStyle = {}, shortAddressProps, showShortAddress, style, subIdOnly = false }: DisplayNameProps): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(address);

  const maybeTitleCase = (value?: string): string =>
    value ? (inTitleCase ? toTitleCase(value) || '' : value) : '';

  const displayParent = accountInfo?.identity?.displayParent;
  const display = accountInfo?.identity?.display;

  const renderDisplayName = () => {
    if (displayParent && !subIdOnly) {
      return (
        <>
          {displayParent + '/'}
          {display && (
            displayParent
              ? <span style={{ color: grey[500] }}>{display}</span>
              : maybeTitleCase(display)
          )}
        </>
      );
    }

    if (display && subIdOnly) {
      return maybeTitleCase(display);
    }

    if (accountInfo?.nickname) {
      return maybeTitleCase(accountInfo.nickname);
    }

    if (name) {
      return name;
    }

    if (accountName) {
      return maybeTitleCase(accountName);
    }

    if (showShortAddress && isValidAddress(String(address))) {
      return (
        <ShortAddress {...shortAddressProps} />
      );
    }

    return t('Unknown');
  };

  return (
    <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...nameStyle }} textAlign='left' variant={style?.variant}>
      {renderDisplayName()}
    </Typography>
  );
}

interface SocialProps {
  accountInfo: DeriveAccountInfo | null | undefined;
  socialStyles: SxProps<Theme> | React.CSSProperties
}

function SocialLinks ({ accountInfo, socialStyles }: SocialProps): React.ReactElement<Props> {
  const theme = useTheme();
  const isBlueish = useIsBlueish();
  const isDark = useIsDark();
  const { email, twitter, web } = accountInfo?.identity ?? {};

  if (!email && !web && !twitter) {
    return null;
  }

  const iconColor = isBlueish ? '#809ACB' : theme.palette.icon.secondary;
  const bgColor = !isDark ? '#CCD2EA' : undefined;
  const iconSize = 18;
  const width = '10.12px';

  const socials = [
    email && {
      icon: <Email color={iconColor} width={width} />,
      key: 'email',
      link: `mailto:${email}`,
      size: iconSize
    },
    web && {
      icon: <Web color={iconColor} width={width} />,
      key: 'web',
      link: web,
      size: iconSize
    },
    twitter && {
      bgColor,
      icon: <XIcon color={iconColor} width={width} />,
      key: 'twitter',
      link: `https://twitter.com/${twitter}`,
      size: iconSize
    }
  ].filter(Boolean) as { key: string; icon: React.JSX.Element; link: string; size: number; bgColor?: string }[];

  return (
    <Grid alignItems='center' columnGap='2px' container item justifyContent='flex-end' sx={{ height: 'inherit', minWidth: 'fit-content', ml: '5px', mt: '3%', width: 'fit-content', ...socialStyles }}>
      {socials.map(({ bgColor, icon, key, link, size }) => (
        <SocialIcon Icon={icon} bgColor={bgColor} key={key} link={link} size={size} />
      ))}
    </Grid>
  );
}

function Identity2 ({ accountInfo, address, addressStyle, charsCount = 6, direction = 'column', genesisHash, identiconSize = 40, identiconStyle = {}, identiconType = 'polkagate', inParentheses = false, inTitleCase, isSelected, judgement, name, nameStyle = {}, noIdenticon = false, onClick, returnIdentity, showChainLogo = false, showShortAddress, showSocial = true, socialStyles = {}, style, subIdOnly = false, withShortAddress }: Props): React.ReactElement<Props> {
  const { chain } = useChainInfo(genesisHash, true);
  const _formatted = useFormatted(address, genesisHash);
  const msData = useMerkleScience(_formatted, chain);

  const _showSocial = msData ? false : showSocial;

  const _accountInfo = useIdentity(genesisHash, _formatted, accountInfo);

  const _judgement = useMemo(() => judgement || (_accountInfo?.identity?.judgements && JSON.stringify(_accountInfo?.identity?.judgements).match(/reasonable|knownGood/gi)), [_accountInfo?.identity?.judgements, judgement]);

  useEffect(() => {
    if (returnIdentity && _accountInfo?.identity) {
      returnIdentity(_accountInfo.identity);
    }
  }, [_accountInfo, returnIdentity]);

  const displayParent = _accountInfo?.identity?.displayParent;

  const shortAddressProps = useMemo<React.ComponentProps<typeof ShortAddress>>(() => ({
    address: _formatted ?? address,
    charsCount,
    inParentheses,
    style: { fontSize: style?.fontSize || '11px', justifyContent: 'flex-start', lineHeight: '15px', ...addressStyle },
    variant: addressStyle?.variant ?? style?.addressVariant ?? style?.variant ?? 'B-2'
  }), [_formatted, address, charsCount, inParentheses, style, addressStyle]);

  return (
    <Grid alignItems='center' container justifyContent='space-between' sx={{ maxWidth: '100%', width: 'fit-content', ...style }}>
      <Grid alignItems='center' container item xs={showChainLogo ? 11 : 12}>
        {!noIdenticon &&
          <IdenticonDisplay
            address={String(_formatted || address)}
            chain={chain}
            identiconSize={identiconSize}
            identiconStyle={identiconStyle}
            identiconType={identiconType}
            isSelected={isSelected}
            isSubId={!!displayParent}
            judgement={_judgement as RegExpMatchArray}
          />
        }
        <Grid container direction='column' item maxWidth='fit-content' onClick={onClick || undefined} overflow='hidden' sx={{ cursor: onClick ? 'pointer' : 'inherit', fontSize: style?.fontSize, fontWeight: style?.fontWeight, textAlign: 'left' }} textOverflow='ellipsis' whiteSpace='nowrap' xs>
          {msData
            ? <MerkleScienceTag msData={msData} />
            : <DisplayName
              accountInfo={_accountInfo}
              address={_formatted || address}
              inTitleCase={inTitleCase}
              name={name}
              nameStyle={nameStyle}
              shortAddressProps={shortAddressProps}
              showShortAddress={showShortAddress}
              style={style}
              subIdOnly={subIdOnly}
              />
          }
          {withShortAddress && direction === 'column' &&
            <Grid container item>
              <ShortAddress {...shortAddressProps} />
            </Grid>
          }
        </Grid>
        {withShortAddress && direction === 'row' &&
          <Grid container item justifyContent='flex-end' sx={{ height: 'inherit', minWidth: 'fit-content', mt: '3%', px: '5px', width: 'fit-content' }}>
            <ShortAddress {...shortAddressProps} />
          </Grid>
        }
        {_showSocial && _accountInfo?.identity?.email &&
          <SocialLinks
            accountInfo={_accountInfo}
            socialStyles={socialStyles}
          />
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
