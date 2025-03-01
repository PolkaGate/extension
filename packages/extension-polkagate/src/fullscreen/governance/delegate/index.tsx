// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, TxInfo } from '../../../util/types';
import type { DelegationInfo } from '../utils/types';
import type { ModifyModes } from './modify/ModifyDelegate';

import { faUserAstronaut } from '@fortawesome/free-solid-svg-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN_ONE, noop } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useAccountLocks, useBalances, useInfo, useProxies, useTracks, useTranslation } from '../../../hooks';
import { PROXY_TYPE } from '../../../util/constants';
import { DraggableModalWithTitle } from '../components/DraggableModalWithTitle';
import SelectProxyModal2 from '../components/SelectProxyModal2';
import WaitScreen from '../partials/WaitScreen';
import { getMyDelegationInfo } from '../utils/util';
import ChooseDelegator from './delegate/ChooseDelegator';
import DelegateVote from './delegate/Delegate';
import { getAlreadyLockedValue } from './partial/AlreadyLockedTooltipText';
import Confirmation from './partial/Confirmation';
import About from './About';
import DelegationDetails from './DelegationDetails';
import Review from './Review';

interface Props {
  api: ApiPromise | undefined;
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void;
  showDelegationNote: boolean;
}

export interface DelegateInformation {
  delegateeAddress?: string | null;
  delegateAmount: string;
  delegateAmountBN: BN;
  delegateConviction: number;
  delegatePower: number;
  delegatedTracks: BN[];
}

export interface AlreadyDelegateInformation {
  delegatee: string;
  info: {
    track: BN;
    delegatedBalance: BN;
    conviction: number;
  }[];
}

export const STEPS = {
  ABOUT: 0,
  CHECK_SCREEN: 1,
  INDEX: 2,
  PREVIEW: 3,
  MODIFY: 4,
  CHOOSE_DELEGATOR: 5,
  REMOVE: 6,
  REVIEW: 7,
  WAIT_SCREEN: 8,
  CONFIRM: 9,
  PROXY: 100,
  SIGN_QR: 200
};

export type DelegationStatus = 'Delegate' | 'Remove' | 'Modify';

