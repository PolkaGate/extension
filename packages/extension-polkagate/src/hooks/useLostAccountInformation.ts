// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { SessionInfo, WithdrawInfo } from '../popup/socialRecovery/util/types';
import { checkLostAccountBalance, checkLostAccountClaimedStatus, checkLostAccountIdentity, checkLostAccountPoolStakedBalance, checkLostAccountProxy, checkLostAccountRecoverability, checkLostAccountSoloStakedBalance } from '../popup/socialRecovery/util/utils';

export default function useLostAccountInformation(accountsInfo: DeriveAccountInfo[] | undefined, api: ApiPromise | undefined, lostAccountAddress: string | undefined, rescuerAccountAddress: string | undefined, sessionInfo: SessionInfo | undefined, refresh: boolean): WithdrawInfo | undefined {
  const [lostAccountInformation, setLostAccountInformation] = useState<WithdrawInfo>();
  const [fetching, setFetching] = useState<boolean>(false);
  const [lostAccountBalance, setLostAccountBalance] = useState<Balance | undefined>();
  const [lostAccountRedeemable, setLostAccountRedeemable] = useState<{ amount: Balance, count: number } | undefined>();
  const [lostAccountPoolRedeemable, setLostAccountPoolRedeemable] = useState<{ amount: BN, count: number } | undefined>();
  const [lostAccountSoloStakingBalance, setLostAccountSoloStakingBalance] = useState<BN | undefined>();
  const [lostAccountPoolStakingBalance, setLostAccountPoolStakingBalance] = useState<{ amount: BN, hasRole: boolean } | undefined>();
  const [lostAccountReserved, setLostAccountReserved] = useState<BN | undefined>();
  const [lostAccountSoloUnlock, setLostAccountSoloUnlock] = useState<{ amount: BN, date: number } | undefined>();
  const [lostAccountPoolUnlock, setLostAccountPoolUnlock] = useState<{ amount: BN, date: number } | undefined>();
  const [lostAccountIdentity, setLostAccountIdentity] = useState<boolean | undefined>();
  const [lostAccountProxy, setLostAccountProxy] = useState<boolean | undefined>();
  const [alreadyClaimed, setAlreadyClaimed] = useState<boolean | undefined>();
  const [lostAccountRecoveryInfo, setLostAccountRecoveryInfo] = useState<PalletRecoveryRecoveryConfig | null | undefined | false>(false);

  const clearInformation = useCallback(() => {
    setLostAccountInformation(undefined);
    setFetching(false);
    setLostAccountBalance(undefined);
    setLostAccountRedeemable(undefined);
    setLostAccountPoolRedeemable(undefined);
    setLostAccountSoloStakingBalance(undefined);
    setLostAccountPoolStakingBalance(undefined);
    setLostAccountReserved(undefined);
    setLostAccountSoloUnlock(undefined);
    setLostAccountPoolUnlock(undefined);
    setLostAccountIdentity(undefined);
    setLostAccountProxy(undefined);
    setAlreadyClaimed(undefined);
    setLostAccountRecoveryInfo(undefined);
  }, []);

  useEffect(() => {
    if (refresh) {
      clearInformation();
    }

    if (!api || !lostAccountAddress || !rescuerAccountAddress || !sessionInfo || !accountsInfo || accountsInfo.length === 0 || fetching) {
      return;
    }

    setFetching(true);

    checkLostAccountBalance(api, lostAccountAddress, setLostAccountBalance, setLostAccountReserved);
    checkLostAccountSoloStakedBalance(api, lostAccountAddress, sessionInfo, setLostAccountSoloStakingBalance, setLostAccountSoloUnlock, setLostAccountRedeemable);
    checkLostAccountClaimedStatus(api, rescuerAccountAddress, lostAccountAddress, setAlreadyClaimed);
    checkLostAccountPoolStakedBalance(api, lostAccountAddress, sessionInfo, setLostAccountPoolStakingBalance, setLostAccountPoolUnlock, setLostAccountPoolRedeemable);
    checkLostAccountIdentity(accountsInfo, lostAccountAddress, setLostAccountIdentity);
    checkLostAccountProxy(api, lostAccountAddress, setLostAccountProxy);
    checkLostAccountRecoverability(api, lostAccountAddress, setLostAccountRecoveryInfo);
  }, [accountsInfo, api, clearInformation, fetching, lostAccountAddress, refresh, rescuerAccountAddress, sessionInfo]);

  useEffect(() => {
    if ([lostAccountBalance, lostAccountRedeemable, lostAccountPoolRedeemable, lostAccountSoloStakingBalance, lostAccountPoolStakingBalance, lostAccountReserved, lostAccountSoloUnlock, lostAccountPoolUnlock, lostAccountIdentity, lostAccountProxy, alreadyClaimed].includes(undefined) || fetching === false) {
      return;
    }

    setFetching(false);

    setLostAccountInformation({
      availableBalance: lostAccountBalance,
      claimed: alreadyClaimed,
      hasId: lostAccountIdentity,
      hasProxy: lostAccountProxy,
      isRecoverable: !!lostAccountRecoveryInfo,
      lost: lostAccountAddress,
      poolRedeemable: lostAccountPoolRedeemable,
      poolStaked: lostAccountPoolStakingBalance,
      poolUnlock: lostAccountPoolUnlock,
      redeemable: lostAccountRedeemable,
      rescuer: rescuerAccountAddress,
      reserved: lostAccountReserved,
      soloStaked: lostAccountSoloStakingBalance,
      soloUnlock: lostAccountSoloUnlock
    });
  }, [alreadyClaimed, fetching, lostAccountAddress, lostAccountBalance, lostAccountIdentity, lostAccountPoolRedeemable, lostAccountPoolStakingBalance, lostAccountPoolUnlock, lostAccountProxy, lostAccountRecoveryInfo, lostAccountRedeemable, lostAccountReserved, lostAccountSoloStakingBalance, lostAccountSoloUnlock, rescuerAccountAddress]);

  return lostAccountInformation;
}
