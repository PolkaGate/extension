// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId, AccountId32 } from '@polkadot/types/interfaces';
import type { MembersMapEntry, NominatorInfo, PoolStakingConsts, StakingConsts } from '../../../util/types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, FormatBalance, HorizontalMenuItem, Identicon, ShowBalance } from '../../../components';
import { useApi, useBalances, useChain, useEndpoint2, useFormatted, useMapEntries, usePool, usePoolConsts, useStakingConsts, useTranslation, useValidators } from '../../../hooks';
import { HeaderBrand, SubTitle } from '../../../partials';
import { DATE_OPTIONS } from '../../../util/constants';
import AccountBrief from '../../account/AccountBrief';
import { getValue } from '../../account/util';
import RewardsStakeReview from './rewards/Stake';
import RewardsWithdrawReview from './rewards/Withdraw';
import Info from './Info';
import RedeemableWithdrawReview from './redeem';

const OPT_ENTRIES = {
  transform: (entries: [StorageKey<[AccountId32]>, Option<PalletNominationPoolsPoolMember>][]): MembersMapEntry[] =>
    entries.reduce((all: MembersMapEntry[], [{ args: [accountId] }, optMember]) => {
      if (optMember.isSome) {
        const member = optMember.unwrap();
        const poolId = member.poolId.toString();

        if (!all[poolId]) {
          all[poolId] = [];
        }

        all[poolId].push({
          accountId: accountId.toString(),
          member
        });
      }

      return all;
    }, {})
};

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

