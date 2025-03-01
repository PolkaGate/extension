// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import type { Vote } from '../myVote/util';

import { faVoteYea } from '@fortawesome/free-solid-svg-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, noop } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../../hooks';
import { PROXY_TYPE } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import { DraggableModalWithTitle } from '../../components/DraggableModalWithTitle';
import SelectProxyModal2 from '../../components/SelectProxyModal2';
import WaitScreen from '../../partials/WaitScreen';
import { getVoteType } from '../../utils/util';
import { getConviction } from '../myVote/util';
import About from './About';
import Cast from './Cast';
import Confirmation from './Confirmation';
import Preview from './Preview';
import Review from './Review';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
  trackId: number | undefined;
  refIndex: number | undefined;
  showAbout: boolean;
  myVote: Vote | null | undefined;
  hasVoted: boolean | null | undefined;
  notVoted: boolean | null | undefined;
  cantModify: boolean;
  status: string | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export interface VoteInformation {
  voteBalance: string;
  voteAmountBN: BN;
  votePower: BN;
  voteConvictionValue: number;
  voteLockUpUpPeriod: string;
  voteType: 'Aye' | 'Nay' | 'Abstain';
  trackId: number;
  refIndex: number;
}

export const STEPS = {
  ABOUT: 0,
  CHECK_SCREEN: 1,
  INDEX: 2,
  PREVIEW: 3,
  MODIFY: 4,
  REMOVE: 5,
  REVIEW: 6,
  WAIT_SCREEN: 7,
  CONFIRM: 8,
  PROXY: 100,
  SIGN_QR: 200
};

export default function Index({ address, cantModify, hasVoted, myVote, notVoted, open, refIndex, setOpen, setRefresh, showAbout, status, trackId }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api, decimal, formatted } = useInfo(address);
  const proxies = useProxies(api, formatted);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [voteInformation, setVoteInformation] = useState<VoteInformation | undefined>();
  const [step, setStep] = useState<number>(showAbout ? STEPS.ABOUT : STEPS.CHECK_SCREEN);
  const [alterType, setAlterType] = useState<'modify' | 'remove'>();
  const [reviewModalHeight, setReviewModalHeight] = useState<number | undefined>();

  const voteTx = api?.tx['convictionVoting']['vote'];
  const removeTx = api?.tx['convictionVoting']['removeVote'];

  const estimatedFee = useEstimatedFee(address, voteTx, ['1', undefined]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const votedInfo = useMemo(() => {
    if (myVote && decimal) {
      const amount = amountToHuman(myVote?.standard?.balance || myVote?.splitAbstain?.abstain, decimal);
      const conviction = myVote?.standard ? getConviction(myVote.standard.vote) : 0;
      const myDelegations = myVote?.delegations?.votes;
      const voteAmountBN = amountToMachine(amount, decimal);
      const multipliedAmount = conviction !== 0.1 ? voteAmountBN.muln(conviction) : voteAmountBN.divn(10);
      const votePower = myDelegations ? new BN(myDelegations).add(multipliedAmount) : multipliedAmount;

      return { // note this will be used for remove state
        refIndex,
        trackId,
        voteAmountBN,
        voteBalance: amount,
        voteConvictionValue: conviction === 0.1 ? 0 : conviction,
        voteLockUpUpPeriod: undefined,
        votePower,
        voteType: getVoteType(myVote)
      };
    }

    return undefined;
  }, [decimal, myVote, refIndex, trackId]);

  const title = useMemo(() => {
    switch (step) {
      case STEPS.ABOUT:
        return t('About Voting');

      case STEPS.CHECK_SCREEN:
        return t('Checking');

      case STEPS.INDEX:
        return t(hasVoted ? 'Modify Your Vote' : 'Cast Your Vote');

      case STEPS.REMOVE:
        return t('Remove Your Vote');

      case STEPS.PREVIEW:
        return t('Vote Details');

      case STEPS.REVIEW:
        return t('Review Your Vote');

      case STEPS.WAIT_SCREEN:
        return t(alterType === 'remove' ? 'Removing vote' : 'Voting');

      case STEPS.CONFIRM:
        return t(alterType === 'remove' ? 'Vote has been removed' : 'Voting Completed');

      case STEPS.PROXY:
        return t('Select Proxy');

      default:
        return '';
    }
  }, [step, hasVoted, alterType, t]);

  const handleClose = useCallback(() => {
    if (step === STEPS.PROXY) {
      setStep(alterType === 'remove' ? STEPS.REMOVE : STEPS.REVIEW);

      return;
    }

    setOpen(false);
  }, [alterType, setOpen, step]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    if (step === STEPS.CHECK_SCREEN && notVoted !== undefined) {
      notVoted ? setStep(STEPS.INDEX) : setStep(STEPS.PREVIEW);
    }
  }, [notVoted, step]);

  return (
    <DraggableModalWithTitle icon={faVoteYea} onClose={step !== STEPS.WAIT_SCREEN ? handleClose : noop} open={open} title={title}>
      <>
        {step === STEPS.ABOUT &&
          <About
            nextStep={
              notVoted === undefined
                ? STEPS.CHECK_SCREEN
                : notVoted || notVoted === null
                  ? STEPS.INDEX
                  : STEPS.PREVIEW
            }
            setStep={setStep}
          />
        }
        {step === STEPS.CHECK_SCREEN &&
          <WaitScreen
            defaultText={t('Checking your voting status...')}
            showCube
          />
        }
        {step === STEPS.INDEX &&
          <Cast
            address={address}
            notVoted={notVoted}
            previousVote={myVote}
            refIndex={refIndex}
            setStep={setStep}
            setVoteInformation={setVoteInformation}
            step={step}
            trackId={trackId}
          />
        }
        {((step === STEPS.REVIEW && voteInformation) || (step === STEPS.REMOVE && votedInfo) || step === STEPS.SIGN_QR) &&
          <Review
            address={address}
            estimatedFee={estimatedFee}
            formatted={String(formatted)}
            proxyItems={proxyItems}
            selectedProxy={selectedProxy}
            setModalHeight={setReviewModalHeight}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            status={status}
            step={step}
            tx={alterType === 'remove' ? removeTx : voteTx}
            txType={alterType === 'remove' ? 'Remove' : 'Vote'}
            //@ts-ignore
            voteInformation={voteInformation || votedInfo}
          />
        }
        {step === STEPS.PREVIEW &&
          <Preview
            address={address}
            cantModify={cantModify}
            setAlterType={setAlterType}
            setStep={setStep}
            vote={myVote}
          />
        }
        {step === STEPS.PROXY &&
          <SelectProxyModal2
            address={address}
            // eslint-disable-next-line react/jsx-no-bind
            closeSelectProxy={() => setStep(alterType === 'remove' ? STEPS.REMOVE : STEPS.REVIEW)}
            height={reviewModalHeight}
            proxies={proxyItems}
            proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && (voteInformation || votedInfo) && txInfo &&
          <Confirmation
            address={address}
            alterType={alterType}
            handleClose={handleClose}
            txInfo={txInfo}
            //@ts-ignore
            voteInformation={voteInformation || votedInfo}
          />
        }
      </>
    </DraggableModalWithTitle>
  );
}
