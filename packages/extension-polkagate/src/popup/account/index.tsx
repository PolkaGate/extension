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

import { WESTEND_GENESIS } from '@polkadot/apps-config';

import { stakingClose } from '../../assets/icons';
import { ActionContext, HorizontalMenuItem, Identicon, Motion } from '../../components';
import { useAccount, useApi, useBalances, useChain, useChainName, useFormatted, useGenesisHashOptions, useMyAccountIdentity, useProxies, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { ChainSwitch, HeaderBrand } from '../../partials';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, INITIAL_RECENT_CHAINS_GENESISHASH, STAKING_CHAINS } from '../../util/constants';
import { BalancesInfo, FormattedAddressState } from '../../util/types';
import { sanitizeChainName } from '../../util/utils';
import StakingOption from '../staking/Options';
import AccountBrief from './AccountBrief';
import LabelBalancePrice from './LabelBalancePrice';
import LockedInReferenda from './unlock/LockedInReferenda';
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
  const chainName = useChainName(address);

  const genesisOptions = useGenesisHashOptions();

  const [refresh, setRefresh] = useState<boolean | undefined>(false);
  const balances = useBalances(address, refresh, setRefresh);
  const [balanceToShow, setBalanceToShow] = useState<BalancesInfo>();
  const availableProxiesForTransfer = useProxies(api, formatted, ['Any']);
  const [showOthers, setShowOthers] = useState<boolean | undefined>(false);
  const [showStakingOptions, setShowStakingOptions] = useState<boolean>(false);
  const [recentChains, setRecentChains] = useState<string[]>();
  const [isTestnetEnabled, setIsTestnetEnabled] = useState<boolean>();

  useEffect(() => setIsTestnetEnabled(window.localStorage.getItem('testnet_enabled') === 'true'), []);

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

  const goToPoolStaking = useCallback(() => {
    address && history.push({
      pathname: `/pool/${address}/`,
      state: { api, pathname }
    });
  }, [address, api, history, pathname]);

  const goToSoloStaking = useCallback(() => {
    address && history.push({
      pathname: `/solo/${address}/`,
      state: { api, pathname }
    });
  }, [address, api, history, pathname]);

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

  useEffect(() => {
    if (!address || !account) {
      return;
    }

    chrome.storage.local.get('RecentChains', (res) => {
      const allRecentChains = res?.RecentChains;
      const myRecentChains = allRecentChains?.[address] as string[];

      const suggestedRecent = INITIAL_RECENT_CHAINS_GENESISHASH.filter((chain) => account.genesisHash !== chain);

      myRecentChains ? setRecentChains(myRecentChains) : setRecentChains(suggestedRecent);
    });
  }, [account, account?.genesisHash, address]);

  const chainNamesToShow = useMemo(() => {
    if (!(genesisOptions.length) || !(recentChains?.length) || !account) {
      return undefined;
    }

    const filteredChains = recentChains.map((r) => genesisOptions.find((g) => g.value === r)).filter((chain) => chain?.value !== account.genesisHash).filter((chain) => !isTestnetEnabled ? chain?.value !== WESTEND_GENESIS : true);
    const chainNames = filteredChains.map((chain) => chain && sanitizeChainName(chain.text));

    return chainNames.slice(0, 2);
  }, [account, genesisOptions, isTestnetEnabled, recentChains]);

  const OthersRow = () => (
    <Grid item py='3px'>
      <Grid alignItems='center' container justifyContent='space-between'>
        <Grid item sx={{ fontSize: '16px', fontWeight: 300 }} xs={3}>
          {t('Others')}
        </Grid>
        <Grid item textAlign='right' xs={1.5}>
          <IconButton
            onClick={goToOthers}
            sx={{ p: 0 }}
          >
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Motion>
      <HeaderBrand
        _centerItem={<ChainSwitch address={address} externalChainNamesToShow={chainNamesToShow}>{identicon}</ChainSwitch>}
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
            <Grid item pt='10px' sx={{ height: window.innerHeight - 208, overflowY: 'scroll' }} xs>
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Total'} />
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Transferrable'} onClick={goToSend} />
              {STAKING_CHAINS.includes(genesisHash)
                ? <>
                  <LabelBalancePrice address={address} balances={balanceToShow} label={'Solo Staked'} onClick={goToSoloStaking} />
                  <LabelBalancePrice address={address} balances={balanceToShow} label={'Pool Staked'} onClick={goToPoolStaking} />
                </>
                : <LabelBalancePrice address={address} balances={balanceToShow} label={'Free'} />
              }
              {GOVERNANCE_CHAINS.includes(genesisHash)
                ? <LockedInReferenda address={address} />
                : <LabelBalancePrice address={address} balances={balanceToShow} label={'Locked'} />
              }
              <LabelBalancePrice address={address} balances={balanceToShow} label={'Reserved'} />
              <OthersRow />
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
