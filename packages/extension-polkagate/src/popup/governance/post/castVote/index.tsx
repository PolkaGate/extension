// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useApi, useDecimal, useFormatted, useProxies, useTranslation } from '../../../../hooks';
import { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import { DraggableModal } from '../../components/DraggableModal';
import SelectProxyModal from '../../components/SelectProxyModal';
import WaitScreen from '../../partials/WaitScreen';
import { getVoteType } from '../../utils/util';
import { getConviction, Vote } from '../myVote/util';
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
  PROXY: 100
};

export default function Index({ address, cantModify, hasVoted, myVote, notVoted, open, refIndex, setOpen, setRefresh, showAbout, status, trackId }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const decimal = useDecimal(address);
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [voteInformation, setVoteInformation] = useState<VoteInformation | undefined>();
  const vote = api && api.tx.convictionVoting.vote;
  const [step, setStep] = useState<number>(showAbout ? STEPS.ABOUT : STEPS.CHECK_SCREEN);
  const [alterType, setAlterType] = useState<'modify' | 'remove'>();

  const voteTx = api && api.tx.convictionVoting.vote;
  const removeTx = api && api.tx.convictionVoting.removeVote;

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
  }, [decimal, myVote, refIndex, trackId]);

  useEffect(() => {
    if (!formatted || !vote) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const dummyVote = undefined;
    const feeDummyParams = ['1', dummyVote];

    vote(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, vote]);

  const handleClose = useCallback(() => {
    if (step === STEPS.PROXY) {
      setStep(alterType === 'remove' ? STEPS.REMOVE : STEPS.REVIEW);

      return;
    }

    setOpen(false);
  }, [setOpen, step]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    if (step === STEPS.CHECK_SCREEN && notVoted !== undefined) {
      notVoted ? setStep(STEPS.INDEX) : setStep(STEPS.PREVIEW);
    }
  }, [notVoted, step]);

  const Header = () => (
    <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
      <Grid item>
        <Typography fontSize='22px' fontWeight={700}>
          {step === STEPS.ABOUT &&
            t<string>('About Voting')
          }
          {step === STEPS.INDEX &&
            <>
              {
                hasVoted
                  ? t<string>('Modify Your Vote')
                  : t<string>('Cast Your Vote')
              }
            </>
          }
          {step === STEPS.REMOVE &&
            t<string>('Remove Your Vote')
          }
          {step === STEPS.PREVIEW &&
            t<string>('Vote Details')
          }
          {step === STEPS.REVIEW &&
            t<string>('Review Your Vote')
          }
          {step === STEPS.WAIT_SCREEN &&
            <>
              {alterType === 'remove'
                ? t<string>('Removing vote')
                : t<string>('Voting')
              }
            </>
          }
          {step === STEPS.CONFIRM &&
            <>
              {alterType === 'remove'
                ? t<string>('Vote has been removed')
                : t<string>('Voting Completed')
              }
            </>
          }
          {step === STEPS.PROXY &&
            t<string>('Select Proxy')
          }
        </Typography>
      </Grid>
      <Grid item>
        {step !== STEPS.WAIT_SCREEN &&
          <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
        }
      </Grid>
    </Grid>
  );

  return (
    <DraggableModal onClose={handleClose} open={open}>
      <>
        <Header />
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
        {((step === STEPS.REVIEW && voteInformation) || (step === STEPS.REMOVE && votedInfo)) && (
          <Review
            address={address}
            estimatedFee={estimatedFee}
            formatted={String(formatted)}
            proxyItems={proxyItems}
            selectedProxy={selectedProxy}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            status={status}
            step={step}
            tx={alterType === 'remove' ? removeTx : voteTx}
            voteInformation={voteInformation || votedInfo}
          />
        )}
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
          <SelectProxyModal
            address={address}
            nextStep={alterType === 'remove' ? STEPS.REMOVE : STEPS.REVIEW}
            proxies={proxyItems}
            proxyTypeFilter={['Any', 'Governance', 'NonTransfer']}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
            setStep={setStep}
          // height={modalHeight}
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
            voteInformation={voteInformation || votedInfo}
          />
        }
      </>
    </DraggableModal>
  );
}
