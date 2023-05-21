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

import { useApi, useFormatted, useProxies, useTranslation } from '../../../../hooks';
import { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { DraggableModal } from '../../components/DraggableModal';
import SelectProxyModal from '../../components/SelectProxyModal';
import WaitScreen from '../../partials/WaitScreen';
import { ReferendumSubScan } from '../../utils/types';
import { Vote } from '../myVote/util';
import Preview from './partial/Preview';
import Review from './partial/Review';
import About from './About';
import Cast from './Cast';
import Confirmation from './partial/Confirmation';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
  referendumInfo: ReferendumSubScan | undefined;
  showAbout: boolean;
  myVote: Vote | null | undefined;
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

export default function Index({ address, myVote, open, referendumInfo, setOpen, showAbout }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const notVoted = useMemo(() => myVote === null || (myVote && !('standard' in myVote)), [myVote]);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [voteInformation, setVoteInformation] = useState<VoteInformation | undefined>();
  const vote = api && api.tx.convictionVoting.vote;
  const [step, setStep] = useState<number>(showAbout ? STEPS.ABOUT : STEPS.CHECK_SCREEN);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

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

  // const refreshAll = useCallback(() => {
  //   setVoteAmount('0');
  //   setVoteType(undefined);
  //   setVoteInformation(undefined);
  //   setConviction(undefined);
  //   setStep(0);
  // }, []);

  const handleClose = useCallback(() => {
    if (step === STEPS.PROXY) {
      setStep((step) => step - 1);

      return;
    }

    setOpen(false);
    // refreshAll();
  }, [setOpen, step]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    if (step === STEPS.CHECK_SCREEN && notVoted !== undefined) {
      notVoted ? setStep(STEPS.INDEX) : setStep(STEPS.PREVIEW);
    }
  }, [notVoted, step]);

  return (
    <DraggableModal onClose={handleClose} open={open}>
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {step === STEPS.ABOUT &&
                t<string>('About Voting')
              }
              {step === STEPS.INDEX &&
                t<string>('Cast Your Vote')
              }
              {step === STEPS.REVIEW &&
                t<string>('Review Your Vote')
              }
              {step === STEPS.PREVIEW &&
                t<string>('Preview Your Vote')
              }
              {step === STEPS.WAIT_SCREEN &&
                t<string>('Voting')
              }
              {step === STEPS.CONFIRM &&
                t<string>('Voting Completed')
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
        {step === STEPS.ABOUT &&
          <About setStep={setStep} />
        }
        {step === STEPS.INDEX &&
          <Cast
            address={address}
            referendumInfo={referendumInfo}
            setStep={setStep}
            setVoteInformation={setVoteInformation}
            step={step}
            vote={myVote}
          />
        }
        {step === STEPS.REVIEW && voteInformation &&
          <Review
            address={address}
            estimatedFee={estimatedFee}
            formatted={String(formatted)}
            proxyItems={proxyItems}
            selectedProxy={selectedProxy}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
            voteInformation={voteInformation}
          />
        }
        {step === STEPS.CHECK_SCREEN &&
          <WaitScreen
            defaultText={t('Checking your voting status...')}
          />
        }
        {step === STEPS.PREVIEW &&
          <Preview
            address={address}
            setStep={setStep}
            step={step}
            vote={myVote}
          />
        }
        {step === STEPS.PROXY &&
          <SelectProxyModal
            nextStep={STEPS.REVIEW}
            proxyTypeFilter={['Any', 'Governance', 'NonTransfer']}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
            setStep={setStep}
            address={address}
            // height={modalHeight}
            proxies={proxyItems}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && voteInformation && txInfo &&
          <Confirmation
            address={address}
            handleClose={handleClose}
            txInfo={txInfo}
            voteInformation={voteInformation}
          />
        }
      </>
    </DraggableModal>
  );
}