interface State {
  api?: ApiPromise;
  stakingConsts?: StakingConsts;
  poolConsts?: PoolStakingConsts;
}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();
  const history = useHistory();
  const { pathname, state } = useLocation<State>();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const endpoint = useEndpoint2(address);
  const api = useApi(address, state?.api);
  const pool = usePool(address,undefined, state?.pool);
  // const validators = useValidators(address);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const consts = usePoolConsts(address, state?.poolConsts);
  const balances = useBalances(address);

  const staked = pool === undefined ? undefined : new BN(pool?.member?.points ?? 0);
  const claimable = useMemo(() => pool === undefined ? undefined : new BN(pool?.myClaimable ?? 0), [pool]);
  const nominatedValidatorsId: AccountId[] | undefined | null = pool === null || pool?.stashIdAccount?.nominators?.length === 0 ? null : pool?.stashIdAccount?.nominators;

  const [redeemable, setRedeemable] = useState<BN | undefined>(state?.redeemable);
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>(state?.unlockingAmount);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showUnlockings, setShowUnlockings] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showRewardStake, setShowRewardStake] = useState<boolean>(false);
  const [showRewardWithdraw, setShowRewardWithdraw] = useState<boolean>(false);
  const [showRedeemableWithdraw, setShowRedeemableWithdraw] = useState<boolean>(false);

  const [nominatorInfo, setNominatorInfo] = useState<NominatorInfo | undefined>();
  const [currentEraIndexOfStore, setCurrentEraIndexOfStore] = useState<number | undefined>();
  const [gettingNominatedValidatorsInfoFromChain, setGettingNominatedValidatorsInfoFromChain] = useState<boolean>(true);
  const [validatorsInfoIsUpdated, setValidatorsInfoIsUpdated] = useState<boolean>(false);
  const [validatorsIdentitiesIsFetched, setValidatorsIdentitiesIsFetched] = useState<boolean>(false);
  const [validatorsIdentities, setValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();
  const [localStrorageIsUpdate, setStoreIsUpdate] = useState<boolean>(false);
  const [currentEraIndex, setCurrentEraIndex] = useState<number | undefined>(state?.currentEraIndex);
  const poolsMembers: MembersMapEntry[] | undefined = useMapEntries(api?.query?.nominationPools?.poolMembers, OPT_ENTRIES);
  const [selectedValidators, setSelectedValidatorsAcounts] = useState<DeriveStakingQuery[] | null>(null);
  const [noNominatedValidators, setNoNominatedValidators] = useState<boolean | undefined>();// if TRUE, shows that nominators are fetched but is empty
  const [nominatedValidators, setNominatedValidatorsInfo] = useState<DeriveStakingQuery[] | null>(null);
  const [oversubscribedsCount, setOversubscribedsCount] = useState<number | undefined>();
  const [activeValidator, setActiveValidator] = useState<DeriveStakingQuery>();

  const _toggleShowUnlockings = useCallback(() => setShowUnlockings(!showUnlockings), [showUnlockings]);

  useEffect(() => {
    api && api.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
      });
    });
  }, [api]);

  useEffect((): void => {
    api && api.query.staking.currentEra().then((ce) => {
      setCurrentEraIndex(Number(ce));
    });
  }, [api]);

  useEffect(() => {
    if (pool === undefined || !api || !currentEraIndex || !sessionInfo) {
      return;
    }

    let unlockingValue = BN_ZERO;
    let redeemValue = BN_ZERO;
    const toBeReleased = [];

    if (pool !== null && pool.member?.unbondingEras) { // if pool is fetched but account belongs to no pool then pool===null
      for (const [era, unbondingPoint] of Object.entries(pool.member?.unbondingEras)) {
        const remainingEras = Number(era) - currentEraIndex;

        if (remainingEras < 0) {
          redeemValue = redeemValue.add(new BN(unbondingPoint as string));
        } else {
          const amount = new BN(unbondingPoint as string);

          unlockingValue = unlockingValue.add(amount);

          const secToBeReleased = (remainingEras * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }

    setToBeReleased(toBeReleased);
    setRedeemable(redeemValue);
    setUnlockingAmount(unlockingValue);
  }, [pool, api, currentEraIndex, sessionInfo]);

  const onBackClick = useCallback(() => {
    const url = chain?.genesisHash ? `/account/${chain.genesisHash}/${address}/` : '/';

    onAction(url);
  }, [address, chain?.genesisHash, onAction]);

  const goToStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { api, consts, pathname, pool, stakingConsts }
    });
  }, [address, api, consts, history, pool, pathname, stakingConsts]);

  const goToUnstake = useCallback(() => {
    history.push({
      pathname: `/pool/unstake/${address}`,
      state: { api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, claimable, consts, pool, pathname, redeemable, unlockingAmount, stakingConsts]);

  const goToNominations = useCallback(() => {
    history.push({
      pathname: `/pool/nominations/${address}`,
      state: { api, balances, claimable, consts, pathname, pool, redeemable, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, claimable, consts, pool, pathname, redeemable, unlockingAmount, stakingConsts]);

  const goToInfo = useCallback(() => {
    setShowInfo(true);
  }, []);

  const goToPool = useCallback(() => {
    history.push({
      pathname: `/pool/stake/pool/${address}`,
      state: { api, pool }
    });
  }, [address, api, history, pool]);

  const goToRewardWithdraw = useCallback(() => {
    claimable && !claimable?.isZero() && setShowRewardWithdraw(true);
  }, [claimable]);

  const goToRewardStake = useCallback(() => {
    claimable && !claimable?.isZero() && setShowRewardStake(true);
  }, [claimable]);

  const goToRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShowRedeemableWithdraw(true);
  }, [redeemable]);

  const ToBeReleased = () => (
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'secondary.main', fontSize: '16px', fontWeight: 500, ml: '7%', mt: '10px', width: '93%' }}>
      <Grid item pt='10px' xs={12}>
        {t('To be released')}
      </Grid>
      {toBeReleased?.map(({ amount, date }) => (
        <Grid container item key={date} spacing='15px' sx={{ fontSize: '16px', fontWeight: 500 }}>
          <Grid fontWeight={300} item>
            {new Date(date).toLocaleDateString(undefined, DATE_OPTIONS)}
          </Grid>
          <Grid fontWeight={400} item>
            <FormatBalance api={api} decimalPoint={2} value={amount} />
          </Grid>
        </Grid>))
      }
    </Grid>
  );

  const Row = ({ label, link1Text, link2Text, onLink1, onLink2, showDivider = true, value }: { label: string, value: BN | undefined, link1Text?: Text, onLink1?: () => void, link2Text?: Text, onLink2?: () => void, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='10px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }} xs={5}>
            {label}
          </Grid>
          <Grid container item justifyContent='flex-end' xs>
            <Grid alignItems='flex-end' container direction='column' item xs>
              <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }} >
                <ShowBalance api={api} balance={value} decimalPoint={2} />
              </Grid>
              <Grid alignItems='center' container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400, mt: '5px' }}>
                {link1Text &&
                  <Grid item onClick={onLink1} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', textDecorationLine: 'underline' }} >
                    {link1Text}
                  </Grid>
                }
                {link2Text &&
                  <>
                    <Grid alignItems='center' item justifyContent='center' mx='10px'>
                      <Divider orientation='vertical' sx={{ bgcolor: !value || value?.isZero() ? 'text.disabled' : 'text.primary', height: '19px', mt: '3px', width: '2px' }} />
                    </Grid>
                    <Grid item onClick={onLink2} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', textDecorationLine: 'underline' }}>
                      {link2Text}
                    </Grid>
                  </>
                }
              </Grid>
            </Grid>
            {label === 'Unstaking' &&
              <Grid alignItems='center' container item onClick={_toggleShowUnlockings} sx={{ ml: '25px' }} xs={1}>
                <ArrowForwardIosIcon
                  sx={{
                    color: !toBeReleased?.length ? 'text.disabled' : 'secondary.light',
                    cursor: 'pointer',
                    fontSize: 18,
                    m: 'auto',
                    stroke: !toBeReleased?.length ? 'text.disabled' : 'secondary.light',
                    strokeWidth: '2px',
                    transform: showUnlockings ? 'rotate(-90deg)' : 'rotate(90deg)'
                  }}
                />
              </Grid>
            }
          </Grid>
        </Grid>
        {label === 'Unstaking' && showUnlockings && !!toBeReleased?.length &&
          <ToBeReleased />
        }
        {showDivider &&
          <Grid container item justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'secondary.main', mt: '10px', width: '100%' }} />
          </Grid>
        }
      </>
    );
  };

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  return (
    <>
      <HeaderBrand
        _centerItem={identicon}
        noBorder
        onBackClick={onBackClick}
        paddingBottom={0}
        showBackArrow
        showClose
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <AccountBrief address={address} />
        <SubTitle label={t<string>('Pool Staking')} mt='15px' style={{ fontSize: '20px' }} />
        <Grid container maxHeight={window.innerHeight - 254} sx={{ overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none', width: 0 } }}>
          <Row
            label={t('Staked')}
            link1Text={t('Unstake')}
            onLink1={staked && !staked?.isZero() && goToUnstake}
            value={staked}
          />
          <Row
            label={t('Rewards')}
            link1Text={t('Withdraw')}
            link2Text={t('Stake')}
            onLink1={goToRewardWithdraw}
            onLink2={goToRewardStake}
            value={claimable}
          />
          <Row
            label={t('Redeemable')}
            link1Text={t('Withdraw')}
            onLink1={goToRedeemableWithdraw}
            value={redeemable}
          />
          <Row
            label={t('Unstaking')}
            //  link1Text={t('Restake')} 
            value={unlockingAmount}
          />
          <Row
            label={t('Available to stake')}
            showDivider={false}
            value={getValue('available', balances)}
          />
        </Grid>
      </Container>
      <Grid container justifyContent='space-around' sx={{ borderTop: '2px solid', borderTopColor: 'secondary.main', bottom: 0, left: '4%', position: 'absolute', py: '10px', width: '92%' }}>
        <HorizontalMenuItem
          divider
          icon={<vaadin-icon icon='vaadin:plus-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToStake}
          title={t<string>('Stake')}
        />
        <HorizontalMenuItem
          divider
          exceptionWidth={30}
          icon={<vaadin-icon icon='vaadin:hand' style={{ height: '28px', color: `${theme.palette.text.primary}`, m: 'auto' }} />}
          onClick={goToNominations}
          title={t<string>('Validators')}
        />
        <HorizontalMenuItem
          divider
          icon={<vaadin-icon icon='vaadin:grid-small' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToPool}
          title={t<string>('Pool')}
        />
        <HorizontalMenuItem
          icon={<vaadin-icon icon='vaadin:info-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToInfo}
          title={t<string>('Info')}
        />
      </Grid>
      <Info api={api} info={consts} setShowInfo={setShowInfo} showInfo={showInfo} />
      {showRewardStake && formatted && api && claimable && staked && chain &&
        <RewardsStakeReview
          address={address}
          amount={claimable}
          api={api}
          chain={chain}
          formatted={formatted}
          setShow={setShowRewardStake}
          show={showRewardStake}
          staked={staked}
        />}
      {showRewardWithdraw && formatted && api && getValue('available', balances) && chain && claimable &&
        <RewardsWithdrawReview
          address={address}
          amount={claimable}
          api={api}
          available={getValue('available', balances)}
          chain={chain}
          formatted={formatted}
          setShow={setShowRewardWithdraw}
          show={showRewardWithdraw}
        />}
      {showRedeemableWithdraw && formatted && api && getValue('available', balances) && chain &&
        <RedeemableWithdrawReview
          address={address}
          amount={redeemable}
          api={api}
          available={getValue('available', balances)}
          chain={chain}
          formatted={formatted}
          setShow={setShowRedeemableWithdraw}
          show={showRedeemableWithdraw}
        />}
    </>
  );
}
