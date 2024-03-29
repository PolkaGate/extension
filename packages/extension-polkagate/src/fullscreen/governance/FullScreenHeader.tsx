// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';
import { useParams } from 'react-router';

import { logoBlack } from '../../assets/logos';
import { ActionContext } from '../../components';
import { useApi, useChain, useGenesisHashOptions } from '../../hooks';
import { FullScreenChainSwitch, FullScreenRemoteNode } from '../../partials';
import { EXTENSION_NAME, GOVERNANCE_CHAINS, IDENTITY_CHAINS, SOCIAL_RECOVERY_CHAINS, STAKING_CHAINS } from '../../util/constants';
import AddressDropdown from './components/AddressDropdown';
import ThemeChanger from './partials/ThemeChanger';
import { MAX_WIDTH } from './utils/consts';

interface Props {
  page?: 'governance' | 'manageIdentity' | 'send' | 'stake' | 'socialRecovery' | 'AccountDetails' | 'proxyManagement';
  noChainSwitch?: boolean;
  noAccountDropDown?: boolean;
  _otherComponents?: JSX.Element;
}

export function FullScreenHeader({ _otherComponents, noAccountDropDown = false, noChainSwitch = false, page }: Props): React.ReactElement {
  const { address, postId, topMenu } = useParams<{ address: string, topMenu?: 'referenda' | 'fellowship', postId?: string }>();
  const allChains = useGenesisHashOptions();

  const api = useApi(address);
  const chain = useChain(address);
  const onAction = useContext(ActionContext);

  const filteredChains = useMemo(() => {
    switch (page) {
      case 'governance':
        return GOVERNANCE_CHAINS;
      case 'stake':
        return STAKING_CHAINS;
      case 'manageIdentity':
        return IDENTITY_CHAINS;
      case 'socialRecovery':
        return SOCIAL_RECOVERY_CHAINS;
      case 'AccountDetails':
        return allChains.filter((chain) => chain.value !== '').map((chainOption) => chainOption.value);
      default:
        return [];
    }
  }, [allChains, page]);

  const onAccountChange = useCallback((selectedAddress: string) => {
    switch (page) {
      case 'proxyManagement':
        return onAction(`/fullscreenProxyManagement/${selectedAddress}`);
      case 'governance':
        return onAction(`/governance/${selectedAddress}/${`${topMenu ?? ''}`}/${postId ?? ''}`);
      case 'manageIdentity':
        return onAction(`/manageIdentity/${selectedAddress}`);
      case 'socialRecovery':
        return onAction(`/socialRecovery/${selectedAddress}/false`);
      case 'AccountDetails':
        return onAction(`/accountfs/${selectedAddress}/0`);
      case 'send':
        return onAction(`/send/${selectedAddress}/`);
      default:
        return null;
    }
  }, [onAction, page, postId, topMenu]);

  const goHome = useCallback(() => onAction('/'), [onAction]);

  return (
    <Grid alignItems='center' container id='header' justifyContent='space-between' sx={{ bgcolor: '#000000', borderBottom: '1px solid', borderBottomColor: 'secondary.light', color: 'text.secondary', fontSize: '42px', fontWeight: 400, height: '70px', minWidth: '810px', px: '40px' }}>
      <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
        <Grid alignItems='center' container justifyContent='space-between'>
          <Grid alignItems='center' container item justifyContent='flex-start' xs={6}>
            <Grid alignItems='center' container flexWrap='nowrap' item onClick={goHome} sx={{ cursor: 'pointer', width: 'fit-content' }}>
              <Box
                component='img'
                src={logoBlack as string}
                sx={{ height: 50, mr: '2%', width: 50 }}
              />
              <Typography color='white' fontFamily='Eras' fontSize='42px'>
                {EXTENSION_NAME}
              </Typography>
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-end' sx={{ color: 'text.primary' }} xs={6}>
            <Grid container item justifyContent='flex-end' width='fit-content'>
              <ThemeChanger />
            </Grid>
            {!noAccountDropDown &&
              <Grid container item justifyContent='flex-end' sx={{ color: 'text.primary', maxWidth: 'calc(100% - 130px)', px: '15px', width: 'fit-content' }}>
                <AddressDropdown
                  api={api}
                  chainGenesis={chain?.genesisHash}
                  height='40px'
                  onSelect={onAccountChange}
                  selectedAddress={address}
                />
              </Grid>}
            {!noChainSwitch &&
              <>
                <Grid container item justifyContent='flex-end' width='50px'>
                  <FullScreenChainSwitch
                    address={address}
                    chains={filteredChains}
                  />
                </Grid>
                <Grid container item justifyContent='flex-end' width='50px'>
                  <FullScreenRemoteNode
                    address={address}
                  />
                </Grid>
              </>
            }
            {!!_otherComponents &&
              _otherComponents
            }
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
