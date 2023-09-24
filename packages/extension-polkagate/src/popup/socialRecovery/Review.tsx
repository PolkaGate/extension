// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Close as CloseIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Chain } from '@polkadot/extension-chains/types';
import { ISubmittableResult } from '@polkadot/types/types';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE } from '@polkadot/util';

import { Identity, Infotip2, Motion, ShortAddress, ShowBalance, Warning, WrongPasswordAlert } from '../../components';
import { useAccountDisplay, useChainName, useCurrentBlockNumber, useDecimal, useFormatted, useProxies } from '../../hooks';
import { ActiveRecoveryFor } from '../../hooks/useActiveRecoveries';
import useTranslation from '../../hooks/useTranslation';
import { ThroughProxy } from '../../partials';
import { signAndSend } from '../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../util/utils';
import blockToDate from '../crowdloans/partials/blockToDate';
import { DraggableModal } from '../governance/components/DraggableModal';
import PasswordWithTwoButtonsAndUseProxy from '../governance/components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../governance/components/SelectProxyModal';
import WaitScreen from '../governance/partials/WaitScreen';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import { toTitleCase } from '../governance/utils/util';
import { AddressWithIdentity } from './components/SelectTrustedFriend';
import Confirmation from './partial/Confirmation';
import TrustedFriendsDisplay from './partial/TrustedFriendsDisplay';
import recoveryDelayPeriod from './util/recoveryDelayPeriod';
import { InitiateRecoveryConfig, RecoveryConfigType, SocialRecoveryModes, WithdrawInfo } from './util/types';
import { STEPS } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain;
  depositValue: BN;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  mode: SocialRecoveryModes;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  recoveryInfo: PalletRecoveryRecoveryConfig | null;
  recoveryConfig: RecoveryConfigType | undefined;
  lostAccountAddress: InitiateRecoveryConfig | undefined;
  activeLost: ActiveRecoveryFor | null | undefined;
  withdrawInfo: WithdrawInfo | undefined;
  vouchRecoveryInfo: { lost: AddressWithIdentity; rescuer: AddressWithIdentity; } | undefined;
  allActiveRecoveries: ActiveRecoveryFor[] | null | undefined;
  setMode: (value: React.SetStateAction<SocialRecoveryModes>) => void;
  specific: boolean;
}

