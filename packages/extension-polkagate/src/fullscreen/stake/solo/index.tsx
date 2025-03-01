// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '@polkadot/extension-polkagate/src/util/types';

import { Boy as BoyIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { useBalances, useFullscreen, useStakingAccount, useTranslation, useUnSupportedNetwork } from '../../../hooks';
import { FULLSCREEN_WIDTH, STAKING_CHAINS } from '../../../util/constants';
import { openOrFocusTab } from '../../accountDetails/components/CommonTasks';
import FullScreenHeader from '../../governance/FullScreenHeader';
import Bread from '../../partials/Bread';
import { Title } from '../../sendFund/InputPage';
import Entry from '../Entry';
import { STEPS } from '..';
import FastUnstake from './fastUnstake';
import Pending from './pending';
import Redeem from './redeem';
import Restake from './restake';
import StakedSolo from './StakedSolo';
import StakeMore from './stakeExtra';
import Unstake from './unstake';

export const MODAL_IDS = {
  NONE: 0,
  UNSTAKE: 1,
  FAST_UNSTAKE: 2,
  PENDING: 3,
  REDEEM: 4,
  RE_STAKE: 5,
  STAKE: 6,
  STAKE_EXTRA: 7
};

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();

  useFullscreen();

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [refresh, setRefresh] = useState<boolean>(false);
  const stakingAccount = useStakingAccount(address, undefined, refresh, setRefresh);
  const balances = useBalances(address, refresh, setRefresh);

  const [showId, setShow] = useState<number>(MODAL_IDS.NONE);
  const [step, setStep] = useState<number>(STEPS.STAKE_SOLO);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);

  const onBack = useCallback(() => {
    openOrFocusTab(`/solofs/${address}/`, true);
  }, [address]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='stake' unableToChangeAccount />
      {showId !== MODAL_IDS.STAKE &&
        <StakedSolo
          balances={balances}
          refresh={refresh}
          setRefresh={setRefresh}
          setShow={setShow}
          stakingAccount={stakingAccount}
        />}
      {showId === MODAL_IDS.UNSTAKE &&
        <Unstake
          address={address}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />}
      {showId === MODAL_IDS.FAST_UNSTAKE &&
        <FastUnstake
          address={address}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />}
      {showId === MODAL_IDS.PENDING &&
        <Pending
          address={address}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />}
      {showId === MODAL_IDS.REDEEM &&
        <Redeem
          address={address}
          redeemable={redeemable}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />}
      {showId === MODAL_IDS.RE_STAKE &&
        <Restake
          address={address}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />}
      {showId === MODAL_IDS.STAKE_EXTRA &&
        <StakeMore
          address={address}
          setRefresh={setRefresh}
          setShow={setShow}
          show={true}
        />}
      {showId === MODAL_IDS.STAKE && // this is not a modal
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '4%' }}>
          <Bread />
          <Title
            height='85px'
            logo={<BoyIcon sx={{ color: 'text.primary', fontSize: '50px' }} />}
            ml='-25px'
            padding='0px'
            spacing={0}
            text={step === STEPS.SOLO_REVIEW
              ? t('Review')
              : step === STEPS.CONFIRM
                ? t('Confirmation')
                : t('Solo Staking')}
          />
          <Entry
            onBack={onBack}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
            txInfo={txInfo}
          />
        </Grid>
      }
    </Grid>
  );
}
