// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useAccountLocks, useBalances, useInfo, useProxies, useTracks, useTranslation } from '../../../hooks';
import type { Proxy, ProxyItem, TxInfo } from '../../../util/types';
import { DraggableModal } from '../components/DraggableModal';
import SelectProxyModal2 from '../components/SelectProxyModal2';
import WaitScreen from '../partials/WaitScreen';
import { GOVERNANCE_PROXY } from '../utils/consts';
import { DelegationInfo } from '../utils/types';
import { getMyDelegationInfo } from '../utils/util';
import ChooseDelegator from './delegate/ChooseDelegator';
import DelegateVote from './delegate/Delegate';
import { ModifyModes } from './modify/ModifyDelegate';
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
  delegateeAddress?: string;
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

export function Delegate ({ address, open, setOpen, showDelegationNote }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const delegate = api && api.tx.convictionVoting.delegate;
  const batch = api && api.tx.utility.batchAll;

  useEffect(() => {
    if (step === STEPS.PROXY) {
      return;
    }

    setProxyStep(step);
  }, [step]);

  const handleClose = useCallback(() => {
    step !== STEPS.PROXY ? setOpen(false) : setStep(proxyStep);
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
    if (!delegate || !batch || !delegateInformation || !delegateInformation.delegateeAddress) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
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
        .then((i) => setEstimatedFee(i?.partialFee))
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
        .then((i) => setEstimatedFee(i?.partialFee))
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
    <DraggableModal onClose={handleClose} open={open}>
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {step === STEPS.ABOUT &&
                t('Delegate Vote')
              }
              {[STEPS.INDEX, STEPS.CHOOSE_DELEGATOR].includes(step) &&
                t('Delegate Vote ({{ step }}/3)', { replace: { step: step === STEPS.INDEX ? 1 : 2 } })
              }
              {step === STEPS.PREVIEW &&
                t('Delegation details')
              }
              {[STEPS.REVIEW, STEPS.SIGN_QR].includes(step) && status === 'Delegate' &&
                t('Review Your Delegation (3/3)')
              }
              {[STEPS.REMOVE, STEPS.SIGN_QR].includes(step) && status === 'Remove' &&
                t('Remove Delegate')
              }
              {[STEPS.MODIFY, STEPS.SIGN_QR].includes(step) && status === 'Modify' &&
                t('Modify Delegate')
              }
              {step === STEPS.WAIT_SCREEN
                ? status === 'Delegate'
                  ? t('Delegating')
                  : status === 'Modify'
                    ? t('Modifying Delegation')
                    : t('Removing Delegation')
                : undefined
              }
              {step === STEPS.CONFIRM
                ? status === 'Delegate'
                  ? txInfo?.success
                    ? t('Delegation Completed')
                    : t('Delegation Failed')
                  : status === 'Modify'
                    ? txInfo?.success
                      ? t('Delegations Modified')
                      : t('Modifying Delegations Failed')
                    : txInfo?.success
                      ? t('Delegations Removed')
                      : t('Removing Delegations Failed')
                : undefined
              }
              {step === STEPS.PROXY &&
                t('Select Proxy')
              }
            </Typography>
          </Grid>
          <Grid item>
            {step !== STEPS.WAIT_SCREEN && <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />}
          </Grid>
        </Grid>
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
            closeSelectProxy={() => setStep(proxyStep)}
            height={modalHeight}
            proxies={proxyItems}
            proxyTypeFilter={GOVERNANCE_PROXY}
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
    </DraggableModal>
  );
}
