// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE } from '@polkadot/util';

import { Identity, Motion, ShowBalance, WrongPasswordAlert } from '../../components';
import { useAccountDisplay, useCurrentBlockNumber, useDecimal, useFormatted, useProxies } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { ThroughProxy } from '../../partials';
import { signAndSend } from '../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../util/utils';
import { DraggableModal } from '../governance/components/DraggableModal';
import PasswordWithTwoButtonsAndUseProxy from '../governance/components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../governance/components/SelectProxyModal';
import WaitScreen from '../governance/partials/WaitScreen';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import { FriendWithId } from './components/SelectTrustedFriend';
import Confirmation from './partial/Confirmation';
import TrustedFriendsDisplay from './partial/TrustedFriendsDisplay';
import recoveryDelayPeriod from './util/recoveryDelayPeriod';
import { RecoveryConfigType, SocialRecoveryModes, STEPS } from '.';
import { ActiveRecoveryFor } from '../../hooks/useActiveRecoveries';
import blockToDate from '../crowdloans/partials/blockToDate';

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
  lostAccountAddress: FriendWithId | undefined;
  activeLost: ActiveRecoveryFor | null;
}

export default function Review({ activeLost, address, api, chain, depositValue, lostAccountAddress, mode, recoveryConfig, recoveryInfo, setRefresh, setStep, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const name = useAccountDisplay(address);
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const theme = useTheme();
  const decimal = useDecimal(address);
  const currentBlockNumber = useCurrentBlockNumber(address);

  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [password, setPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const batchAll = api && api.tx.utility.batchAll;
  const removeRecovery = api && api.tx.recovery.removeRecovery;
  const createRecovery = api && api.tx.recovery.createRecovery;
  const initiateRecovery = api && api.tx.recovery.initiateRecovery;
  const closeRecovery = api && api.tx.recovery.closeRecovery;

  const tx = useMemo(() => {
    if (!removeRecovery || !createRecovery || !initiateRecovery || !batchAll || !closeRecovery) {
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

    return undefined;
  }, [activeLost, batchAll, closeRecovery, createRecovery, initiateRecovery, lostAccountAddress, mode, recoveryConfig, removeRecovery]);

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
        subAction: `${mode}`,
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
    setStep(mode === 'RemoveRecovery' || mode === 'ModifyRecovery'
      ? STEPS.RECOVERYDETAIL
      : mode === 'SetRecovery'
        ? STEPS.MAKERECOVERABLE
        : STEPS.INDEX);
  }, [mode, setStep]);

  const closeSelectProxy = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    setStep(STEPS.CHECK_SCREEN);
  }, [setRefresh, setStep]);

  return (
    <Motion style={{ height: '100%', paddingInline: '10%', width: '100%' }}>
      <>
        <Grid container py='20px'>
          <Typography fontSize='30px' fontWeight={700}>
            {(step === STEPS.REVIEW || step === STEPS.PROXY) && (
              <>
                {mode === 'RemoveRecovery' && t('Making account unrecoverable')}
                {mode === 'SetRecovery' && t('Step 3 of 3: Making account recoverable review')}
                {mode === 'ModifyRecovery' && t('Step 3 of 3: Modify account recoverability review')}
                {mode === 'InitiateRecovery' && t('Step 2 of 2: Initiate Recovery review')}
                {mode === 'CloseRecovery' && t('Close the recovery process and claim the deposit from possible malicious account')}
              </>
            )}
            {step === STEPS.WAIT_SCREEN && (
              <>
                {mode === 'RemoveRecovery' && t('Making account unrecoverable')}
                {mode === 'SetRecovery' && t('Making account recoverable')}
                {mode === 'ModifyRecovery' && t('Modifying account recoverability')}
                {mode === 'InitiateRecovery' && t('Initiating Recovery')}
                {mode === 'CloseRecovery' && t('Closing the recovery process')}
              </>
            )}
            {step === STEPS.CONFIRM && mode === 'RemoveRecovery' && (
              txInfo?.success ? t('Your account is not recoverable anymore.') : t('Making account unrecoverable failed')
            )}
            {step === STEPS.CONFIRM && mode === 'SetRecovery' && (
              txInfo?.success ? t('Your account is recoverable.') : t('Making account recoverable failed')
            )}
            {step === STEPS.CONFIRM && mode === 'ModifyRecovery' && (
              txInfo?.success ? t('Account recoverability modified.') : t('Modifying account recoverability failed')
            )}
            {step === STEPS.CONFIRM && mode === 'InitiateRecovery' && (
              txInfo?.success ? t('Recovery Initiated') : t('Initiating Recovery failed')
            )}
            {step === STEPS.CONFIRM && mode === 'CloseRecovery' && (
              txInfo?.success ? t('Initiated recovery has been closed.') : t('Closing Recovery failed')
            )}
          </Typography>
        </Grid>
        {(step === STEPS.REVIEW || step === STEPS.PROXY) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', mb: '20px', p: '1% 3%' }}>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {mode === 'InitiateRecovery'
                    ? t<string>('Rescuer account')
                    : t<string>('Account holder')}
                </Typography>
                <Identity
                  address={address}
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
                    {t<string>('trusted friends')}
                  </Typography>
                  <TrustedFriendsDisplay
                    accountsInfo={recoveryConfig.friends.infos}
                    api={api}
                    chain={chain}
                    friends={recoveryConfig.friends.addresses}
                  />
                  <DisplayValue title={t<string>('Recovery Threshold')}>
                    <Typography fontSize='28px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                      {`${recoveryConfig.threshold} of ${recoveryConfig.friends.addresses.length}`}
                    </Typography>
                  </DisplayValue>
                  <DisplayValue title={t<string>('Recovery Delay')}>
                    <Typography fontSize='28px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
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
              {mode === 'InitiateRecovery' &&
                <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                  <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                    {t<string>('Lost account')}
                  </Typography>
                  <Identity
                    accountInfo={lostAccountAddress?.accountIdentity}
                    api={api}
                    chain={chain}
                    direction='row'
                    formatted={lostAccountAddress?.address}
                    identiconSize={31}
                    showSocial={false}
                    style={{ maxWidth: '100%', width: 'fit-content' }}
                    withShortAddress
                  />
                </Grid>
              }
              {mode === 'CloseRecovery' && activeLost &&
                <>
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
                    <Typography fontSize='28px' fontWeight={400} sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                      {currentBlockNumber ? blockToDate(activeLost.createdBlock, currentBlockNumber) : '- - - -'}
                    </Typography>
                  </DisplayValue>
                </>
              }
              <DisplayValue title={mode === 'RemoveRecovery'
                ? t<string>('Releasing deposit')
                : mode === 'InitiateRecovery'
                  ? t<string>('Initiation Deposit')
                  : mode === 'CloseRecovery'
                    ? t<string>('Deposit they made')
                    : t<string>('Total Deposit')}
              >
                <ShowBalance
                  api={api}
                  balance={mode === 'CloseRecovery' ? activeLost?.deposit : depositValue}
                  decimalPoint={4}
                  height={22}
                />
              </DisplayValue>
              <DisplayValue title={t<string>('Fee')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ShowBalance
                    api={api}
                    balance={estimatedFee}
                    decimalPoint={4}
                  />
                </Grid>
              </DisplayValue>
            </Grid>
            <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
              <PasswordWithTwoButtonsAndUseProxy
                chain={chain}
                isPasswordError={isPasswordError}
                label={`${t<string>('Password')} for ${selectedProxyName || name || ''}`}
                onChange={setPassword}
                onPrimaryClick={onNext}
                onSecondaryClick={handleClose}
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
                <Typography fontSize='22px' fontWeight={700}>
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
            decimal={decimal}
            depositValue={depositValue}
            handleClose={closeConfirmation}
            lostAccountAddress={lostAccountAddress}
            mode={mode}
            recoveryConfig={recoveryConfig}
            txInfo={txInfo}
          />
        }
      </>
    </Motion>
  );
}
