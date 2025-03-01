// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Balance } from '@polkadot/types/interfaces';
//@ts-ignore
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { ActiveRecoveryFor } from '../../hooks/useActiveRecoveries';
import type { Proxy, TxInfo } from '../../util/types';
import type { AddressWithIdentity } from './components/SelectTrustedFriend';
import type { InitiateRecoveryConfig, RecoveryConfigType, SocialRecoveryModes, WithdrawInfo } from './util/types';

import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { CanPayErrorAlert, EndRecoveryIcon, Identity, Infotip2, MakeRecoverableIcon, Motion, RescueRecoveryIcon, ShortAddress, ShowBalance, SignArea2, VouchRecoveryIcon, Warning, WrongPasswordAlert } from '../../components';
import { useCanPayFeeAndDeposit, useCurrentBlockNumber, useEstimatedFee, useInfo } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { ThroughProxy } from '../../partials';
import blockToDate from '../../popup/crowdloans/partials/blockToDate';
import { PROXY_TYPE } from '../../util/constants';
import { pgBoxShadow } from '../../util/utils';
import WaitScreen from '../governance/partials/WaitScreen';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import { toTitleCase } from '../governance/utils/util';
import Confirmation from './partial/Confirmation';
import TrustedFriendsDisplay from './partial/TrustedFriendsDisplay';
import recoveryDelayPeriod from './util/recoveryDelayPeriod';
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

const dateTimeFormat = { day: 'numeric', hour: '2-digit', hourCycle: 'h23', minute: '2-digit', month: 'short' } as Intl.DateTimeFormatOptions;

