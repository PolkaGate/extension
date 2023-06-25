// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import '@vaadin/icons';

import { faCoins, faHistory, faPaperPlane, faPiggyBank, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Box, Container, Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { stakingClose } from '../../assets/icons';
import { ActionContext, HorizontalMenuItem, Identicon, Motion } from '../../components';
import { useAccount, useAccountLocks, useApi, useBalances, useChain, useChainName, useFormatted, useMyAccountIdentity, useProxies, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { HeaderBrand } from '../../partials';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../util/constants';
import { BalancesInfo, FormattedAddressState } from '../../util/types';
import StakingOption from '../staking/Options';
import AccountBrief from './AccountBrief';
import LabelBalancePrice from './LabelBalancePrice';
import Others from './Others';

export default function AccountDetails(): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const onAction = useContext(ActionContext);
  const theme = useTheme();
  const { pathname, state } = useLocation();
  const { address, genesisHash } = useParams<FormattedAddressState>();
  const api = useApi(address, state?.api);
  const identity = useMyAccountIdentity(address);
  const formatted = useFormatted(address);
  const account = useAccount(address);
  const chain = useChain(address);

  const referendaLocks = useAccountLocks(address, 'referenda', 'convictionVoting');

  console.log('referendaLocks:', referendaLocks);
  referendaLocks && console.log('referendaLocks:', JSON.parse(JSON.stringify(referendaLocks)));


  const [refresh, setRefresh] = useState<boolean | undefined>(false);
  const balances = useBalances(address, refresh, setRefresh);
  const [balanceToShow, setBalanceToShow] = useState<BalancesInfo>();
  const availableProxiesForTransfer = useProxies(api, formatted, ['Any']);
  const [showOthers, setShowOthers] = useState<boolean | undefined>(false);
  const [showStakingOptions, setShowStakingOptions] = useState<boolean>(false);
  const chainName = useChainName(address);

  const gotToHome = useCallback(() => {
    if (showStakingOptions) {
      return setShowStakingOptions(false);
    }

    onAction('/');
  }, [onAction, showStakingOptions]);

  const goToAccount = useCallback(() => {
    chain?.genesisHash && onAction(`/account/${chain.genesisHash}/${address}/`);
  }, [address, chain, onAction]);

  useEffect(() => {
    if (balances?.chainName === chainName) {
      return setBalanceToShow(balances);
    }

    setBalanceToShow(undefined);
  }, [balances, chainName]);

  useEffect(() => {
    chain && goToAccount();
  }, [chain, goToAccount]);

  const goToSend = useCallback(() => {
    if (!availableProxiesForTransfer?.length && account?.isExternal) {
      return; // Account is external and does not have any available proxy for transfer funds
    }

    history.push({
      pathname: `/send/${address}/`,
      state: { api, balances }
    });
  }, [availableProxiesForTransfer?.length, account?.isExternal, history, address, balances, api]);

  const goToStaking = useCallback(() => {
    STAKING_CHAINS.includes(genesisHash) && setShowStakingOptions(!showStakingOptions);
  }, [genesisHash, showStakingOptions]);

  const goToHistory = useCallback(() => {
    chainName && formatted &&
      history.push({
        pathname: `/history/${address}`,
        state: { pathname }
      });
  }, [address, chainName, formatted, history, pathname]);

  const goToCrowdLoans = useCallback(() => {
    formatted && CROWDLOANS_CHAINS.includes(genesisHash) &&
      history.push({
        pathname: `/crowdloans/${address}`
      });
  }, [address, formatted, genesisHash, history]);

  const goToGovernance = useCallback(() => {
    formatted && GOVERNANCE_CHAINS.includes(genesisHash) &&
      windowOpen(`/governance/${address}/referenda`).catch(console.error);
  }, [address, formatted, genesisHash]);

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      judgement={identity?.judgements}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  const stakingIconColor = useMemo(() =>
    !STAKING_CHAINS.includes(genesisHash)
      ? theme.palette.action.disabledBackground
      : showStakingOptions
        ? theme.palette.secondary.main
        : theme.palette.text.primary
    , [genesisHash, showStakingOptions, theme.palette.action.disabledBackground, theme.palette.secondary.main, theme.palette.text.primary]);

  const goToOthers = useCallback(() => {
    setShowOthers(true);
  }, []);

  const OthersRow = (
    <Grid item py='5px'>
      <Grid alignItems='center' container justifyContent='space-between'>
        <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '36px' }} xs={3}>
          {t('Others')}
        </Grid>
        <Grid item textAlign='right' xs={1.5}>
          <IconButton
            onClick={goToOthers}
            sx={{ p: 0 }}
          >
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 2 }} />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Motion>
      <HeaderBrand
        _centerItem={identicon}
        address={address}
        noBorder
        onBackClick={gotToHome}
        paddingBottom={0}
        showAccountMenu
        showBackArrow
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <AccountBrief address={address} identity={identity} />
        {!showStakingOptions
          ? <>
            <Grid item pt='10px' xs sx={{ height: '380px', overflowY: 'scroll' }}>
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Total'} />
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Transferrable'} />
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Locked in Referenda'} />
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Solo Staked'} />
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Pool Staked'} />
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Reserved'} />
              {OthersRow}
            </Grid>
          </>
          : <StakingOption showStakingOptions={showStakingOptions} />
        }
        <Grid container justifyContent='space-around' sx={{ bgcolor: 'background.default', borderTop: '2px solid', borderTopColor: 'secondary.main', bottom: 0, height: '62px', left: '4%', position: 'absolute', pt: '7px', pb: '5px', width: '92%' }} >
          <HorizontalMenuItem
            divider
            icon={
              <FontAwesomeIcon
                color={(!availableProxiesForTransfer?.length && account?.isExternal) ? theme.palette.action.disabledBackground : theme.palette.text.primary}
                icon={faPaperPlane}
                size='lg'
              />
            }
            isLoading={availableProxiesForTransfer === undefined && account?.isExternal}
            onClick={goToSend}
            textDisabled={(!availableProxiesForTransfer?.length && account?.isExternal)}
            title={t<string>('Send')}
          />
          <HorizontalMenuItem
            divider
            icon={
              <FontAwesomeIcon
                color={`${GOVERNANCE_CHAINS.includes(genesisHash) ? theme.palette.text.primary : theme.palette.action.disabledBackground}`}
                icon={faVoteYea}
                size='lg'
              />
            }
            onClick={goToGovernance}
            // textDisabled={!GOVERNANCE_CHAINS.includes(genesisHash)}
            title={t<string>('Governance')}
          />
          <HorizontalMenuItem
            divider
            icon={
              showStakingOptions
                ? <Box component='img' src={stakingClose} width='30px' />
                : <FontAwesomeIcon
                  color={stakingIconColor}
                  icon={faCoins}
                  size='lg'
                />
            } onClick={goToStaking}
            // textDisabled={!STAKING_CHAINS.includes(genesisHash)}
            title={t<string>('Stake')}
          />
          <HorizontalMenuItem
            divider
            icon={
              <FontAwesomeIcon
                color={`${CROWDLOANS_CHAINS.includes(genesisHash) ? theme.palette.text.primary : theme.palette.action.disabledBackground}`}
                flip='horizontal'
                icon={faPiggyBank}
                size='lg'
              />
            }
            onClick={goToCrowdLoans}
            title={t<string>('Crowdloan')}
          />
          <HorizontalMenuItem
            icon={
              <FontAwesomeIcon
                color={`${theme.palette.text.primary}`}
                icon={faHistory}
                size='lg'
              />}
            onClick={goToHistory}
            title={t<string>('History')}
          />
        </Grid>
      </Container>
      {showOthers && balances && chain && formatted &&
        <Others
          address={address}
          balances={balances}
          chain={chain}
          identity={identity}
          setShow={setShowOthers}
          show={showOthers}
        />
      }
    </Motion>
  );
}
