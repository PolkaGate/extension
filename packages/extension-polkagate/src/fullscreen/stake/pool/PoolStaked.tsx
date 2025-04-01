// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BalancesInfo, MyPoolInfo } from '../../../util/types';

import { faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { faArrowCircleDown, faCircleDown, faGrip, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { BN } from '@polkadot/util';

import { PoolStakingIcon } from '../../../components';
import { useInfo, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { STAKING_CHAINS } from '../../../util/constants';
import Bread from '../../partials/Bread';
import { Title } from '../../sendFund/InputPage';
import DisplayBalance from '../partials/DisplayBalance';
import StakedBar from '../solo/StakedBar';
import ClaimedRewardsChart from './partials/ClaimedRewardsChart';
import Info from './partials/Info';
import PoolCommonTasks from './partials/PoolCommonTasks';
import { MODAL_IDS } from '.';

interface Props {
  address: string;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  balances: BalancesInfo | undefined;
  pool: MyPoolInfo | null | undefined;
  redeemable: BN | undefined;
  toBeReleased: { amount: BN; date: number; }[] | undefined;
  unlockingAmount: BN | undefined;
}

export default function PoolStaked ({ address, balances, pool, redeemable, setShow, toBeReleased, unlockingAmount }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain } = useInfo(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const staked = useMemo(() => pool === undefined ? undefined : new BN(pool?.member?.points ?? 0), [pool]);
  const claimable = useMemo(() => pool === undefined ? undefined : new BN(pool?.myClaimable ?? 0), [pool]);

  const onUnstake = useCallback(() => {
    staked && !staked?.isZero() && setShow(MODAL_IDS.UNSTAKE);
  }, [setShow, staked]);

  const onStakeOrExtra = useCallback(() => {
    staked?.isZero() && redeemable?.isZero() && unlockingAmount?.isZero()
      ? setShow(MODAL_IDS.STAKE)
      : setShow(MODAL_IDS.STAKE_EXTRA);
  }, [redeemable, setShow, staked, unlockingAmount]);

  const onWithdrawRewards = useCallback(() => {
    claimable && !claimable?.isZero() && setShow(MODAL_IDS.WITHDRAW_REWARDS);
  }, [claimable, setShow]);

  const onStakeRewards = useCallback(() => {
    claimable && !claimable?.isZero() && setShow(MODAL_IDS.STAKE_REWARDS);
  }, [claimable, setShow]);

  const onWithdrawRedeemable = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShow(MODAL_IDS.REDEEM);
  }, [redeemable, setShow]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', px: '2%' }}>
      <Bread />
      <Title
        height='70px'
        logo={
          <PoolStakingIcon color={theme.palette.text.primary} height={50} width={50} />
        }
        ml='-10px'
        padding='0px'
        spacing={0}
        text={t('Staked in Pool')}
      />
      <Grid container item justifyContent='space-between' mb='15px'>
        <Grid container direction='column' item mb='10px' minWidth='735px' rowGap='10px' width='calc(100% - 320px - 3%)'>
          <StakedBar
            availableBalance={balances?.freeBalance}
            balances={balances}
            redeemable={redeemable}
            staked={staked}
            unlockingAmount={unlockingAmount}
          />
          <Grid container item sx={{ overflowY: 'scroll' }}>
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
              icons={[faSquarePlus, faArrowCircleDown]}
              onClicks={[onStakeRewards, onWithdrawRewards]}
              title={t('Claimable rewards')}
            />
            <DisplayBalance
              actions={[t('withdraw')]}
              address={address}
              amount={redeemable}
              icons={[faCircleDown]}
              onClicks={[onWithdrawRedeemable]}
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
              /** to disable action button until fetching has done */
              amount={!staked || !redeemable || !unlockingAmount ? undefined : balances?.freeBalance}
              icons={[faPlus]}
              onClicks={[onStakeOrExtra]}
              title={t('Available to stake')}
            />
            {pool &&
              <>
                <Grid container item justifyContent='center' sx={{ mt: '25px', ml: '2%' }}>
                  <FontAwesomeIcon
                    color={`${theme.palette.text.primary}`}
                    fontSize='25px'
                    icon={faGrip}
                  />
                  <Typography fontSize='18px' fontWeight={500} ml='1%'>
                    {t('Pool information')}
                  </Typography>
                </Grid>
                <ShowPool
                  api={api}
                  chain={chain as any}
                  labelPosition='center'
                  mode='Default'
                  pool={pool}
                  showInfo
                  style={{
                    m: '5px auto 0',
                    width: '95%'
                  }}
                />
              </>
            }
            <Info
              address={address}
            />
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