export default function Review({ activeLost, address, allActiveRecoveries, api, chain, depositValue, lostAccountAddress, mode, recoveryConfig, recoveryInfo, setMode, setRefresh, setStep, specific, step, vouchRecoveryInfo, withdrawInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { chainName, decimal, formatted } = useInfo(address);
  const currentBlockNumber = useCurrentBlockNumber(address);

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [nothingToWithdrawNow, setNothingToWithdrawNow] = useState<boolean>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const batchAll = api?.tx['utility']['batchAll'];
  const removeRecovery = api?.tx['recovery']['removeRecovery'];
  const createRecovery = api?.tx['recovery']['createRecovery'];
  const initiateRecovery = api?.tx['recovery']['initiateRecovery'];
  const closeRecovery = api?.tx['recovery']['closeRecovery'];
  const vouchRecovery = api?.tx['recovery']['vouchRecovery'];
  const claimRecovery = api?.tx['recovery']['claimRecovery'];
  const asRecovered = api?.tx['recovery']['asRecovered'];
  const chill = api?.tx['staking']['chill'];
  const unbonded = api?.tx['staking']['unbond'];
  const redeem = api?.tx['staking']['withdrawUnbonded'];
  const poolRedeem = api?.tx['nominationPools']['withdrawUnbonded'];
  const transferAll = api?.tx['balances']['transferAll']; // [rescuer.accountId, false]
  const clearIdentity = api?.tx['identity']['clearIdentity'];
  const removeProxies = api?.tx['proxy']['removeProxies'];
  const unbond = api?.tx['nominationPools']['unbond'];

  const depositToPay = useMemo(() => {
    if (['CloseRecovery', 'RemoveRecovery', 'VouchRecovery', 'Withdraw'].includes(mode ?? '')) {
      return BN_ZERO;
    } else if (mode === 'ModifyRecovery') {
      const partial = depositValue.gt(recoveryInfo?.deposit ?? BN_ZERO) ? depositValue.sub(recoveryInfo?.deposit ?? BN_ZERO) : BN_ZERO;

      return partial;
    } else {
      return depositValue;
    }
  }, [depositValue, mode, recoveryInfo]);

  const withdrawTXs = useCallback((): SubmittableExtrinsic<'promise', ISubmittableResult> | undefined => {
    if (!api || !batchAll || !redeem || !poolRedeem || !unbond || !clearIdentity || !claimRecovery || !removeProxies || !asRecovered || !closeRecovery || !unbonded || !removeRecovery || !chill || !withdrawInfo || !formatted || !transferAll || allActiveRecoveries === undefined) {
      return;
    }

    const tx: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];
    const withdrawCalls: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];

    !withdrawInfo.claimed && tx.push(claimRecovery(withdrawInfo.lost));
    allActiveRecoveries && allActiveRecoveries.filter((active) => active.lost === withdrawInfo.lost).forEach((activeRec) => withdrawCalls.push(closeRecovery(activeRec.rescuer)));
    withdrawInfo.isRecoverable && withdrawCalls.push(removeRecovery());
    !(withdrawInfo.soloStaked.isZero()) && withdrawCalls.push(chill(), unbonded(withdrawInfo.soloStaked));
    !(withdrawInfo.redeemable.amount.isZero()) && withdrawCalls.push(redeem(withdrawInfo.redeemable.count));
    !(withdrawInfo.poolStaked.amount.isZero() || withdrawInfo.poolStaked.hasRole) && withdrawCalls.push(unbond(withdrawInfo.lost, withdrawInfo.poolStaked.amount));
    !(withdrawInfo.poolRedeemable.amount.isZero()) && withdrawCalls.push(poolRedeem(withdrawInfo.lost, withdrawInfo.poolRedeemable.count));
    withdrawInfo.hasId && withdrawCalls.push(clearIdentity());
    withdrawInfo.hasProxy && withdrawCalls.push(removeProxies());
    (withdrawCalls.length > 0 || !withdrawInfo.availableBalance.isZero()) && withdrawCalls.push(transferAll(formatted, false));

    return tx.length > 0
      ? batchAll([...tx, asRecovered(withdrawInfo.lost, batchAll(withdrawCalls))])
      : asRecovered(withdrawInfo.lost, batchAll(withdrawCalls));
  }, [allActiveRecoveries, api, asRecovered, batchAll, poolRedeem, chill, clearIdentity, claimRecovery, closeRecovery, formatted, redeem, removeRecovery, removeProxies, transferAll, unbonded, unbond, withdrawInfo]);

  const call = useMemo(() => {
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
      const sortedFriends = recoveryConfig.friends.addresses.sort();

      return batchAll([removeRecovery(), createRecovery(sortedFriends, recoveryConfig.threshold, recoveryConfig.delayPeriod)]);
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

  const estimatedFee = useEstimatedFee(address, call);
  const feeAndDeposit = useCanPayFeeAndDeposit(formatted?.toString(), selectedProxy?.delegate, estimatedFee, depositToPay);

  const extraInfo = useMemo(() => ({
    action: 'Social Recovery',
    fee: String(estimatedFee || 0),
    subAction: toTitleCase(mode)
  }), [estimatedFee, mode]);

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
    withdrawInfo?.redeemable && !withdrawInfo.redeemable.amount.isZero() && toBeWithdrawn.push({ amount: withdrawInfo.redeemable.amount, label: 'Staking Redeemable' });
    withdrawInfo?.poolRedeemable && !withdrawInfo.poolRedeemable.amount.isZero() && toBeWithdrawn.push({ amount: withdrawInfo.poolRedeemable.amount, label: 'Pool Redeemable' });
    withdrawInfo?.reserved && !withdrawInfo.reserved.isZero() && toBeWithdrawn.push({ amount: withdrawInfo.reserved, label: 'Reserved' });
    withdrawInfo?.soloStaked && !withdrawInfo.soloStaked.isZero() && toBeWithdrawnLater.push({ amount: withdrawInfo.soloStaked, label: `Solo Stake (after ${chainName === 'polkadot' ? '28 days' : chainName === 'kusama' ? '7 days' : '0.5 day'})` });
    withdrawInfo?.soloUnlock && !withdrawInfo.soloUnlock.amount.isZero() && toBeWithdrawnLater.push({ amount: withdrawInfo.soloUnlock.amount, label: `Solo unstaking (${new Date(withdrawInfo.soloUnlock.date).toLocaleDateString('en-US', dateTimeFormat)})` });
    withdrawInfo?.poolUnlock && !withdrawInfo.poolUnlock.amount.isZero() && toBeWithdrawnLater.push({ amount: withdrawInfo.poolUnlock.amount, label: `Pool unstaking (${new Date(withdrawInfo.poolUnlock.date).toLocaleDateString('en-US', dateTimeFormat)})` });
    withdrawInfo?.poolStaked && !withdrawInfo.poolStaked.amount.isZero() && toBeWithdrawnLater.push({ amount: withdrawInfo.poolStaked.amount, label: `Pool Stake (after ${chainName === 'polkadot' ? '28 days' : chainName === 'kusama' ? '7 days' : '0.5 day'})` });

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
                    ? t('Funds available to be withdrawn now')
                    : t('Withdrawn Funds')}
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
                      ? t('Funds available to withdraw later')
                      : t('Funds will be withdrawn later')}
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
            {toBeWithdrawnLater.length === 0 && toBeWithdrawn.length === 0 &&
              <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0, pl: '5px' }, height: '55px', py: '15px' }}>
                <Warning
                  fontSize={'15px'}
                  fontWeight={500}
                  isBelowInput
                  theme={theme}
                >
                  {t<string>('There is no available fund to withdraw now!')}
                </Warning>
              </Grid>
            }
          </>
          : [0, 1, 2, 3, 4].map((item) => (
            <Skeleton
              animation='wave'
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
          {lostAccountAddress?.friends?.addresses.map((friend, index) =>
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
    <Motion style={{ height: '100%', width: '100%' }}>
      <>
        <Grid container direction='column' py='20px'>
          <Grid alignItems='center' container item mb='15px'>
            <Grid container item pr='10px' width='fit-content'>
              {((mode === 'SetRecovery' && [STEPS.REVIEW, STEPS.WAIT_SCREEN].includes(step)) || ['RemoveRecovery', 'ModifyRecovery'].includes(mode ?? '')) &&
                <MakeRecoverableIcon
                  color={theme.palette.text.primary}
                  height={45}
                  width={45}
                />
              }
              {mode === 'SetRecovery' && step === STEPS.CONFIRM &&
                <FontAwesomeIcon
                  color={txInfo?.success ? theme.palette.success.main : theme.palette.warning.main}
                  fontSize='45px'
                  icon={faShieldHalved}
                />
              }
              {mode === 'InitiateRecovery' &&
                <RescueRecoveryIcon
                  color={theme.palette.text.primary}
                  height={45}
                  width={45}
                />
              }
              {mode === 'VouchRecovery' &&
                <VouchRecoveryIcon
                  color={theme.palette.text.primary}
                  height={45}
                  width={45}
                />
              }
              {mode === 'CloseRecovery' &&
                <EndRecoveryIcon
                  color={theme.palette.text.primary}
                  height={45}
                  width={45}
                />
              }
            </Grid>
            <Typography fontSize='30px' fontWeight={700}>
              {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) && (
                <>
                  {mode === 'RemoveRecovery' && t('Making account unrecoverable')}
                  {mode === 'SetRecovery' && t('Make your account recoverable')}
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
          </Grid>
          {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) && mode && ['SetRecovery', 'InitiateRecovery', 'ModifyRecovery', 'VouchRecovery'].includes(mode) &&
            <Typography fontSize='22px' fontWeight={700}>
              {['InitiateRecovery', 'VouchRecovery'].includes(mode)
                ? t('Step 2 of 2: Review')
                : t('Step 3 of 3: Review')
              }
            </Typography>
          }
          {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) && mode === 'CloseRecovery' &&
            <Typography fontSize='14px' fontWeight={400}>
              {t('By terminating the recovery process, you will receive the tokens deposited by the suspected malicious account')}
            </Typography>
          }
        </Grid>
        {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            {feeAndDeposit.isAbleToPay === false &&
              <CanPayErrorAlert canPayStatements={feeAndDeposit.statement} />
            }
            <Grid container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), mb: '20px', p: '1% 3%' }}>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {mode === 'InitiateRecovery' || mode === 'VouchRecovery'
                    ? t('Rescuer account')
                    : t('Account')}
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
                  <ThroughProxy address={selectedProxyAddress} chain={chain as any} />
                </Grid>
              }
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
              {(mode === 'SetRecovery' || mode === 'ModifyRecovery') && recoveryConfig &&
                <>
                  <Typography fontSize='16px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                    {t<string>('Trusted friends')}
                  </Typography>
                  <TrustedFriendsDisplay
                    accountsInfo={recoveryConfig.friends.infos as unknown as DeriveAccountInfo[]}
                    api={api}
                    chain={chain as any}
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
                    chain={chain as any}
                    //@ts-ignore
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
                        animation='wave'
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
                    ? t('Releasing deposit')
                    : mode === 'InitiateRecovery'
                      ? t('Initiation Deposit')
                      : mode === 'CloseRecovery'
                        ? t('Deposit they made')
                        : mode === 'Withdraw'
                          ? t('Initiation recovery deposit to be released')
                          : t('Total Deposit')}
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
            {mode === 'Withdraw' && !(withdrawInfo?.soloStaked.isZero() && withdrawInfo?.poolStaked.amount.isZero() && withdrawInfo?.soloUnlock.amount.isZero()) &&
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
              <SignArea2
                address={address}
                call={call}
                disabled={nothingToWithdrawNow || feeAndDeposit.isAbleToPay !== true}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={specific
                  ? closeWindow
                  : handleClose}
                primaryBtnText={t<string>('Confirm')}
                proxyTypeFilter={PROXY_TYPE.GENERAL}
                secondaryBtnText={t<string>('Cancel')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setSelectedProxy={setSelectedProxy}
                setStep={setStep}
                setTxInfo={setTxInfo}
                step={step}
                steps={STEPS}
              />
            </Grid>
          </>
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
