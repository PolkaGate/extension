// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid, Link, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { Infotip } from '../../../components';
import { useChainName, useFormatted } from '../../../hooks';
import getLogo from '../../../util/getLogo';

interface Props {
  address: string | undefined;
}

// There are two Bifrost chains, but we only support Polkadot-Bifrost
const SUBSQUARE_SUPPORTED_CHAINS = ['Polkadot', 'Polkadot Collectives', 'Acala', 'Bifrost', 'Centrifuge', 'Darwinia2', 'HydraDX', 'Interlay', 'Litentry', 'Phala', 'Zeitgeist', 'Kusama', 'Altair', 'Basilisk', 'Litmus', 'Karura', 'Khala', 'Turing', 'Kintsugi', 'Curst', 'Rococo'];

export default function ExternalLinks({ address }: Props): React.ReactElement {
  const theme = useTheme();
  const chainName = useChainName(address);
  const formatted = useFormatted(address);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const subIDURL = useMemo(() => `https://sub.id/${formatted ?? address ?? ''}`, [address, formatted]);
 
  const subscanURL = useMemo(() => {
    // Subscan does not support Pendulum
    if (chainName === 'Pendulum') {
      return undefined;
    }

    if (chainName === 'WestendAssetHub') {
      return `https://westmint.statescan.io/#/accounts/${String(formatted)}`;
    }

    if (chainName?.includes('AssetHub')) {
      return `https://assethub-${chainName.replace(/AssetHub/, '')}.subscan.io/account/${String(formatted)}`;
    }

    return `https://${chainName}.subscan.io/account/${String(formatted)}`;
  }, [chainName, formatted]);

  // TODO: subsquare does not support all networks
  const subsquareURL = useMemo(() => {
    if (chainName && SUBSQUARE_SUPPORTED_CHAINS.includes(chainName)) {
      return `https://${chainName}.subsquare.io/user/${formatted ?? address ?? ''}`;
    }

    return undefined;
  }, [chainName, formatted, address]);

  const stateScanURL = useMemo(
    () => chainName && address && `https://${chainName}.statescan.io/#/accounts/${formatted ?? address}`
    , [address, formatted, chainName]);

  const LinkButton = ({ linkName, linkURL }: { linkName: string, linkURL: string }) => {
    const logo = getLogo(linkName);

    return (
      <Grid container item sx={{ cursor: 'pointer', mx: '10px' }} width='fit-content'>
        <Infotip text={linkName}>
          <Link href={linkURL} rel='noreferrer' target='_blank'>
            <Avatar
              src={logo}
              sx={{ borderRadius: '50%', filter: (linkName === 'statescan' && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: '30px', width: '30px' }}
              variant='square'
            />
          </Link>
        </Infotip>
      </Grid>
    );
  };

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} >
      <LinkButton
        linkName='subid'
        linkURL={subIDURL}
      />
      {subscanURL &&
        <LinkButton
          linkName='subscan'
          linkURL={subscanURL}
        />}
      {subsquareURL &&
        <LinkButton
          linkName='subsquare'
          linkURL={subsquareURL}
        />}
      {['Kusama', 'Polkadot'].includes(chainName ?? '') && stateScanURL &&
        <LinkButton
          linkName='statescan'
          linkURL={stateScanURL}
        />}
    </Grid>
  );
}
