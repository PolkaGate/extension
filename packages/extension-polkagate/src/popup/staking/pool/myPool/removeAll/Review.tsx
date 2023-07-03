// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE } from '@polkadot/util';

import { ActionContext, Motion, PasswordUseProxyConfirm, Popup, ShortAddress, ShowBalance, WrongPasswordAlert } from '../../../../../components';
import { useAccountDisplay, useProxies, useTranslation } from '../../../../../hooks';
import { HeaderBrand, SubTitle, ThroughProxy, WaitScreen } from '../../../../../partials';
import Confirmation from '../../../../../partials/Confirmation';
import { signAndSend } from '../../../../../util/api';
import { MemberPoints, MyPoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../../util/utils';
import ShowPool from '../../../partial/ShowPool';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  formatted: string;
  pool: MyPoolInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMyPool: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  poolMembers: MemberPoints[];
  mode: 'UnbondAll' | 'RemoveAll';
}

export default function Review({ address, api, chain, formatted, mode, pool, poolMembers, setRefresh, setShow, setShowMyPool, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, formatted);
  const name = useAccountDisplay(address);
  const onAction = useContext(ActionContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [membersToUnboundAll, setMembersToUnboundAll] = useState<MemberPoints[] | undefined>();
  const [membersToRemoveAll, setMembersToRemoveAll] = useState<MemberPoints[] | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [txCalls, setTxCalls] = useState<SubmittableExtrinsic<'promise'>[]>();

  const unbonded = api.tx.nominationPools.unbond;
  const poolWithdrawUnbonded = api.tx.nominationPools.poolWithdrawUnbonded;
  const batchAll = api.tx.utility.batchAll;
  const redeem = api.tx.nominationPools.withdrawUnbonded;
  const poolDepositorAddr = String(pool.bondedPool?.roles.depositor);

  const unlockingLen = pool?.stashIdAccount?.stakingLedger?.unlocking?.length ?? 0;
  const maxUnlockingChunks = api.consts.staking.maxUnlockingChunks?.toNumber() as unknown as number;

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/pool/${address}`);
  }, [address, onAction, setShow]);

  const onBackClick = useCallback(() => {
    setShow(!show);
  }, [setShow, show]);

  const goToMyPool = useCallback(() => {
    setShowMyPool(false);
  }, [setShowMyPool]);

  useEffect(() => {
    if (!poolMembers?.length) { return; }

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
    if (!membersToUnboundAll && !membersToRemoveAll) { return; }

    if (mode === 'UnbondAll') {
      const calls = membersToUnboundAll?.map((m) => unbonded(m.accountId, m.points));

      if (!calls) {
        return;
      }

      setTxCalls(calls);

      if (!api?.call?.transactionPaymentApi) {
        return setEstimatedFee(api?.createType('Balance', BN_ONE));
      }

      // eslint-disable-next-line no-void
      void (calls?.length > 1 ? batchAll(calls) : calls[0]).paymentInfo(formatted).then((i) => {
        const fee = i?.partialFee;

        if (unlockingLen < maxUnlockingChunks) {
          setEstimatedFee(fee);
        } else {
          const dummyParams = [1, 1];

          // eslint-disable-next-line no-void
          void poolWithdrawUnbonded(...dummyParams).paymentInfo(formatted).then((j) => setEstimatedFee(api.createType('Balance', fee.add(j?.partialFee))));
        }
      });
    } else if (mode === 'RemoveAll') {
      const calls = membersToRemoveAll?.map((m) => redeem(m.accountId, m.points));

      if (!calls) {
        return;
      }

      setTxCalls(calls);

      if (!api?.call?.transactionPaymentApi) {
        return setEstimatedFee(api?.createType('Balance', BN_ONE));
      }

      // eslint-disable-next-line no-void
      void (calls?.length > 1 ? batchAll(calls) : calls[0]).paymentInfo(formatted).then((i) => {
        setEstimatedFee(i?.partialFee);
      });
    }
  }, [api, batchAll, formatted, maxUnlockingChunks, membersToRemoveAll, membersToUnboundAll, mode, poolWithdrawUnbonded, redeem, setTxCalls, unbonded, unlockingLen]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const unstakeOrRemoveAll = useCallback(async () => {
    try {
      if (!formatted || !txCalls) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const updated = txCalls.length > 1 ? batchAll(txCalls) : txCalls[0];
      const tx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, updated) : updated;

      const { block, failureText, fee, success, txHash } = await signAndSend(api, tx, signer, formatted);

      const subAction = mode === 'UnbondAll' ? 'Unstake All' : 'Remove All';

      const info = {
        action: 'Pool Staking',
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction,
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);
      setShowWaitScreen(false);
      setShowConfirmation(true);
      setRefresh(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, batchAll, chain, estimatedFee, formatted, mode, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, setRefresh, txCalls]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>(`${mode === 'RemoveAll' ? 'Remove' : 'Unstake'} All`)}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t<string>('Review')} />
        {mode === 'UnbondAll'
          ? (<Typography fontSize='14px' fontWeight={300} sx={{ m: '15px auto 0', width: '85%' }}>
            {t<string>('Unstaking all members of the pool except yourself forcefully.')}
          </Typography>)
          : (<>
            <Typography fontSize='14px' fontWeight={300} textAlign='center' sx={{ m: '15px auto 0', width: '85%' }}>
              {t<string>('Removing all mermbers from the pool')}
            </Typography>
            <Typography fontSize='14px' fontWeight={300} sx={{ m: '15px auto 0', width: '85%' }}>
              {t<string>('When you confirm you are able to unstake your tockens')}
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
          style={{
            m: '15px auto',
            width: '92%'
          }}
        />
        <Grid container m='auto' width='92%'>
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
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name || ''}`}
          onChange={setPassword}
          onConfirmClick={unstakeOrRemoveAll}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setSelectedProxy={setSelectedProxy}
          style={{
            bottom: '80px',
            left: '4%',
            position: 'absolute',
            width: '92%'
          }}
        />
        <WaitScreen
          show={showWaitScreen}
          title={t<string>(`${mode === 'RemoveAll' ? 'Remove' : 'Unstake'} All`)}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t<string>(`${mode === 'RemoveAll' ? 'Remove' : 'Unstake'} All`)}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyPool}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My pool')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <>
              <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('Account holder:')}
                </Typography>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {txInfo.from.name}
                </Typography>
                <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                  <ShortAddress
                    address={txInfo.from.address}
                    inParentheses
                    style={{ fontSize: '16px' }}
                  />
                </Grid>
              </Grid>
              {txInfo.throughProxy &&
                <Grid container m='auto' maxWidth='92%'>
                  <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} name={txInfo.throughProxy.name} />
                </Grid>
              }
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
              <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('Pool:')}
                </Typography>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {pool.metadata}
                </Typography>
              </Grid>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            </>
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
