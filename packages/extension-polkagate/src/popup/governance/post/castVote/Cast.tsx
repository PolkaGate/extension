// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_MAX_INTEGER, BN_ONE, BN_ZERO, isBn } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AmountWithOptions, Convictions, Infotip2, PButton, ShowBalance, Warning } from '../../../../components';
import { useAccountLocks, useApi, useBalances, useBlockInterval, useConvictionOptions, useCurrentBlockNumber, useDecimal, useFormatted, useToken, useTranslation } from '../../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { amountToHuman, amountToMachine, remainingTime } from '../../../../util/utils';
import { STATUS_COLOR } from '../../utils/consts';
import { getVoteType } from '../../utils/util';
import { getConviction, Vote } from '../myVote/util';
import { STEPS } from '.';

interface Props {
  address: string | undefined;
  setVoteInformation: React.Dispatch<React.SetStateAction<VoteInformation | undefined>>;
  trackId: number | undefined;
  refIndex: number | undefined;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  previousVote: Vote | null | undefined;
  notVoted: boolean | undefined
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

const LOCKS_ORDERED = ['pyconvot', 'democrac', 'phrelect'];

function getAlreadyLockedValue(allBalances: DeriveBalancesAll | undefined): BN | undefined {
  const sortedLocks = allBalances?.lockedBreakdown
    // first sort by amount, so greatest value first
    .sort((a, b) =>
      b.amount.cmp(a.amount)
    )
    // then sort by the type of lock (we try to find relevant)
    .sort((a, b): number => {
      if (!a.id.eq(b.id)) {
        for (let i = 0; i < LOCKS_ORDERED.length; i++) {
          const lockName = LOCKS_ORDERED[i];

          if (a.id.eq(lockName)) {
            return -1;
          } else if (b.id.eq(lockName)) {
            return 1;
          }
        }
      }

      return 0;
    })
    .map(({ amount }) => amount);

  return sortedLocks?.[0] || allBalances?.lockedBalance;
}

const getLockedUntil = (endBlock: BN, currentBlock: number) => {
  if (endBlock.eq(BN_MAX_INTEGER)) {
    return 'underway';
  }

  return remainingTime(endBlock.toNumber() - currentBlock);
};

const DEFAULT_CONVICTION = 1;

export default function Cast({ address, notVoted, previousVote, refIndex, setStep, setVoteInformation, step, trackId }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const balances = useBalances(address, undefined, undefined, true);
  const blockTime = useBlockInterval(address);
  const theme = useTheme();
  const currentBlock = useCurrentBlockNumber(address);
  const accountLocks = useAccountLocks(address, 'referenda', 'convictionVoting', true);
  const convictionOptions = useConvictionOptions(address, blockTime, t);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [voteType, setVoteType] = useState<'Aye' | 'Nay' | 'Abstain' | undefined>(getVoteType(previousVote));
  const mayBePreviousVote = amountToHuman(previousVote?.standard?.balance || previousVote?.splitAbstain?.abstain || (previousVote?.delegating?.voted ? previousVote?.delegating?.balance : undefined), decimal);
  const [voteAmount, setVoteAmount] = React.useState<string>('0');
  const [conviction, setConviction] = useState<number>();

  const tx = api && api.tx.convictionVoting.vote;

  const lockedAmount = useMemo(() => getAlreadyLockedValue(balances), [balances]);
  const myDelegations = previousVote?.delegations?.votes;
  const voteAmountAsBN = useMemo(() => amountToMachine(voteAmount, decimal), [voteAmount, decimal]);
  const voteOptions = useMemo(() => (['Aye', 'Nay', 'Abstain']), []);
  const convictionLockUp = useMemo((): string | undefined => {
    if (conviction === undefined || !convictionOptions || !convictionOptions?.length) {
      return undefined;
    }

    const convText = convictionOptions?.find((conv) => conv.value === conviction)?.text as string;
    const parenthesisIndex = convText?.indexOf('(') ? convText?.indexOf('(') + 1 : 0;
    const lockUp = parenthesisIndex
      ? convText?.slice(parenthesisIndex, -1)
      : '0 day';

    return lockUp;
  }, [conviction, convictionOptions]);

  const votePower = useMemo(() => {
    if (conviction === undefined || voteAmountAsBN.isZero()) {
      return undefined;
    }

    const multipliedAmount = conviction !== 0.1 ? voteAmountAsBN.muln(conviction) : voteAmountAsBN.divn(10);

    return myDelegations ? new BN(myDelegations).add(multipliedAmount) : multipliedAmount;
  }, [conviction, myDelegations, voteAmountAsBN]);

  useEffect(() => {
    if (mayBePreviousVote) {
      setVoteAmount(mayBePreviousVote);
      previousVote?.standard && setConviction(getConviction(previousVote.standard.vote));
      previousVote?.delegating && previousVote?.delegating?.voted && setConviction(getConviction(String(previousVote.delegating.conviction)));
    }
  }, [mayBePreviousVote, previousVote]);

  useEffect(() => {
    convictionOptions === undefined && setConviction(1);
  }, [convictionOptions]);

  useEffect(() => {
    if (voteType === 'Abstain') {
      setConviction(0);
    } else {
      !conviction && setConviction(DEFAULT_CONVICTION);
    }
  }, [conviction, voteType]);

  useEffect(() => {
    if (!formatted || !tx) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const dummyVote = undefined;
    const feeDummyParams = ['1', dummyVote];

    tx(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, tx]);

  useEffect(() => {
    if (!convictionLockUp || !voteType || !votePower || !voteAmountAsBN || trackId === undefined || !voteAmount || conviction === undefined || refIndex === undefined) {
      return;
    }

    setVoteInformation({
      refIndex,
      trackId,
      voteAmountBN: voteAmountAsBN,
      voteBalance: voteAmount,
      voteConvictionValue: conviction === 0.1 ? 0 : conviction,
      voteLockUpUpPeriod: convictionLockUp,
      votePower,
      voteType
    });
  }, [conviction, convictionLockUp, myDelegations, refIndex, setVoteInformation, trackId, voteAmount, voteAmountAsBN, votePower, voteType]);

  const onVoteAmountChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal} `);

      return;
    }

    setVoteAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onMaxAmount = useCallback(() => {
    if (!api || !balances || !estimatedFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(balances.votingBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setVoteAmount(maxToHuman);
  }, [api, balances, decimal, estimatedFee]);

  const onLockedAmount = useCallback(() => {
    if (!lockedAmount) {
      return;
    }

    setVoteAmount(amountToHuman(lockedAmount, decimal));
  }, [decimal, lockedAmount]);

  const onCastVote = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const onSelectVote = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: 'Aye' | 'Nay' | 'Abstain'): void => {
    setVoteType(value);
  }, []);

  const goVoteDisabled = useMemo(() => {
    if (!voteAmount || voteAmount === '0' || voteType === undefined || voteAmountAsBN.gt(balances?.votingBalance || BN_ZERO)) {
      return true;
    }

    if (voteType !== 'Abstain' && !conviction) {
      return true;
    }

    return false;
  }, [balances?.votingBalance, conviction, voteAmount, voteAmountAsBN, voteType]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    if (step === STEPS.CHECK_SCREEN && notVoted !== undefined) {
      notVoted ? setStep(STEPS.INDEX) : setStep(STEPS.PREVIEW);
    }
  }, [notVoted, setStep, step]);

  const alreadyLockedTooltipText = useMemo(() => accountLocks && currentBlock &&
    (<Grid container item sx={{ maxHeight: '400px', overflow: 'hidden', overflowY: 'scroll' }}>
      <Typography variant='body2'>
        <Grid container spacing={2}>
          <Grid item xs={2.5}>
            {t('Ref.')}
          </Grid>
          <Grid item xs={3.6}>
            {t('Amount')}
          </Grid>
          <Grid item xs={2.9}>
            {t('Multiplier')}
          </Grid>
          <Grid item xs={3}>
            {t('Expires')}
          </Grid>
          {accountLocks.map((l, index) =>
            <React.Fragment key={index}>
              <Grid item xs={2.5}>
                {isBn(l.refId) ? l.refId.toNumber() : 'N/A'}
              </Grid>
              <Grid item xs={3.6}>
                {amountToHuman(l.total, decimal)} {token}
              </Grid>
              <Grid item xs={2.9}>
                {l.locked === 'None' ? 'N/A' : l.locked.replace('Locked', '')}
              </Grid>
              <Grid item xs={3}>
                {getLockedUntil(l.endBlock, currentBlock)}
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      </Typography>
    </Grid>
    ), [accountLocks, currentBlock, decimal, t, token]);

  const VoteButton = ({ children, voteOption }: { children: React.ReactNode, voteOption: string }) => {
    return (
      <Grid container item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', justifyContent: 'center', pr: '5px', width: 'fit-content' }}>
        <FormControlLabel
          control={
            <Radio
              sx={{
                '& .MuiSvgIcon-root': { fontSize: 28 },
                color: 'secondary.main'
              }}
              value={voteOption}
            />}
          label={
            <Grid alignItems='center' container justifyContent='center' width='fit-content'>
              <Typography
                sx={{
                  fontSize: '24px',
                  fontWeight: 500,
                  pr: '3px',
                  textTransform: 'capitalize'
                }}
              >
                {t(voteOption)}
              </Typography>
              {children}
            </Grid>
          }
          sx={{ m: 'auto' }}
        />
      </Grid>
    );
  };

  return (
    <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative' }}>
      {mayBePreviousVote &&
        <Warning
          fontWeight={300}
          marginTop={0}
          theme={theme}
        >
          {t('Resubmitting the vote will override the current voting record.')}
        </Warning>
      }
      <Grid container item justifyContent='flex-start' mt='15px'>
        <FormControl fullWidth>
          <FormLabel sx={{ color: 'text.primary', fontSize: '16px', '&.Mui-focused': { color: 'text.primary' }, textAlign: 'left' }}>
            {t('Vote')}
          </FormLabel>
          <RadioGroup onChange={onSelectVote} row value={voteType}>
            <Grid alignItems='center' container justifyContent='space-between'>
              <VoteButton voteOption={voteOptions[0]}>
                <CheckIcon sx={{ color: STATUS_COLOR.Confirmed, fontSize: '28px', stroke: STATUS_COLOR.Confirmed, strokeWidth: 1.5 }} />
              </VoteButton>
              <VoteButton voteOption={voteOptions[1]}>
                <CloseIcon sx={{ color: 'warning.main', fontSize: '28px', stroke: theme.palette.warning.main, strokeWidth: 1.5 }} />
              </VoteButton>
              <VoteButton voteOption={voteOptions[2]}>
                <AbstainIcon sx={{ color: 'primary.light', fontSize: '28px' }} />
              </VoteButton>
            </Grid>
          </RadioGroup>
        </FormControl>
      </Grid>
      <AmountWithOptions
        inputWidth={8.4}
        label={t<string>(`Vote Value (${token})`)}
        onChangeAmount={onVoteAmountChange}
        onPrimary={onMaxAmount}
        onSecondary={onLockedAmount}
        primaryBtnText={t<string>('Max amount')}
        secondaryBtnText={t<string>('Locked amount')}
        style={{
          fontSize: '16px',
          mt: '25px',
          width: '100%'
        }}
        value={voteAmount}
      />
      <Grid container item>
        <Grid container item justifyContent='space-between' sx={{ lineHeight: '25px', mt: '10px', width: '70.25%' }}>
          <Grid item sx={{ fontSize: '14px' }}>
            {t('Available Voting Balance')}
          </Grid>
          <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
            <ShowBalance balance={balances?.votingBalance} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
        </Grid>
        {myDelegations && !myDelegations.isZero() &&
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '25px', width: '70%' }}>
            <Grid item sx={{ fontSize: '14px' }}>
              <Infotip2 showQuestionMark text={t('The voting power which is delegated to this account')}>
                {t('Delegated Voting Power')}
              </Infotip2>
            </Grid>
            <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
              <ShowBalance balance={myDelegations} decimal={decimal} decimalPoint={2} token={token} />
            </Grid>
          </Grid>
        }
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '25px', width: '75%' }}>
          <Grid item sx={{ fontSize: '14px' }}>
            <Infotip2 showQuestionMark text={t('The maximum number of tokens that are already locked in the ecosystem')}>
              {t('Already Locked Amount')}
            </Infotip2>
          </Grid>
          <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
            <Infotip2 showInfoMark text={alreadyLockedTooltipText || 'Fetching ...'}>
              <ShowBalance balance={getAlreadyLockedValue(balances)} decimal={decimal} decimalPoint={2} token={token} />
            </Infotip2>
          </Grid>
        </Grid>
      </Grid>
      <Grid container item height={mayBePreviousVote ? '85px' : '100px'}>
        {voteType !== 'Abstain' &&
          <Convictions
            address={address}
            conviction={conviction}
            setConviction={setConviction}
            style={{ mt: '25px' }}
          >
            <Grid alignItems='center' container item justifyContent='space-between' sx={{ height: '42px' }}>
              <Grid item>
                <Typography sx={{ fontSize: '16px' }}>
                  {t('Your final vote power after multiplying')}
                </Typography>
              </Grid>
              <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
                <ShowBalance balance={votePower || '0'} decimal={decimal} decimalPoint={4} token={token} />
              </Grid>
            </Grid>
          </Convictions>
        }
      </Grid>
      <PButton
        _ml={0}
        _mt='50px'
        _onClick={onCastVote}
        _width={100}
        disabled={goVoteDisabled}
        text={t<string>('Next to review')}
      />
    </Grid>
  );
}
