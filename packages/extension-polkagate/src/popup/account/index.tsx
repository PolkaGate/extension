// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import type { HexString } from '@polkadot/util/types';
import type { FormattedAddressState } from '../../util/types';

import { faCoins, faHistory, faPaperPlane, faPiggyBank, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { isOnRelayChain } from '@polkadot/extension-polkagate/src/util/utils';

import { stakingClose } from '../../assets/icons';
import { ActionContext, Assets, Chain, GenesisHashOptionsContext, HorizontalMenuItem, Identity, Motion } from '../../components';
import { useBalances, useInfo, useMyAccountIdentity, useTranslation } from '../../hooks';
import { tieAccount, windowOpen } from '../../messaging';
import { HeaderBrand, RemoteNodeSelectorWithSignals } from '../../partials';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../util/constants';
import StakingOption from '../staking/Options';
import LockedInReferenda from './unlock/LockedInReferenda';
import AccountBrief from './AccountBrief';
import LabelBalancePrice from './LabelBalancePrice';
import Others from './Others';
import ReservedReasons from './ReservedReasons';

export default function AccountDetails(): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const history = useHistory();
  const onAction = useContext(ActionContext);
  const { pathname } = useLocation();
  const { address, genesisHash } = useParams<FormattedAddressState>();
  const { api, chain, chainName, formatted } = useInfo(address);
  const identity = useMyAccountIdentity(address);
  const genesisOptions = useContext(GenesisHashOptionsContext);

  const [refresh, setRefresh] = useState<boolean>(false);
  const [assetId, setAssetId] = useState<number>();
  const balances = useBalances(address, refresh, setRefresh, false, assetId); // if assetId is undefined and chain is assethub it will fetch native token's balance
  const [showOthers, setShowOthers] = useState<boolean | undefined>(false);
  const [showReservedReasons, setShowReservedReasons] = useState<boolean | undefined>(false);
  const [showStakingOptions, setShowStakingOptions] = useState<boolean>(false);

  const showReservedChevron = useMemo(() => balances && !balances?.reservedBalance.isZero() && isOnRelayChain(genesisHash), [balances, genesisHash]);
  const supportStaking = useMemo(() => STAKING_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
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
    chain && goToAccount();
  }, [chain, goToAccount]);

  const goToSend = useCallback(() => {
    address && windowOpen(`/send/${address}/${assetId || balances?.assetId}`).catch(console.error);
  }, [address, assetId, balances?.assetId]);

  const goToStaking = useCallback(() => {
    supportStaking && setShowStakingOptions(!showStakingOptions);
  }, [showStakingOptions, supportStaking]);

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
    !supportStaking
      ? theme.palette.action.disabledBackground
      : showStakingOptions
        ? theme.palette.secondary.main
        : theme.palette.text.primary
    , [supportStaking, showStakingOptions, theme.palette.action.disabledBackground, theme.palette.secondary.main, theme.palette.text.primary]);

  const goToOthers = useCallback(() => {
    setShowOthers(true);
  }, []);

  const onReservedReasons = useCallback(() => {
    setShowReservedReasons(true);
  }, []);

  const _onChangeNetwork = useCallback((newGenesisHash: string) => {
    const availableGenesisHash = newGenesisHash.startsWith('0x') ? newGenesisHash : null;

    address && tieAccount(address, availableGenesisHash as HexString).catch(console.error);
  }, [address]);

  const _onChangeAsset = useCallback((id: number) => {
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
          <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 0 }} />
        </IconButton>
      </Grid>
    </Grid>
  );

  return (
    <Motion>
      <HeaderBrand
        _centerItem={
          <Identity address={address} api={api} chain={chain} formatted={formatted} identiconSize={35} showSocial={false} style={{ fontSize: '20px', height: '40px', lineHeight: 'initial', maxWidth: '65%' }} subIdOnly />
        }
        address={address}
        fullScreenURL={`/accountfs/${address}/0`}
        noBorder
        onBackClick={gotToHome}
        paddingBottom={0}
        showAccountMenu
        showBackArrow
        showFullScreen
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <AccountBrief address={address} identity={identity} showDivider={false} showName={false} />
        <Grid container justifyContent='space-between'>
          <Chain
            address={address}
            defaultValue={chain?.genesisHash ?? genesisOptions[0].text}
            label={t('Chain')}
            onChange={_onChangeNetwork}
            style={{ width: '56%' }}
          />
          <Assets
            address={address}
            assetId={assetId}
            label={t('Asset')}
            onChange={_onChangeAsset}
            setAssetId={setAssetId}
            style={{ width: '27%' }}
          />
          <Grid alignContent='flex-end' container item justifyContent='center' width='15%' zIndex={1}>
            <RemoteNodeSelectorWithSignals
              address={address}
              iconSize={25}
            />
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.light', height: '2px', mt: '9px' }} />
        {!showStakingOptions
          ? <Grid item pt='10px' sx={{ height: window.innerHeight - 208, overflowY: 'scroll' }} xs>
            {assetId !== undefined
              ? <>
                <LabelBalancePrice address={address} balances={balances} label={'Transferable'} title={t('Transferable')} />
                {balances?.lockedBalance &&
                  <LabelBalancePrice address={address} balances={balances} label={'Locked'} title={t('Locked')} />
                }
                {balances?.reservedBalance && !balances?.lockedBalance &&
                  <LabelBalancePrice address={address} balances={balances} label={'Reserved'} title={t('Reserved')} />
                }
              </>
              : <>
                <LabelBalancePrice address={address} balances={balances} label={'Total'} title={t('Total')} />
                <LabelBalancePrice address={address} balances={balances} label={'Transferable'} onClick={goToSend} title={t('Transferable')} />
                {supportStaking &&
                  <>
                    {balances?.soloTotal && !balances?.soloTotal?.isZero() &&
                      <LabelBalancePrice address={address} balances={balances} label={'Solo Stake'} onClick={goToSoloStaking} title={t('Solo Stake')} />}
                    {balances?.pooledBalance && !balances?.pooledBalance?.isZero() &&
                      <LabelBalancePrice address={address} balances={balances} label={'Pool Stake'} onClick={goToPoolStaking} title={t('Pool Stake')} />
                    }
                  </>
                }
                {GOVERNANCE_CHAINS.includes(genesisHash)
                  ? <LockedInReferenda address={address} refresh={refresh} setRefresh={setRefresh} />
                  : <LabelBalancePrice address={address} balances={balances} label={'Locked'} title={t('Locked')} />
                }
                <LabelBalancePrice address={address} balances={balances} label={'Reserved'} onClick={showReservedChevron ? onReservedReasons : undefined} title={t('Reserved')} />
                <OthersRow />
              </>
            }
          </Grid>
          : <StakingOption balance={balances} setShowStakingOptions={setShowStakingOptions} showStakingOptions={showStakingOptions} />
        }
        <Grid container justifyContent='space-around' sx={{ bgcolor: 'background.default', borderTop: '2px solid', borderTopColor: 'secondary.light', bottom: 0, height: '62px', left: '4%', position: 'absolute', pt: '7px', pb: '5px', width: '92%' }}>
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
            title={t('Send')}
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
            title={t('Governance')}
          />
          <HorizontalMenuItem
            divider
            icon={
              showStakingOptions
                ? <Box component='img' src={stakingClose as string} width='30px' />
                : <FontAwesomeIcon
                  color={stakingIconColor}
                  icon={faCoins}
                  size='lg'
                />
            } onClick={goToStaking}
            textDisabled={!supportStaking}
            title={t('Stake')}
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
            title={t('Crowdloan')}
          />
          <HorizontalMenuItem
            icon={
              <FontAwesomeIcon
                color={`${theme.palette.text.primary}`}
                icon={faHistory}
                size='lg'
              />}
            onClick={goToHistory}
            title={t('History')}
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
      {showReservedReasons && balances &&
        <ReservedReasons
          address={address}
          assetId={balances?.assetId}
          identity={identity}
          setShow={setShowReservedReasons}
          show={showReservedReasons}
        />
      }
    </Motion>
  );
}
