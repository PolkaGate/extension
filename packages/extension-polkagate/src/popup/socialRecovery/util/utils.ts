// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsPoolMember, PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { ApiPromise } from '@polkadot/api';
import { Balance } from '@polkadot/types/interfaces';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import getPoolAccounts from '../../../util/getPoolAccounts';
import { SessionInfo } from './types';

export const checkLostAccountBalance = (
  api: ApiPromise,
  lostAccountAddress: string,
  setLostAccountBalance: (value: React.SetStateAction<Balance | undefined>) => void,
  setLostAccountReserved: (value: React.SetStateAction<BN | undefined>) => void
) => {
  api.derive.balances.all(lostAccountAddress).then((b) => {
    setLostAccountBalance(b.availableBalance);
    setLostAccountReserved(b.reservedBalance);
  }).catch(console.error);
};

export const checkLostAccountSoloStakedBalance = (
  api: ApiPromise,
  lostAccountAddress: string,
  sessionInfo: SessionInfo,
  setLostAccountSoloStakingBalance: React.Dispatch<React.SetStateAction<BN | undefined>>,
  setLostAccountSoloUnlock: React.Dispatch<React.SetStateAction<{ amount: BN; date: number; } | undefined>>,
  setLostAccountRedeemable: React.Dispatch<React.SetStateAction<{ amount: Balance; count: number; } | undefined>>
) => {
  api.derive.staking.account(lostAccountAddress).then((s) => {
    setLostAccountSoloStakingBalance(new BN(s.stakingLedger.active.toString()));

    let unlockingValue = BN_ZERO;
    const toBeReleased: { amount: BN, date: number }[] = [];

    if (s?.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(s.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = new BN(value as unknown as string);

          unlockingValue = unlockingValue.add(amount);

          const secToBeReleased = (Number(remainingEras) * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }

    api.query.staking.slashingSpans(lostAccountAddress).then((span) => {
      const spanCount = span.isNone ? 0 : span.unwrap().prior.length as number + 1;
      const BZ = api.createType('Balance', BN_ZERO);

      setLostAccountRedeemable({ amount: s.redeemable ?? BZ, count: spanCount });
    }).catch(console.error);

    setLostAccountSoloUnlock({ amount: unlockingValue, date: toBeReleased.at(-1)?.date ?? 0 });
  }).catch(console.error);
};

export const checkLostAccountClaimedStatus = (
  api: ApiPromise,
  rescuerAccountAddress: string,
  lostAccountAddress: string,
  setAlreadyClaimed: React.Dispatch<React.SetStateAction<boolean | undefined>>
) => {
  api.query.recovery.proxy(rescuerAccountAddress).then((p) => {
    if (p.isEmpty) {
      setAlreadyClaimed(false);

      return;
    }

    const proxies: string = p.toHuman() as string;

    setAlreadyClaimed(proxies === lostAccountAddress);
  }).catch(console.error);
};

export const checkLostAccountPoolStakedBalance = (
  api: ApiPromise,
  lostAccountAddress: string,
  sessionInfo: SessionInfo,
  setLostAccountPoolStakingBalance: React.Dispatch<React.SetStateAction<{ amount: BN; hasRole: boolean; } | undefined>>,
  setLostAccountPoolUnlock: React.Dispatch<React.SetStateAction<{ amount: BN; date: number; } | undefined>>,
  setLostAccountPoolRedeemable: React.Dispatch<React.SetStateAction<{ amount: BN; count: number; } | undefined>>
) => {
  api.query.nominationPools.poolMembers(lostAccountAddress).then(async (res) => {
    const member = res?.unwrapOr(undefined) as PalletNominationPoolsPoolMember | undefined;

    if (!member) {
      setLostAccountPoolStakingBalance({ amount: BN_ZERO, hasRole: false });
      setLostAccountPoolUnlock({ amount: BN_ZERO, date: 0 });
      setLostAccountPoolRedeemable({ amount: BN_ZERO, count: 0 });

      return;
    }

    const poolId = member.poolId;
    const accounts = poolId && getPoolAccounts(api, poolId);

    if (!accounts) {
      setLostAccountPoolStakingBalance({ amount: BN_ZERO, hasRole: false });
      setLostAccountPoolUnlock({ amount: BN_ZERO, date: 0 });
      setLostAccountPoolRedeemable({ amount: BN_ZERO, count: 0 });

      return;
    }

    const [bondedPool, stashIdAccount] = await Promise.all([
      api.query.nominationPools.bondedPools(poolId),
      api.derive.staking.account(accounts.stashId)
    ]);

    const bondedPoolInfo: PalletNominationPoolsBondedPoolInner = bondedPool.unwrap() as PalletNominationPoolsBondedPoolInner;

    const active = member.points.isZero()
      ? BN_ZERO
      : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPoolInfo?.points ?? BN_ONE)));
    // const rewards = myClaimable as Balance;
    let unlockingValue = BN_ZERO;
    let redeemValue = BN_ZERO;
    const toBeReleased = [];

    if (member && !member.unbondingEras.isEmpty) {
      for (const [era, unbondingPoint] of Object.entries(member.unbondingEras.toJSON())) {
        const remainingEras = Number(era) - sessionInfo.currentEra;

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

    api.query.staking.slashingSpans(lostAccountAddress).then((span) => {
      const spanCount = span.isNone ? 0 : span.unwrap().prior.length as number + 1;

      setLostAccountPoolRedeemable({ amount: redeemValue, count: spanCount });
    }).catch(console.error);

    const hasRole = [bondedPoolInfo.roles.depositor.toString(), bondedPoolInfo.roles.root.toString(), bondedPoolInfo.roles.nominator.toString(), bondedPoolInfo.roles.nominator.toString()].includes(String(lostAccountAddress));

    setLostAccountPoolUnlock({ amount: unlockingValue, date: toBeReleased.at(-1)?.date ?? 0 });
    setLostAccountPoolStakingBalance({ amount: active, hasRole });
  }).catch(console.error);
};

export const checkLostAccountIdentity = (
  accountsInfo: DeriveAccountInfo[],
  lostAccountAddress: string,
  setLostAccountIdentity: React.Dispatch<React.SetStateAction<boolean | undefined>>
) => {
  const hasId = !!accountsInfo.find((accountInfo) => accountInfo.accountId?.toString() === lostAccountAddress);

  setLostAccountIdentity(hasId);
};

export const checkLostAccountProxy = (
  api: ApiPromise,
  lostAccountAddress: string,
  setLostAccountProxy: React.Dispatch<React.SetStateAction<boolean | undefined>>
) => {
  api.query.proxy.proxies(lostAccountAddress).then((p) => {
    const proxies = p.toHuman() as [][];

    setLostAccountProxy(proxies[0].length > 0);
  }).catch(console.error);
};

export const checkLostAccountRecoverability = (
  api: ApiPromise,
  lostAccountAddress: string,
  setLostAccountRecoveryInfo: React.Dispatch<React.SetStateAction<false | PalletRecoveryRecoveryConfig | null | undefined>>
) => {
  setLostAccountRecoveryInfo(undefined);

  api.query.recovery && api.query.recovery.recoverable(lostAccountAddress).then((r) => {
    if (r.isSome) {
      const unwrappedResult = r.unwrap();

      const modifiedResult = {
        lostAccount: lostAccountAddress,
        delayPeriod: unwrappedResult.delayPeriod,
        threshold: unwrappedResult.threshold,
        deposit: unwrappedResult.deposit,
        friends: unwrappedResult.friends
      } as unknown as PalletRecoveryRecoveryConfig;

      setLostAccountRecoveryInfo(modifiedResult);

      return;
    }

    setLostAccountRecoveryInfo(null);
  }).catch(console.error);
};
