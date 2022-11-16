// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { Balance } from '@polkadot/types/interfaces';

import { useApi, useFormatted, usePoolConsts, useTranslation } from '../../../hooks';
import { HeaderBrand } from '../../../partials';
import { MyPoolInfo, PoolStakingConsts } from '../../../util/types';
import Option from '../partial/Option';

interface State {
  api?: ApiPromise;
  consts?: PoolStakingConsts;
  myPool: MyPoolInfo | null | undefined;
  balances: DeriveBalancesAll | undefined;
  pathname: string;
}

export default function Stake(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const { pathname, state } = useLocation<State>();
  const api = useApi(address, state?.api);
  const poolStakingConsts = usePoolConsts(address, state?.consts);
  const history = useHistory();

  const [availableBalance, setAvailableBalance] = useState<Balance | undefined>();
  const [joinDisabled, setJoinDisabled] = useState<boolean>(true);
  const [createDisabled, setCreateDisabled] = useState<boolean>(true);
  const [createWarningText, setCreateWarningText] = useState<string | undefined>();
  const [joinWarningText, setJoinWarningText] = useState<string | undefined>();

  const backToIndex = useCallback(() => {
    history.push({
      pathname: `/pool/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const joinPool = useCallback(() => {
    history.push({
      pathname: `/pool/join/${address}`,
      state: { api, availableBalance, pathname, poolStakingConsts }
    });
  }, [address, api, availableBalance, history, pathname, poolStakingConsts]);

  const createPool = useCallback(() => {
    history.push({
      pathname: `/pool/create/${address}`,
      state: { api, availableBalance, pathname, poolStakingConsts }
    });
  }, [address, api, availableBalance, history, pathname, poolStakingConsts]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    !state?.balances?.availableBalance && api && formatted && void api.derive.balances?.all(formatted).then((b) => {
      setAvailableBalance(b.availableBalance);
    });
    state?.balances?.availableBalance && setAvailableBalance(state?.balances?.availableBalance);
  }, [formatted, api, state?.balances?.availableBalance]);

  useEffect(() => {
    if (!poolStakingConsts || !availableBalance) {
      return;
    }

    if (poolStakingConsts?.minJoinBond.gt(availableBalance)) {
      return setJoinWarningText(t<string>('You don’t have enough fund.'));
    }

    setJoinDisabled(false);
  }, [availableBalance, poolStakingConsts, t]);

  useEffect(() => {
    if (!poolStakingConsts || !availableBalance) {
      return;
    }

    if (poolStakingConsts.maxPools === poolStakingConsts.lastPoolId.toNumber()) {
      return setCreateWarningText(t<string>('Pools are full.'));
    }

    if (poolStakingConsts?.minCreateBond.gt(availableBalance)) {
      return setCreateWarningText(t<string>('You don’t have enough fund.'));
    }

    setCreateDisabled(false);
  }, [availableBalance, poolStakingConsts, t]);

  return (
    <>
      <HeaderBrand
        onBackClick={backToIndex}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <Option
        api={api}
        balance={poolStakingConsts?.minJoinBond}
        balanceText={t<string>('Minimum to join')}
        buttonText={t<string>('Join')}
        isDisabled={joinDisabled}
        onClick={joinPool}
        style={{
          m: '20px auto',
          width: '92%'
        }}
        title={t<string>('Join Pool')}
        warningText={joinWarningText}
      />
      <Option
        api={api}
        balance={poolStakingConsts?.minCreateBond}
        balanceText={t<string>('Minimum to create')}
        buttonText={t<string>('Create')}
        isDisabled={createDisabled}
        onClick={createPool}
        style={{
          m: 'auto',
          width: '92%'
        }}
        title={t<string>('Create Pool')}
        warningText={createWarningText}
      />
    </>
  );
}