export function Delegate({ address, open, setOpen, showDelegationNote }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, formatted } = useInfo(address);
  const tracksList = useTracks(address);
  const balances = useBalances(address, undefined, undefined, true);

  const lockedAmount = useMemo(() => getAlreadyLockedValue(balances), [balances]);
  const accountLocks = useAccountLocks(address, 'referenda', 'convictionVoting');
  const proxies = useProxies(api, formatted);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [step, setStep] = useState<number>(showDelegationNote ? STEPS.ABOUT : STEPS.CHECK_SCREEN);
  const [mode, setMode] = useState<ModifyModes>('Modify');
  const [delegateInformation, setDelegateInformation] = useState<DelegateInformation | undefined>();
  const [alreadyDelegationInfo, setAlreadyDelegationInfo] = useState<DelegationInfo[] | null | undefined>();
  const [filteredDelegation, setFilteredDelegation] = useState<AlreadyDelegateInformation[] | undefined>();
  const [status, setStatus] = useState<DelegationStatus>('Delegate');
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [selectedTracksLength, setSelectedTracksLength] = useState<number | undefined>();
  const [modalHeight, setModalHeight] = useState<number | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyStep, setProxyStep] = useState<number>();

  const delegate = api?.tx['convictionVoting']['delegate'];
  const batch = api?.tx['utility']['batchAll'];

  useEffect(() => {
    if (step === STEPS.PROXY) {
      return;
    }

    setProxyStep(step);
  }, [step]);

  const title = useMemo(() => {
    if (step === STEPS.ABOUT) {
      return t('Delegate Vote');
    }

    if (step === STEPS.CHECK_SCREEN) {
      return t('Delegation status');
    }

    if ([STEPS.INDEX, STEPS.CHOOSE_DELEGATOR].includes(step)) {
      return t('Delegate Vote ({{ step }}/3)', { replace: { step: step === STEPS.INDEX ? 1 : 2 } });
    }

    if (step === STEPS.PREVIEW) {
      return t('Delegation details');
    }

    if ([STEPS.REVIEW, STEPS.SIGN_QR].includes(step) && status === 'Delegate') {
      return t('Review Your Delegation (3/3)');
    }

    if ([STEPS.REMOVE, STEPS.SIGN_QR].includes(step) && status === 'Remove') {
      return t('Remove Delegate');
    }

    if ([STEPS.MODIFY, STEPS.SIGN_QR].includes(step) && status === 'Modify') {
      return t('Modify Delegate');
    }

    if (step === STEPS.WAIT_SCREEN) {
      if (status === 'Delegate') {
        return t('Delegating');
      } else if (status === 'Modify') {
        return t('Modifying Delegation');
      } else {
        return t('Removing Delegation');
      }
    }

    if (step === STEPS.CONFIRM) {
      if (status === 'Delegate') {
        return txInfo?.success ? t('Delegation Completed') : t('Delegation Failed');
      } else if (status === 'Modify') {
        return txInfo?.success ? t('Delegations Modified') : t('Modifying Delegations Failed');
      } else {
        return txInfo?.success ? t('Delegations Removed') : t('Removing Delegations Failed');
      }
    }

    if (step === STEPS.PROXY) {
      return t('Select Proxy');
    }

    return '';
  }, [status, step, t, txInfo?.success]);

  const handleClose = useCallback(() => {
    step !== STEPS.PROXY ? setOpen(false) : proxyStep && setStep(proxyStep);
  }, [proxyStep, setOpen, step]);

  useEffect(() => {
    if (step > STEPS.CHECK_SCREEN) {
      return;
    }

    getMyDelegationInfo(api, formatted, tracksList?.tracks).then((ids) => {
      setAlreadyDelegationInfo(ids);
    }).catch(console.error);
  }, [api, formatted, step, tracksList?.tracks]);

  useEffect(() => {
    if (step === STEPS.ABOUT || step > STEPS.CHECK_SCREEN) {
      return;
    }

    alreadyDelegationInfo === undefined
      ? setStep(STEPS.CHECK_SCREEN)
      : alreadyDelegationInfo === null
        ? setStep(STEPS.INDEX)
        : setStep(STEPS.PREVIEW);
  }, [alreadyDelegationInfo, step]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    if (!delegate || !batch || !delegateInformation?.delegateeAddress) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE) as Balance);
    }

    if (delegateInformation.delegatedTracks.length > 1) {
      const txList = delegateInformation.delegatedTracks.map((track) =>
        delegate(...[
          track,
          delegateInformation.delegateeAddress,
          delegateInformation.delegateConviction,
          delegateInformation.delegateAmountBN
        ]));

      batch(txList)
        .paymentInfo(delegateInformation.delegateeAddress)
        .then((i) => setEstimatedFee(api?.createType('Balance', i?.partialFee) as Balance))
        .catch(console.error);
    } else {
      const tx = delegate(...[
        delegateInformation.delegatedTracks[0],
        delegateInformation.delegateeAddress,
        delegateInformation.delegateConviction,
        delegateInformation.delegateAmountBN
      ]);

      tx
        .paymentInfo(delegateInformation.delegateeAddress)
        .then((i) => setEstimatedFee(api?.createType('Balance', i?.partialFee) as Balance))
        .catch(console.error);
    }
  }, [api, batch, delegate, delegateInformation, delegateInformation?.delegateeAddress]);

  const filterDelegation = useCallback((infos: DelegationInfo[]) => {
    const temp: AlreadyDelegateInformation[] = [];

    infos.forEach((info) => {
      if (temp.length === 0) {
        temp.push({
          delegatee: String(info.delegatee),
          info: [{
            conviction: info.conviction,
            delegatedBalance: info.delegatedBalance,
            track: info.track
          }]
        });
      } else {
        const objectAddr = temp.find((ob) => String(ob.delegatee) === String(info.delegatee));

        if (objectAddr) {
          objectAddr.info.push({ conviction: info.conviction, delegatedBalance: info.delegatedBalance, track: info.track });
        } else {
          temp.push({
            delegatee: String(info.delegatee),
            info: [{
              conviction: info.conviction,
              delegatedBalance: info.delegatedBalance,
              track: info.track
            }]
          });
        }
      }
    });

    return temp;
  }, []);

  useEffect(() => {
    if (!alreadyDelegationInfo) {
      return;
    }

    const filtered = filterDelegation(alreadyDelegationInfo);

    setFilteredDelegation(filtered);
  }, [alreadyDelegationInfo, filterDelegation]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  return (
    <DraggableModalWithTitle
      icon={step === STEPS.PROXY ? faUserAstronaut : 'vaadin:money-withdraw'}
      onClose={step !== STEPS.WAIT_SCREEN ? handleClose : noop}
      open={open}
      title={title}
    >
      <>
        {step === STEPS.ABOUT &&
          <About
            setStep={setStep}
          />
        }
        {step === STEPS.CHECK_SCREEN &&
          <WaitScreen
            defaultText={t('Checking your delegating status...')}
            showCube
          />
        }
        {step === STEPS.INDEX &&
          <DelegateVote
            accountLocks={accountLocks}
            address={address}
            api={api}
            balances={balances}
            delegateInformation={delegateInformation}
            estimatedFee={estimatedFee}
            lockedAmount={lockedAmount}
            setDelegateInformation={setDelegateInformation}
            setStatus={setStatus}
            setStep={setStep}
            tracks={tracksList?.tracks}
          />
        }
        {step === STEPS.CHOOSE_DELEGATOR &&
          <ChooseDelegator
            setDelegateInformation={setDelegateInformation}
            setStep={setStep}
          />
        }
        {(([STEPS.REMOVE, STEPS.MODIFY, STEPS.SIGN_QR].includes(step) && ['Remove', 'Modify'].includes(status)) || step === STEPS.PREVIEW) &&
          <DelegationDetails
            accountLocks={accountLocks}
            address={address}
            balances={balances}
            filteredDelegation={filteredDelegation}
            formatted={String(formatted)}
            lockedAmount={lockedAmount}
            mode={mode}
            selectedProxy={selectedProxy}
            setDelegateInformation={setDelegateInformation}
            setModalHeight={setModalHeight}
            setMode={setMode}
            setSelectedTracksLength={setSelectedTracksLength}
            setStatus={setStatus}
            setStep={setStep}
            setTxInfo={setTxInfo}
            status={status}
            step={step}
          />
        }
        {[STEPS.REVIEW, STEPS.SIGN_QR].includes(step) && status === 'Delegate' && delegateInformation &&
          <Review
            address={address}
            delegateInformation={delegateInformation}
            estimatedFee={estimatedFee}
            formatted={String(formatted)}
            handleClose={handleClose}
            selectedProxy={selectedProxy}
            setModalHeight={setModalHeight}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
          />
        }
        {step === STEPS.PROXY &&
          <SelectProxyModal2
            address={address}
            // eslint-disable-next-line react/jsx-no-bind
            closeSelectProxy={() => proxyStep && setStep(proxyStep)}
            height={modalHeight}
            proxies={proxyItems}
            proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && txInfo && (status === 'Remove' ? true : delegateInformation) &&
          <Confirmation
            address={address}
            allCategoriesLength={tracksList?.tracks?.length}
            delegateInformation={delegateInformation}
            handleClose={handleClose}
            removedTracksLength={selectedTracksLength}
            status={status}
            txInfo={txInfo}
          />
        }
      </>
    </DraggableModalWithTitle>
  );
}
