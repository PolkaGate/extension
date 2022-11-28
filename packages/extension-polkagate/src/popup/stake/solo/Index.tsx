// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { MembersMapEntry, PoolStakingConsts, StakingConsts } from '../../../util/types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, FormatBalance, HorizontalMenuItem, Identicon, ShowBalance } from '../../../components';
import { useApi, useBalances, useChain, useFormatted, useNominator, useStakingAccount, useStakingConsts, useStakingRewards, useTranslation } from '../../../hooks';
import { HeaderBrand, SubTitle } from '../../../partials';
import { DATE_OPTIONS } from '../../../util/constants';
import AccountBrief from '../../account/AccountBrief';
import { getValue } from '../../account/util';
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
  const { address } = useParams<{ address: AccountId }>();
  const formatted = useFormatted(address);
  const stakingAccount = useStakingAccount(formatted);
  const chain = useChain(address);
  const rewards = useStakingRewards(formatted);
  const api = useApi(address, state?.api);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const balances = useBalances(address);
  const nominatorInfo = useNominator(address);

  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);
  const staked = useMemo(() => stakingAccount?.stakingLedger?.active?.unwrap(), [stakingAccount?.stakingLedger?.active]);

  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>(state?.unlockingAmount);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showUnlockings, setShowUnlockings] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showRedeemableWithdraw, setShowRedeemableWithdraw] = useState<boolean>(false);

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

  useEffect(() => {
    if (!stakingAccount || !sessionInfo) {
      return;
    }

    let unlockingValue = BN_ZERO;
    const toBeReleased = [];

    if (stakingAccount?.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = new BN(value as string);

          unlockingValue = unlockingValue.add(amount);

          const secToBeReleased = (Number(remainingEras) * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }

    setToBeReleased(toBeReleased);
    setUnlockingAmount(unlockingValue);
  }, [sessionInfo, stakingAccount]);

  const onBackClick = useCallback(() => {
    const url = chain?.genesisHash ? `/account/${chain.genesisHash}/${address}/` : '/';

    onAction(url);
  }, [address, chain?.genesisHash, onAction]);

  const goToStake = useCallback(() => {
    history.push({
      pathname: `/solo/stake/${address}`,
      state: { api, pathname, stakingConsts }
    });
  }, [address, api, history, pathname, stakingConsts]);

  const goToUnstake = useCallback(() => {
    history.push({
      pathname: `/solo/unstake/${address}`,
      state: { api, balances, pathname, redeemable, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, pathname, redeemable, stakingConsts, unlockingAmount, stakingAccount]);

  const goToRestake = useCallback(() => {
    history.push({
      pathname: `/solo/restake/${address}`,
      state: { api, balances, pathname, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, pathname, stakingConsts, unlockingAmount, stakingAccount]);

  const goToNominations = useCallback(() => {
    history.push({
      pathname: `/solo/nominations/${address}`,
      state: { api, balances, pathname, redeemable, stakingAccount, stakingConsts, unlockingAmount }
    });
  }, [history, address, api, balances, pathname, redeemable, stakingAccount, stakingConsts, unlockingAmount]);

  const goToInfo = useCallback(() => {
    setShowInfo(true);
  }, []);

  const goToRedeemableWithdraw = useCallback(() => {
    redeemable && !redeemable?.isZero() && setShowRedeemableWithdraw(true);
  }, [redeemable]);

  const ToBeReleased = () => (
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'secondary.main', fontSize: '16px', fontWeight: 500, ml: '7%', mt: '2px', width: '95%' }}>
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
              <Grid container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em' }}>
                {link1Text &&
                  <Grid item onClick={onLink1} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
                    {link1Text}
                  </Grid>
                }
                {link2Text &&
                  <>
                    <Grid alignItems='center' item justifyContent='center' mx='6px'>
                      <Divider orientation='vertical' sx={{ bgcolor: !value || value?.isZero() ? 'text.disabled' : 'text.primary', height: '19px', mt: '10px', width: '2px' }} />
                    </Grid>
                    <Grid item onClick={onLink2} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
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
                    stroke: !toBeReleased?.length ? 'text.disabled' : 'secondary.light',//'#BA2882',
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
            <Divider sx={{ bgcolor: 'secondary.main', m: '2px auto', width: '100%' }} />
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
      value={String(formatted)}
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
        <SubTitle label={t<string>('Solo Staking')} mt='15px' style={{ fontSize: '20px' }} />
        <Grid container maxHeight={window.innerHeight - 250} sx={{ overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none', width: 0 } }}>
          <Row
            label={t('Staked')}
            link1Text={t('Unstake')}
            onLink1={staked && !staked?.isZero() && goToUnstake}
            value={staked}
          />
          <Row
            label={t('Rewards')}
            link1Text={t('Details')}
            value={rewards}
          />
          <Row
            label={t('Redeemable')}
            link1Text={t('Withdraw')}
            onLink1={goToRedeemableWithdraw}
            value={redeemable}
          />
          <Row
            label={t('Unstaking')}
            link1Text={t('Restake')}
            onLink1={unlockingAmount && !unlockingAmount?.isZero() && goToRestake}
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
          icon={<vaadin-icon icon='vaadin:info-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToInfo}
          title={t<string>('Info')}
        />
      </Grid>
      <Info
        api={api}
        info={stakingConsts}
        nominatorInfo={nominatorInfo}
        setShowInfo={setShowInfo}
        showInfo={showInfo}
      />
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
