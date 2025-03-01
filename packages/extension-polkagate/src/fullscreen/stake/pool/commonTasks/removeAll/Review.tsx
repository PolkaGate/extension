// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { MemberPoints, MyPoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import type { StakingInputs } from '../../../type';
import type { Mode } from '.';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import SelectProxyModal2 from '@polkadot/extension-polkagate/src/fullscreen/governance/components/SelectProxyModal2';
import DisplayValue from '@polkadot/extension-polkagate/src/fullscreen/governance/post/castVote/partial/DisplayValue';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { PROXY_TYPE } from '@polkadot/extension-polkagate/src/util/constants';
import { BN } from '@polkadot/util';

import { AccountHolderWithProxy, Motion, ShowValue, SignArea2, WrongPasswordAlert } from '../../../../../components';
import { useEstimatedFee, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { STEPS } from '../../stake';

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

export default function Review({ address, api, chain, mode, pool, poolMembers, setMode, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);

  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [membersToUnbond, setMembersToUnbond] = useState<MemberPoints[] | undefined>();
  const [membersToRemove, setMembersToRemove] = useState<MemberPoints[] | undefined>();
  const [inputs, setInputs] = useState<StakingInputs | undefined>();

  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const poolDepositorAddr = String(pool.bondedPool?.roles.depositor);

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

      setMembersToUnbond(membersToUnbond);
    } else {
      const membersToRemove = poolMembers.filter((m) => m.accountId !== poolDepositorAddr);

      setMembersToRemove(membersToRemove);
    }
  }, [poolMembers, mode, poolDepositorAddr]);

  useEffect(() => {
    if ((!membersToUnbond && !membersToRemove) || !formatted || !api) {
      return;
    }

    const batchAll = api.tx['utility']['batchAll'];

    if (mode === 'UnbondAll') {
      const unbonded = api.tx['nominationPools']['unbond'];

      const members = membersToUnbond?.map((m) => [m.accountId, m.points]);

      if (!members || members.length === 0) {
        return;
      }

      const call = members.length > 1
        ? batchAll
        : unbonded;

      const params = members.length > 1
        ? [members.map((member) => unbonded(...member))]
        : members[0];

      setInputs({
        call,
        params
      });
    } else if (mode === 'RemoveAll') {
      const redeem = api.tx['nominationPools']['withdrawUnbonded'];

      const members = membersToRemove?.map((m) => [m.accountId, m.points]);

      if (!members || members.length === 0) {
        return;
      }

      const call = members.length > 1
        ? batchAll
        : redeem;

      const params = members.length > 1
        ? [members.map((member) => redeem(...member))]
        : members[0];

      setInputs({
        call,
        params
      });
    }
  }, [api, formatted, membersToRemove, membersToUnbond, mode, setInputs]);

  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), [setStep]);

  return (
    <Motion>
      {[STEPS.REVIEW, STEPS.SIGN_QR].includes(step) &&
        <Grid container direction='column' item pt='15px'>
          {isPasswordError &&
            <WrongPasswordAlert />
          }
          <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            style={{ mt: 'auto' }}
            title={t('Account')}
          />
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
          {mode === 'UnbondAll'
            ? (<Typography fontSize='14px' fontWeight={300} sx={{ m: '15px auto 0', width: '85%' }}>
              {t('Unstaking all members of the pool except yourself forcefully.')}
            </Typography>)
            : (<>
              <Typography fontSize='14px' fontWeight={300} sx={{ m: '15px auto 0', width: '85%' }} textAlign='center'>
                {t('Removing all members from the pool')}
              </Typography>
              <Typography fontSize='14px' fontWeight={300} sx={{ m: '15px auto 0', width: '85%' }}>
                {t('When you confirm, you will be able to unstake your tokens')}
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
          <DisplayValue dividerHeight='1px' title={t('Fee')}>
            <Grid alignItems='center' container item sx={{ fontSize: 'large', height: '42px' }}>
              <ShowValue height={16} value={estimatedFee?.toHuman()} width='150px' />
            </Grid>
          </DisplayValue>
          <Grid container item sx={{ bottom: '15px', height: '120px', position: 'absolute', width: '86%' }}>
            <SignArea2
              address={address}
              call={inputs?.call}
              extraInfo={extraInfo}
              isPasswordError={isPasswordError}
              onSecondaryClick={onBackClick}
              params={inputs?.params}
              primaryBtnText={t('Confirm')}
              proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
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
        </Grid>
      }
      {step === STEPS.PROXY &&
        <SelectProxyModal2
          address={address}
          closeSelectProxy={closeProxy}
          height={500}
          proxies={proxyItems}
          proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
        />
      }
    </Motion>
  );
}
