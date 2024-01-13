// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
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
import { Box, Container, Divider, Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { stakingClose } from '../../assets/icons';
import { ActionContext, Assets, Chain, HorizontalMenuItem, Identity, Motion } from '../../components';
import { useApi, useBalances, useChain, useChainName, useFormatted, useGenesisHashOptions, useMyAccountIdentity, useTranslation } from '../../hooks';
import { tieAccount, windowOpen } from '../../messaging';
import { HeaderBrand } from '../../partials';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../util/constants';
import { BalancesInfo, FormattedAddressState } from '../../util/types';
import StakingOption from '../staking/Options';
import LockedInReferenda from './unlock/LockedInReferenda';
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
  const chain = useChain(address);
  const chainName = useChainName(address);

  const genesisOptions = useGenesisHashOptions();

  const [refresh, setRefresh] = useState<boolean | undefined>(false);
  const [assetId, setAssetId] = useState<number>();
  const balances = useBalances(address, refresh, setRefresh, false, assetId);
  const [balanceToShow, setBalanceToShow] = useState<BalancesInfo>();
  const [showOthers, setShowOthers] = useState<boolean | undefined>(false);
  const [showStakingOptions, setShowStakingOptions] = useState<boolean>(false);

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
    address && windowOpen(`/send/${address}/${assetId}`).catch(console.error);
  }, [address, assetId]);

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
    formatted && GOVERNANCE_CHAINS.includes(genesisHash) && windowOpen(`/governance/${address}/referenda`).catch(console.error);
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

  const _onChangeNetwork = useCallback((newGenesisHash: string) => {
    const availableGenesisHash = newGenesisHash.startsWith('0x') ? newGenesisHash : null;

    address && tieAccount(address, availableGenesisHash).catch(console.error);
  }, [address]);

  const _onChangeAsset = useCallback((id: number) => {
    if (id === -1) { // this is the id of native token
      return setAssetId(undefined);
    }

    setAssetId(id);
  }, []);

  const OthersRow = () => (
    <Grid alignItems='center' container item justifyContent='space-between' pb='20px' pt='9px'>
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
  );

  return (
    <Motion>
      <HeaderBrand
        _centerItem={
          <Identity address={address} api={api} chain={chain} formatted={formatted} identiconSize={40} showSocial={false} style={{ fontSize: '32px', height: '40px', lineHeight: 'initial', maxWidth: '75%' }} subIdOnly />
        }
        address={address}
        noBorder
        onBackClick={gotToHome}
        paddingBottom={0}
        showAccountMenu
        showBackArrow
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <AccountBrief address={address} identity={identity} showDivider={false} showName={false} />
        <Grid container justifyContent='space-between'>
          <Chain
            address={address}
            defaultValue={chain?.genesisHash ?? genesisOptions[0].text}
            label={t<string>('Chain')}
            onChange={_onChangeNetwork}
            style={{ width: '60%' }}
          />
          <Assets
            address={address}
            assetId={assetId}
            defaultValue={-1}
            label={t<string>('Asset')}
            onChange={_onChangeAsset}
            setAssetId={setAssetId}
            style={{ width: '35%' }}
          />
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '9px' }} />
        {!showStakingOptions
          ? <Grid item pt='10px' sx={{ height: window.innerHeight - 208, overflowY: 'scroll' }} xs>
            {assetId !== undefined
              ? <LabelBalancePrice address={address} balances={balanceToShow} label={'Balance'} title={t('Balance')} />
              : < >
                <LabelBalancePrice address={address} balances={balanceToShow} label={'Total'} title={t('Total')} />
                <LabelBalancePrice address={address} balances={balanceToShow} label={'Transferable'} title={t('Transferable')} onClick={goToSend} />
                {STAKING_CHAINS.includes(genesisHash)
                  ? <>
                    <LabelBalancePrice address={address} balances={balanceToShow} label={'Solo Stake'} title={t('Solo Stake')} onClick={goToSoloStaking} />
                    <LabelBalancePrice address={address} balances={balanceToShow} label={'Pool Stake'} title={t('Pool Stake')} onClick={goToPoolStaking} />
                  </>
                  : <LabelBalancePrice address={address} balances={balanceToShow} label={'Free'} title={t('Free')} />
                }
                {GOVERNANCE_CHAINS.includes(genesisHash)
                  ? <LockedInReferenda address={address} refresh={refresh} setRefresh={setRefresh} />
                  : <LabelBalancePrice address={address} balances={balanceToShow} label={'Locked'} title={t('Locked')} />
                }
                <LabelBalancePrice address={address} balances={balanceToShow} label={'Reserved'} title={t('Reserved')} />
                <OthersRow />
              </>
            }
          </Grid>
          : <StakingOption showStakingOptions={showStakingOptions} setShowStakingOptions={setShowStakingOptions} />
        }
        <Grid container justifyContent='space-around' sx={{ bgcolor: 'background.default', borderTop: '2px solid', borderTopColor: 'secondary.main', bottom: 0, height: '62px', left: '4%', position: 'absolute', pt: '7px', pb: '5px', width: '92%' }} >
          <HorizontalMenuItem
            divider
            icon={
              <FontAwesomeIcon
                color={theme.palette.text.primary}
                icon={faPaperPlane}
                size='lg'
              />
            }
            onClick={goToSend}
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
            textDisabled={!GOVERNANCE_CHAINS.includes(genesisHash)}
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
            textDisabled={!STAKING_CHAINS.includes(genesisHash)}
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
            textDisabled={!CROWDLOANS_CHAINS.includes(genesisHash)}
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
