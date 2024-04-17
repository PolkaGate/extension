// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { BalancesInfo, MyPoolInfo } from '../../../util/types';

import { faArrowCircleDown, faCircleDown, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { BN, BN_ZERO } from '@polkadot/util';

import { PoolStakingIcon } from '../../../components';
import { useInfo, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { STAKING_CHAINS } from '../../../util/constants';
import { openOrFocusTab } from '../../accountDetailsFullScreen/components/CommonTasks';
import { Title } from '../../sendFund/InputPage';
import DisplayBalance from '../partials/DisplayBalance';
import ClaimedRewardsChart from './partials/ClaimedRewardsChart';
import PoolCommonTasks from './partials/PoolCommonTasks';
import { MODAL_IDS } from '.';

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

interface Props {
  address: string;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  balances: BalancesInfo | undefined;
  pool: MyPoolInfo | null | undefined;
}

export default function PoolStaked ({ address, balances, pool, setShow }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain } = useInfo(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const staked = useMemo(() => pool === undefined ? undefined : new BN(pool?.member?.points ?? 0), [pool]);
  const claimable = useMemo(() => pool === undefined ? undefined : new BN(pool?.myClaimable ?? 0), [pool]);

  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [currentEraIndex, setCurrentEraIndex] = useState<number | undefined>();

  const { redeemable, toBeReleased, unlockingAmount } = useMemo(() => {
    if (pool === undefined || !api || !currentEraIndex || !sessionInfo) {
      return { redeemable: undefined, toBeReleased: undefined, unlockingAmount: undefined };
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

    return { redeemable: redeemValue, toBeReleased, unlockingAmount: unlockingValue };
  }, [api, currentEraIndex, pool, sessionInfo]);

  useEffect(() => {
    api && api.derive.session?.progress().then((info) => {
      setSessionInfo({
        currentEra: Number(info.currentEra),
        eraLength: Number(info.eraLength),
        eraProgress: Number(info.eraProgress)
      });
    });
  }, [api]);

  useEffect((): void => {
    api && api.query.staking && api.query.staking.currentEra().then((ce) => {
      setCurrentEraIndex(Number(ce));
    });
  }, [api]);

  const onUnstake = useCallback(() => {
    staked && !staked?.isZero() && setShow(MODAL_IDS.UNSTAKE);
  }, [setShow, staked]);

  const onStakeOrExtra = useCallback(() => {
    staked && !staked.isZero()
      ? setShow(MODAL_IDS.STAKE_EXTRA)
      : setShow(MODAL_IDS.STAKE);
  }, [setShow, staked]);

  const goToRewardWithdraw = useCallback(() => {
    claimable && !claimable?.isZero() && setShow(MODAL_IDS.WITHDRAW_REWARDS);
  }, [claimable, setShow]);

  const goToRewardStake = useCallback(() => {
    claimable && !claimable?.isZero() && setShow(MODAL_IDS.STAKE_REWARDS);
  }, [claimable, setShow]);

  const goToRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShow(MODAL_IDS.REDEEM);
  }, [redeemable, setShow]);

  const onBack = useCallback(() => {
    openOrFocusTab(`/accountfs/${address}/0`, true);
  }, [address]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', px: '5%' }}>
      <Title
        logo={
          <PoolStakingIcon color={theme.palette.text.primary} height={60} width={60} />
        }
        onBackClick={onBack}
        text={t('Staked in Pool')}
      />
      <Grid container item justifyContent='space-between' mb='15px'>
        <Grid container direction='column' item mb='10px' minWidth='735px' rowGap='10px' width='calc(100% - 320px - 3%)'>
          <Grid container sx={{ overflowY: 'scroll' }}>
            <DisplayBalance
              actions={[t('unstake')]}
              address={address}
              amount={staked}
              icons={[faMinus]}
              marginTop='0px'
              onClicks={[onUnstake]}
              title={t('Staked')}
            />
            <DisplayBalance
              actions={[t('stake'), t('withdraw')]}
              address={address}
              amount={claimable}
              icons={[faPlus, faCircleDown]}
              onClicks={[goToRewardStake, goToRewardWithdraw]}
              title={t('Rewards')}
            />
            <DisplayBalance
              actions={[t('withdraw')]}
              address={address}
              amount={redeemable}
              icons={[faArrowCircleDown]}
              onClicks={[goToRedeemableWithdraw]}
              title={t('Redeemable')}
            />
            <DisplayBalance
              address={address}
              amount={unlockingAmount}
              isUnstaking
              title={t('Unstaking')}
              toBeReleased={toBeReleased}
            />
            <DisplayBalance
              actions={[staked && !staked.isZero() ? t('stake extra') : t('stake')]}
              address={address}
              amount={getValue('available', balances)}
              icons={[faPlus]}
              onClicks={[onStakeOrExtra]}
              title={t('Available to stake')}
            />
            {pool &&
              <ShowPool
                api={api}
                chain={chain}
                label={t('Pool')}
                labelPosition='center'
                mode='Default'
                pool={pool}
                showInfo
                style={{
                  m: '20px auto 0',
                  width: '100%'
                }}
              />
            }
          </Grid>
        </Grid>
        <Grid container direction='column' gap='15px' item width='320px'>
          <ClaimedRewardsChart
            address={address}
          />
          <PoolCommonTasks
            address={address}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