export default function Review({ activeLost, address, allActiveRecoveries, api, chain, depositValue, lostAccountAddress, mode, recoveryConfig, recoveryInfo, setMode, setRefresh, setStep, specific, step, vouchRecoveryInfo, withdrawInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const name = useAccountDisplay(address);
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const theme = useTheme();
  const decimal = useDecimal(address);
  const currentBlockNumber = useCurrentBlockNumber(address);
  const chainName = useChainName(address);

  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [password, setPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [nothingToWithdrawNow, setNothingToWithdrawNow] = useState<boolean>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const batchAll = api && api.tx.utility.batchAll;
  const removeRecovery = api && api.tx.recovery.removeRecovery;
  const createRecovery = api && api.tx.recovery.createRecovery;
  const initiateRecovery = api && api.tx.recovery.initiateRecovery;
  const closeRecovery = api && api.tx.recovery.closeRecovery;
  const vouchRecovery = api && api.tx.recovery.vouchRecovery;
  const claimRecovery = api && api.tx.recovery.claimRecovery;
  const asRecovered = api && api.tx.recovery.asRecovered;
  const chill = api && api.tx.staking.chill;
  const unbonded = api && api.tx.staking.unbond;
  const redeem = api && api.tx.staking.withdrawUnbonded;
  const transferAll = api && api.tx.balances.transferAll; // [rescuer.accountId, false]
  const clearIdentity = api && api.tx.identity.clearIdentity;

  const withdrawTXs = useCallback((): SubmittableExtrinsic<'promise', ISubmittableResult> | undefined => {
    if (!api || !batchAll || !redeem || !clearIdentity || !claimRecovery || !asRecovered || !closeRecovery || !unbonded || !removeRecovery || !chill || !withdrawInfo || !formatted || !transferAll || allActiveRecoveries === undefined) {
      return;
    }

    const tx: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];
    const withdrawCalls: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];

    !withdrawInfo.claimed && tx.push(claimRecovery(withdrawInfo.lost));
    allActiveRecoveries && allActiveRecoveries.filter((active) => active.lost === withdrawInfo.lost).forEach((activeRec) => withdrawCalls.push(closeRecovery(activeRec.rescuer)));
    withdrawInfo.isRecoverable && withdrawCalls.push(removeRecovery());
    !(withdrawInfo.soloStaked.isZero()) && withdrawCalls.push(chill(), unbonded(withdrawInfo.soloStaked));
    !(withdrawInfo.redeemable.isZero()) && withdrawCalls.push(redeem(100));
    withdrawInfo.hasId && withdrawCalls.push(clearIdentity());
    (!withdrawInfo?.availableBalance.isZero() || !withdrawInfo.claimed || !withdrawInfo.redeemable.isZero() || withdrawInfo.isRecoverable || withdrawInfo.hasId) && withdrawCalls.push(transferAll(formatted, false));

    return tx.length > 0
      ? batchAll([...tx, asRecovered(withdrawInfo.lost, batchAll(withdrawCalls))])
      : asRecovered(withdrawInfo.lost, batchAll(withdrawCalls));
  }, [allActiveRecoveries, api, asRecovered, batchAll, chill, clearIdentity, claimRecovery, closeRecovery, formatted, redeem, removeRecovery, transferAll, unbonded, withdrawInfo]);

  const tx = useMemo(() => {
    if (!removeRecovery || !createRecovery || !initiateRecovery || !batchAll || !closeRecovery || !vouchRecovery) {
      return undefined;
    }

    if (mode === 'RemoveRecovery') {
      return removeRecovery();
    }

    if (mode === 'SetRecovery' && recoveryConfig) {
      return createRecovery(recoveryConfig.friends.addresses.sort(), recoveryConfig.threshold, recoveryConfig.delayPeriod);
    }

    if (mode === 'ModifyRecovery' && recoveryConfig) {
      return batchAll([removeRecovery(), createRecovery(recoveryConfig.friends.addresses.sort(), recoveryConfig.threshold, recoveryConfig.delayPeriod)]);
    }

    if (mode === 'InitiateRecovery' && lostAccountAddress) {
      return initiateRecovery(lostAccountAddress.address);
    }

    if (mode === 'CloseRecovery' && activeLost) {
      return closeRecovery(activeLost.rescuer);
    }

    if (mode === 'VouchRecovery' && vouchRecoveryInfo) {
      return vouchRecovery(vouchRecoveryInfo.lost.address, vouchRecoveryInfo.rescuer.address);
    }

    if (mode === 'Withdraw' && withdrawInfo) {
      return withdrawTXs();
    }

    return undefined;
  }, [activeLost, batchAll, closeRecovery, createRecovery, initiateRecovery, lostAccountAddress, mode, recoveryConfig, removeRecovery, vouchRecovery, vouchRecoveryInfo, withdrawInfo, withdrawTXs]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  useEffect(() => {
    if (!formatted || !tx) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    // eslint-disable-next-line no-void
    void tx.paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee));
  }, [api, formatted, tx]);

  const onNext = useCallback(async (): Promise<void> => {
    try {
      if (!formatted || !tx || !api) {
        return;
      }

      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setStep(STEPS.WAIT_SCREEN);

      const decidedTx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, tx) : tx;

      const { block, failureText, fee, success, txHash } = await signAndSend(api, decidedTx, signer, selectedProxy?.delegate ?? formatted);

      const info = {
        action: 'Social Recovery',
        block: block || 0,
        chain,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: String(formatted), name },
        subAction: toTitleCase(mode),
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(String(from), info);
      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, chain, estimatedFee, formatted, mode, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, setStep, tx]);

  const handleClose = useCallback(() => {
    setStep(mode === 'RemoveRecovery'
      ? STEPS.RECOVERY_DETAIL
      : mode === 'SetRecovery' || mode === 'ModifyRecovery'
        ? STEPS.MAKE_RECOVERABLE
        : mode === 'Withdraw' && withdrawInfo?.claimed === false
          ? STEPS.INITIATE_RECOVERY
          : mode === 'Withdraw' && withdrawInfo?.claimed === true
            ? STEPS.INDEX
            : mode === 'InitiateRecovery'
              ? STEPS.INITIATE_RECOVERY
              : mode === 'VouchRecovery'
                ? STEPS.VOUCH
                : STEPS.INDEX);
  }, [mode, setStep, withdrawInfo?.claimed]);

  const closeSelectProxy = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const closeConfirmation = useCallback(() => {
    setMode(undefined);
    setRefresh(true);
    setStep(STEPS.CHECK_SCREEN);
  }, [setMode, setRefresh, setStep]);

  const closeWindow = useCallback(() => window.close(), []);

  const WithdrawDetails = ({ step }: { step: number }) => {
    const toBeWithdrawn: { label: string; amount: BN | Balance }[] = [];
    const toBeWithdrawnLater: { label: string; amount: BN | Balance }[] = [];

    withdrawInfo?.availableBalance && !withdrawInfo.availableBalance.isZero() && toBeWithdrawn.push({ amount: withdrawInfo.availableBalance, label: 'Transferable' });
    withdrawInfo?.redeemable && !withdrawInfo.redeemable.isZero() && toBeWithdrawn.push({ amount: withdrawInfo.redeemable, label: 'Redeemable' });
    withdrawInfo?.reserved && !withdrawInfo.reserved.isZero() && toBeWithdrawn.push({ amount: withdrawInfo.reserved, label: 'Reserved' });
    withdrawInfo?.soloStaked && !withdrawInfo.soloStaked.isZero() && toBeWithdrawnLater.push({ amount: withdrawInfo.soloStaked, label: `Solo Stake (after ${chainName === 'polkadot' ? '28 days' : chainName === 'kusama' ? '7 days' : '0.5 day'})` });
    withdrawInfo?.soloUnlock && !withdrawInfo.soloUnlock.amount.isZero() && toBeWithdrawnLater.push({ amount: withdrawInfo.soloUnlock.amount, label: `Solo unstaking (${new Date(withdrawInfo.soloUnlock.date).toLocaleDateString('en-US', { day: 'numeric', hour: '2-digit', hourCycle: 'h23', minute: '2-digit', month: 'short' })})` });
    withdrawInfo?.poolStaked && !withdrawInfo.poolStaked.isZero() && toBeWithdrawnLater.push({ amount: withdrawInfo.poolStaked, label: 'Pool Stake' });

    setNothingToWithdrawNow(toBeWithdrawn.length === 0);

    return (
      <Grid alignItems='center' container direction='column' item justifyContent='center' m='auto' width='70%'>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
        {withdrawInfo
          ? <>
            {toBeWithdrawn.length > 0 &&
              <Grid container item justifyContent='center' sx={{ '> div:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' } }}>
                <Typography fontSize='16px' fontWeight={400}>
                  {step === STEPS.REVIEW
                    ? t<string>('Funds available to be withdrawn now')
                    : t<string>('Withdrawn Funds')}
                </Typography>
                {toBeWithdrawn.map((item, index) => (
                  <Grid container item justifyContent='space-between' key={index} sx={{ fontSize: '20px', fontWeight: 400, py: '5px' }}>
                    <Typography fontSize='16px' fontWeight={300}>
                      {t<string>(item.label)}
                    </Typography>
                    <ShowBalance
                      api={api}
                      balance={item.amount}
                      decimalPoint={4}
                    />
                  </Grid>
                ))}
              </Grid>}
            {toBeWithdrawnLater.length > 0 &&
              <>
                {toBeWithdrawn.length > 0 && <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />}
                <Grid container item justifyContent='center' sx={{ '> div:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' } }}>
                  <Typography fontSize='16px' fontWeight={400}>
                    {step === STEPS.REVIEW
                      ? t<string>('Funds available to withdraw later')
                      : t<string>('Funds will be withdrawn later')}
                  </Typography>
                  {toBeWithdrawnLater.map((item, index) => (
                    <Grid container item justifyContent='space-between' key={index} sx={{ fontSize: '20px', fontWeight: 400, py: '5px' }}>
                      <Typography fontSize='16px' fontWeight={300}>
                        {t<string>(item.label)}
                      </Typography>
                      <ShowBalance
                        api={api}
                        balance={item.amount}
                        decimalPoint={4}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>}
          </>
          : [0, 1, 2, 3, 4].map((item) => (
            <Skeleton
              height='25px'
              key={item}
              sx={{ mb: '5px', transform: 'none', width: '410px' }}
            />
          ))}
      </Grid>
    );
  };

  const RecoveryInfo = () => (
    <>
      <Typography sx={{ maxHeight: '300px', maxWidth: '500px', overflowY: 'scroll' }} variant='body2'>
        <Grid container spacing={1} sx={{ '> div:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'background.paper' } }}>
          {lostAccountAddress?.friends && lostAccountAddress.friends.addresses.map((friend, index) =>
            <Grid alignItems='center' container item key={index} pb='3px'>
              <Typography fontSize='14px' fontWeight={400} pr='8px'>
                {`Trusted friend ${index + 1}`}:
              </Typography>
              {lostAccountAddress.friends?.infos &&
                <Typography fontSize='16px' fontWeight={400} sx={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 'fit-content' }}>
                  {lostAccountAddress.friends.infos[index]?.identity.display}
                </Typography>
              }
              <ShortAddress
                address={friend}
                charsCount={3}
                inParentheses
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  width: 'fit-content'
                }}
              />
            </Grid>
          )}
          <Grid alignItems='center' container item sx={{ borderTop: '1px solid', borderTopColor: 'background.paper' }}>
            <Typography fontSize='14px' fontWeight={400} sx={{ borderRight: '1px solid', borderRightColor: 'background.paper' }} textAlign='left' width='50%'>
              {`Delay: ${lostAccountAddress?.delayPeriod ?? ''}`}
            </Typography>
            <Typography fontSize='14px' fontWeight={400} textAlign='right' width='50%'>
              {`Threshold: ${lostAccountAddress?.threshold ?? 1} of ${lostAccountAddress?.friends?.addresses.length ?? 1}`}
            </Typography>
          </Grid>
        </Grid>
      </Typography>
    </>
  );

  return (
    <Motion style={{ height: '100%', paddingInline: '10%', width: '100%' }}>
      <>
        <Grid container direction='column' py='20px'>
          <Typography fontSize='30px' fontWeight={700}>
            {(step === STEPS.REVIEW || step === STEPS.PROXY) && (
              <>
                {mode === 'RemoveRecovery' && t('Making account unrecoverable')}
                {mode === 'SetRecovery' && t('Step 3 of 3: Review')}
                {mode === 'ModifyRecovery' && t('Modify account recoverability')}
                {mode === 'InitiateRecovery' && t('Initiate Recovery')}
                {mode === 'CloseRecovery' && t('End Recovery')}
                {mode === 'VouchRecovery' && t('Vouch Recovery')}
                {mode === 'Withdraw' && t('Withdraw the fund of your lost account')}
              </>
            )}
            {step === STEPS.WAIT_SCREEN && (
              <>
                {mode === 'RemoveRecovery' && t('Making account unrecoverable')}
                {mode === 'SetRecovery' && t('Making account recoverable')}
                {mode === 'ModifyRecovery' && t('Modifying account recoverability configuration')}
                {mode === 'InitiateRecovery' && t('Initiating Recovery')}
                {mode === 'CloseRecovery' && t('Ending the recovery process')}
                {mode === 'VouchRecovery' && t('Vouching')}
                {mode === 'Withdraw' && t('Withdrawing the fund of your lost account')}
              </>
            )}
            {step === STEPS.CONFIRM && mode === 'RemoveRecovery' && (
              txInfo?.success ? t('Your account is not recoverable anymore') : t('Failed to make account unrecoverable')
            )}
            {step === STEPS.CONFIRM && mode === 'SetRecovery' && (
              txInfo?.success ? t('Your account is recoverable') : t('Failed to make account recoverable')
            )}
            {step === STEPS.CONFIRM && mode === 'ModifyRecovery' && (
              txInfo?.success ? t('Account recoverability modified') : t('Failed to modify account recoverability')
            )}
            {step === STEPS.CONFIRM && mode === 'InitiateRecovery' && (
              txInfo?.success ? t('Recovery Initiated') : t('Failed to initiate recovery')
            )}
            {step === STEPS.CONFIRM && mode === 'CloseRecovery' && (
              txInfo?.success ? t('Initiated recovery has been ended') : t('Failed to end recovery')
            )}
            {step === STEPS.CONFIRM && mode === 'VouchRecovery' && (
              txInfo?.success ? t('Recovery Vouched') : t('Failed to vouch recovery')
            )}
            {step === STEPS.CONFIRM && mode === 'Withdraw' && (
              txInfo?.success ? t('The funds have been withdrawn') : t('Failed to withdraw the funds')
            )}
          </Typography>
          {(step === STEPS.REVIEW || step === STEPS.PROXY) && ['InitiateRecovery', 'ModifyRecovery', 'VouchRecovery'].includes(mode) &&
            <Typography fontSize='22px' fontWeight={700}>
              {['InitiateRecovery', 'VouchRecovery'].includes(mode)
                ? t('Step 2 of 2: Review')
                : t('Step 3 of 3: Review')
              }
            </Typography>
          }
          {(step === STEPS.REVIEW || step === STEPS.PROXY) && mode === 'CloseRecovery' &&
            <Typography fontSize='14px' fontWeight={400}>
              {t('By terminating the recovery process, you will receive the tokens deposited by the suspected malicious account')}
            </Typography>
          }
        </Grid>
        {(step === STEPS.REVIEW || step === STEPS.PROXY) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <Grid container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', mb: '20px', p: '1% 3%' }}>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {mode === 'InitiateRecovery' || mode === 'VouchRecovery'
                    ? t<string>('Rescuer account')
                    : t<string>('Account holder')}
                </Typography>
                <Identity
                  accountInfo={mode === 'VouchRecovery' ? vouchRecoveryInfo?.rescuer.accountIdentity : undefined}
                  address={mode !== 'VouchRecovery'
                    ? address
                    : vouchRecoveryInfo?.rescuer.address}
                  api={api}
                  chain={chain}
                  direction='row'
                  identiconSize={31}
                  showSocial={false}
                  style={{ maxWidth: '100%', width: 'fit-content' }}
                  withShortAddress
                />
              </Grid>
              {selectedProxyAddress &&
                <Grid container m='auto' maxWidth='92%'>
                  <ThroughProxy address={selectedProxyAddress} chain={chain} />
                </Grid>
              }
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
              {(mode === 'SetRecovery' || mode === 'ModifyRecovery') && recoveryConfig &&
                <>
                  <Typography fontSize='16px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                    {t<string>('Trusted friends')}
                  </Typography>
                  <TrustedFriendsDisplay
                    accountsInfo={recoveryConfig.friends.infos}
                    api={api}
                    chain={chain}
                    friends={recoveryConfig.friends.addresses}
                  />
                  <DisplayValue title={t<string>('Recovery Threshold')}>
                    <Typography fontSize='24px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                      {`${recoveryConfig.threshold} of ${recoveryConfig.friends.addresses.length}`}
                    </Typography>
                  </DisplayValue>
                  <DisplayValue title={t<string>('Recovery Delay')}>
                    <Typography fontSize='24px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                      {recoveryDelayPeriod(recoveryConfig.delayPeriod)}
                    </Typography>
                  </DisplayValue>
                </>
              }
              {mode === 'RemoveRecovery' && recoveryInfo &&
                <>
                  <Typography fontSize='16px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                    {t<string>('Removing trusted friends')}
                  </Typography>
                  <TrustedFriendsDisplay
                    api={api}
                    chain={chain}
                    friends={recoveryInfo.friends.map((friend) => String(friend))}
                  />
                </>
              }
              {(mode === 'InitiateRecovery' || mode === 'VouchRecovery' || mode === 'Withdraw') &&
                <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                  <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                    {t<string>('Lost account')}
                  </Typography>
                  <Grid container item justifyContent='center'>
                    <Identity
                      accountInfo={mode === 'InitiateRecovery'
                        ? lostAccountAddress?.accountIdentity
                        : mode === 'VouchRecovery'
                          ? vouchRecoveryInfo?.lost.accountIdentity
                          : undefined}
                      api={api}
                      chain={chain}
                      direction='row'
                      formatted={mode === 'InitiateRecovery' || mode === 'Withdraw'
                        ? lostAccountAddress?.address
                        : vouchRecoveryInfo?.lost.address}
                      identiconSize={31}
                      showSocial={false}
                      style={{ maxWidth: '100%', width: 'fit-content' }}
                      withShortAddress
                    />
                    {mode === 'InitiateRecovery' &&
                      <Infotip2 text={<RecoveryInfo />}>
                        <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
                      </Infotip2>
                    }
                  </Grid>
                </Grid>
              }
              {mode === 'CloseRecovery' &&
                <>
                  {activeLost
                    ? <>
                      <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                          {t<string>('Account that initiated the recovery')}
                        </Typography>
                        <Identity
                          api={api}
                          chain={chain}
                          direction='row'
                          formatted={activeLost.rescuer}
                          identiconSize={31}
                          showSocial={false}
                          style={{ maxWidth: '100%', width: 'fit-content' }}
                          withShortAddress
                        />
                      </Grid>
                      <DisplayValue title={t<string>('Date of initiation')}>
                        <Typography fontSize='24px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                          {currentBlockNumber ? blockToDate(activeLost.createdBlock, currentBlockNumber) : '- - - -'}
                        </Typography>
                      </DisplayValue>
                    </>
                    : [0, 1, 2].map((item) => (
                      <Skeleton
                        height='25px'
                        key={item}
                        sx={{ mb: '5px', mx: 'auto', transform: 'none', width: '410px' }}
                      />
                    ))}
                </>
              }
              {mode === 'Withdraw' &&
                <WithdrawDetails step={STEPS.REVIEW} />
              }
              {!(mode === 'VouchRecovery' || (mode === 'Withdraw' && withdrawInfo?.claimed === true)) &&
                <DisplayValue
                  childrenFontSize='24px'
                  title={mode === 'RemoveRecovery'
                    ? t<string>('Releasing deposit')
                    : mode === 'InitiateRecovery'
                      ? t<string>('Initiation Deposit')
                      : mode === 'CloseRecovery'
                        ? t<string>('Deposit they made')
                        : mode === 'Withdraw'
                          ? t<string>('Initiation recovery deposit to be released')
                          : t<string>('Total Deposit')}
                >
                  <ShowBalance
                    api={api}
                    balance={mode === 'CloseRecovery' ? activeLost?.deposit : depositValue}
                    decimalPoint={4}
                    height={22}
                  />
                </DisplayValue>}
              <DisplayValue title={t<string>('Fee')}>
                <Grid alignItems='center' container item sx={{ fontSize: '24px', height: '42px' }}>
                  <ShowBalance
                    api={api}
                    balance={estimatedFee}
                    decimalPoint={4}
                  />
                </Grid>
              </DisplayValue>
            </Grid>
            {mode === 'Withdraw' && !(withdrawInfo?.soloStaked.isZero() && withdrawInfo?.poolStaked.isZero() && withdrawInfo?.soloUnlock.amount.isZero()) &&
              <Grid container item sx={{ '> div.belowInput': { m: 0, pl: '5px' }, height: '40px', pb: '15px' }}>
                <Warning
                  fontSize={'13px'}
                  fontWeight={400}
                  isBelowInput
                  theme={theme}
                >
                  {t<string>('For those funds that are available to withdraw later, you need to come back to this page to complete the process.')}
                </Warning>
              </Grid>}
            {mode === 'Withdraw' && nothingToWithdrawNow &&
              <Grid container item sx={{ '> div.belowInput': { m: 0, pl: '5px' }, height: '40px', pb: '15px' }}>
                <Warning
                  fontSize={'15px'}
                  fontWeight={500}
                  isBelowInput
                  theme={theme}
                >
                  {t<string>('There is no available fund to withdraw now!')}
                </Warning>
              </Grid>}
            <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
              <PasswordWithTwoButtonsAndUseProxy
                chain={chain}
                disabled={nothingToWithdrawNow}
                isPasswordError={isPasswordError}
                label={`${t<string>('Password')} for ${selectedProxyName || name || ''}`}
                onChange={setPassword}
                onPrimaryClick={onNext}
                onSecondaryClick={specific
                  ? closeWindow
                  : handleClose}
                primaryBtnText={t<string>('Confirm')}
                proxiedAddress={formatted}
                proxies={proxyItems}
                proxyTypeFilter={['Any', 'NonTransfer']}
                secondaryBtnText={t<string>('Cancel')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
              />
            </Grid>
          </>
        }
        {step === STEPS.PROXY &&
          <DraggableModal onClose={closeSelectProxy} open={step === STEPS.PROXY}>
            <Grid container item>
              <Grid alignItems='center' container item justifyContent='space-between'>
                <Typography fontSize='24px' fontWeight={700}>
                  {t<string>('Select Proxy')}
                </Typography>
                <Grid item>
                  <CloseIcon onClick={closeSelectProxy} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
                </Grid>
              </Grid>
              <SelectProxyModal
                address={address}
                height={500}
                nextStep={STEPS.REVIEW}
                proxies={proxyItems}
                proxyTypeFilter={['Any', 'NonTransfer']}
                selectedProxy={selectedProxy}
                setSelectedProxy={setSelectedProxy}
                setStep={setStep}
              />
            </Grid>
          </DraggableModal>
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM &&
          <Confirmation
            // eslint-disable-next-line react/jsx-no-bind
            WithdrawDetails={WithdrawDetails}
            activeLost={activeLost}
            decimal={decimal}
            depositValue={depositValue}
            handleClose={specific
              ? closeWindow
              : closeConfirmation}
            lostAccountAddress={lostAccountAddress}
            mode={mode}
            recoveryConfig={recoveryConfig}
            txInfo={txInfo}
            vouchRecoveryInfo={vouchRecoveryInfo}
          />
        }
      </>
    </Motion>
  );
}
