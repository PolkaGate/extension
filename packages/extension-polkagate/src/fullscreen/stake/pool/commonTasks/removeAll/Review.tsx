// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import SelectProxyModal2 from '@polkadot/extension-polkagate/src/fullscreen/governance/components/SelectProxyModal2';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { BN } from '@polkadot/util';

import { Motion, ShowBalance, SignArea2, WrongPasswordAlert } from '../../../../../components';
import { useEstimatedFee, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { MemberPoints, MyPoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import { Inputs } from '../../../Entry';
import { Mode, STEPS } from '.';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  pool: MyPoolInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  poolMembers: MemberPoints[];
  mode: 'UnbondAll' | 'RemoveAll';
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  setMode: React.Dispatch<React.SetStateAction<Mode | undefined>>;
}

export default function Review ({ address, api, chain, mode, pool, poolMembers, setMode, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);

  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [membersToUnboundAll, setMembersToUnboundAll] = useState<MemberPoints[] | undefined>();
  const [membersToRemoveAll, setMembersToRemoveAll] = useState<MemberPoints[] | undefined>();
  const [inputs, setInputs] = useState<Inputs | undefined>();

  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);

  // const poolWithdrawUnbonded = api.tx.nominationPools.poolWithdrawUnbonded;
  const poolDepositorAddr = String(pool.bondedPool?.roles.depositor);

  // const unlockingLen = pool?.stashIdAccount?.stakingLedger?.unlocking?.length ?? 0;
  // const maxUnlockingChunks = api.consts.staking.maxUnlockingChunks?.toNumber() as unknown as number;

  const extraInfo = useMemo(() => ({
    action: 'Pool Staking',
    fee: String(estimatedFee || 0),
    subAction: mode === 'UnbondAll' ? 'Unstake All' : 'Remove All'
  }), [estimatedFee, mode]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const onBackClick = useCallback(() => {
    setMode(undefined);
    setStep(STEPS.INDEX);
  }, [setMode, setStep]);

  useEffect(() => {
    if (!poolMembers?.length) {
      return;
    }

    if (mode === 'UnbondAll') {
      const nonZeroPointMembers = poolMembers.filter((m) => !new BN(m.points).isZero());

      const membersToUnbond = nonZeroPointMembers.filter((m) => m.accountId !== poolDepositorAddr);

      setMembersToUnboundAll(membersToUnbond);
    } else {
      const membersToRemove = poolMembers.filter((m) => m.accountId !== poolDepositorAddr);

      setMembersToRemoveAll(membersToRemove);
    }
  }, [poolMembers, mode, poolDepositorAddr]);

  useEffect(() => {
    if ((!membersToUnboundAll && !membersToRemoveAll) || !formatted || !api) {
      return;
    }

    const batchAll = api.tx.utility.batchAll;

    if (mode === 'UnbondAll') {
      const unbonded = api.tx.nominationPools.unbond;

      const params = membersToUnboundAll?.map((m) => [m.accountId, m.points]);

      if (!params || params.length === 0) {
        return;
      }

      const call = params.length > 1
        ? batchAll
        : unbonded;

      setInputs({
        call,
        params: params.length > 1 ? params : params[0]
      });
    } else if (mode === 'RemoveAll') {
      const redeem = api.tx.nominationPools.withdrawUnbonded;

      const params = membersToRemoveAll?.map((m) => [m.accountId, m.points]);

      if (!params || params.length === 0) {
        return;
      }

      const call = params.length > 1
        ? batchAll
        : redeem;

      setInputs({
        call,
        params: params.length > 1 ? params : params[0]
      });
    }
  }, [api, formatted, membersToRemoveAll, membersToUnboundAll, mode, setInputs]);

  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), [setStep]);

  return (
    <Motion>
      {step === STEPS.REVIEW &&
        <Grid container direction='column' item pt='15px'>
          {isPasswordError &&
            <WrongPasswordAlert />
          }
          {mode === 'UnbondAll'
            ? (<Typography fontSize='14px' fontWeight={300} sx={{ m: '15px auto 0', width: '85%' }}>
              {t<string>('Unstaking all members of the pool except yourself forcefully.')}
            </Typography>)
            : (<>
              <Typography fontSize='14px' fontWeight={300} sx={{ m: '15px auto 0', width: '85%' }} textAlign='center'>
                {t<string>('Removing all members from the pool')}
              </Typography>
              <Typography fontSize='14px' fontWeight={300} sx={{ m: '15px auto 0', width: '85%' }}>
                {t<string>('When you confirm, you will be able to unstake your tokens')}
              </Typography>
            </>)
          }
          <ShowPool
            api={api}
            chain={chain}
            label=''
            mode='Default'
            pool={pool}
            showInfo
            style={{ m: '15px auto' }}
          />
          <Grid container item m='auto'>
            <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
              {t<string>('Fee:')}
            </Typography>
            <Grid item lineHeight='22px' pl='5px'>
              <ShowBalance
                api={api}
                balance={estimatedFee}
                decimalPoint={4}
                height={22}
              />
            </Grid>
          </Grid>
          <Grid container item sx={{ bottom: '15px', height: '120px', position: 'absolute', width: '86%' }}>
            <SignArea2
              address={address}
              call={inputs?.call}
              extraInfo={extraInfo}
              isPasswordError={isPasswordError}
              onSecondaryClick={onBackClick}
              params={inputs?.params}
              primaryBtnText={t('Confirm')}
              proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
              secondaryBtnText={t('Back')}
              selectedProxy={selectedProxy}
              setIsPasswordError={setIsPasswordError}
              setRefresh={setRefresh}
              setStep={setStep}
              setTxInfo={setTxInfo}
              showBackButtonWithUseProxy
              step={step}
              steps={STEPS}
            />
          </Grid>
        </Grid>}
      {step === STEPS.PROXY &&
        <SelectProxyModal2
          address={address}
          closeSelectProxy={closeProxy}
          height={500}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
        />
      }
    </Motion>
  );
}
