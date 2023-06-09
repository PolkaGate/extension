// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { ClickAwayListener, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_MAX_INTEGER, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Convictions, From, Infotip2, PButton, Progress, ShowBalance } from '../../../components';
import { useAccountLocks, useBalances, useBlockInterval, useConvictionOptions, useCurrentBlockNumber, useDecimal, useToken, useTranslation } from '../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../util/constants';
import { amountToHuman, amountToMachine, remainingTime } from '../../../util/utils';
import { Track } from '../utils/types';
import { toTitleCase } from '../utils/util';
import ReferendaTracks from './partial/ReferendaTracks';
import { getAlreadyLockedValue } from './AlreadyLockedTooltipText ';
import { DelegateInformation, STEPS } from '.';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  tracks: Track[] | undefined;
  estimatedFee: Balance | undefined;
  setDelegateInformation: React.Dispatch<React.SetStateAction<DelegateInformation | undefined>>;
  delegateInformation: DelegateInformation | undefined;
  setStatus: React.Dispatch<React.SetStateAction<'Delegate' | 'Remove' | 'Modify'>>
}

export default function DelegateVote({ address, api, delegateInformation, setStatus, estimatedFee, setDelegateInformation, setStep, tracks }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [showExistingVoted, setShowExistingVoted] = useState<boolean>(false);
  const currentBlock = useCurrentBlockNumber(address);
  const token = useToken(address);
  const accountLocks = useAccountLocks(address, 'referenda', 'convictionVoting');
  const balances = useBalances(address, undefined, undefined, true);
  const decimal = useDecimal(address);
  const blockTime = useBlockInterval(address);
  const convictionOptions = useConvictionOptions(address, blockTime, t);

  const [delegateAmount, setDelegateAmount] = useState<string>('0');
  const [conviction, setConviction] = useState<number | undefined>();
  const [checked, setChecked] = useState<BN[]>([]);

  const lockedAmount = useMemo(() => getAlreadyLockedValue(balances), [balances]);
  const delegateAmountBN = useMemo(() => (amountToMachine(delegateAmount, decimal)), [decimal, delegateAmount]);
  const delegatePower = useMemo(() => {
    if (conviction === undefined || delegateAmountBN.isZero()) {
      return 0;
    }

    const bn = conviction !== 0.1 ? delegateAmountBN.muln(conviction) : delegateAmountBN.divn(10);

    return Number(amountToHuman(bn, decimal));
  }, [conviction, decimal, delegateAmountBN]);
  const nextDisable = useMemo(() => (!delegateInformation || !checked.length || delegateAmountBN.isZero() || delegateAmountBN.gt(balances?.votingBalance || BN_ZERO)), [balances?.votingBalance, checked.length, delegateAmountBN, delegateInformation]);

  useEffect(() => {
    convictionOptions === undefined && setConviction(1);
  }, [convictionOptions]);

  const toggleExistingVotes = useCallback(() => setShowExistingVoted(!showExistingVoted), [showExistingVoted]);

  const existingVotes: Record<string, number> | undefined | null = useMemo(() => {
    if (tracks && accountLocks !== undefined) {
      if (accountLocks === null) {
        return null;
      }

      const result = {};

      accountLocks.forEach((lock) => {
        if (!result[lock.classId]) {
          result[lock.classId] = 1;
        } else {
          result[lock.classId]++;
        }
      });

      const replacedKey = Object.keys(result).reduce((acc, key) => {
        const newKey = tracks.find((value) => String(value[0]) === key)?.[1].name; // Convert numeric key to track names

        acc[newKey] = result[key];

        return acc;
      }, {});

      return replacedKey;
    }
  }, [accountLocks, tracks]);

  const unvotedTracks = useMemo(() => {
    if (!tracks || accountLocks === undefined) {
      return undefined;
    }

    if (accountLocks === null) {
      return tracks;
    }

    return tracks.filter((value) => !accountLocks.find((lock) => lock.classId.eq(value[0])));;
  }, [accountLocks, tracks]);

  useEffect(() => {
    if (!unvotedTracks) {
      return;
    }

    setChecked(unvotedTracks.map((track) => track[0]));
  }, [unvotedTracks]);

  useEffect(() => {
    if (!delegateAmount || delegateAmountBN.isZero() || conviction === undefined || !checked.length) {
      return;
    }

    setDelegateInformation({
      delegateAmount,
      delegateAmountBN,
      delegateConviction: conviction === 0.1 ? 0 : conviction,
      delegatePower,
      delegatedTracks: checked
    });
  }, [checked, conviction, delegateAmount, delegateAmountBN, delegatePower, setDelegateInformation]);

  const onLockedAmount = useCallback(() => {
    if (!lockedAmount) {
      return;
    }

    setDelegateAmount(amountToHuman(lockedAmount, decimal));
  }, [decimal, lockedAmount]);

  const onMaxAmount = useCallback(() => {
    if (!api || !balances || !estimatedFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(balances.votingBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setDelegateAmount(maxToHuman);
  }, [api, balances, decimal, estimatedFee]);

  const handleNext = useCallback(() => {
    setStep(STEPS.CHOOSE_DELEGATOR);
    setStatus('Delegate');
  }, [setStatus, setStep]);

  const onValueChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal} `);

      return;
    }

    setDelegateAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const ExistingVotesDisplay = () => {
    return (
      <ClickAwayListener onClickAway={toggleExistingVotes}>
        <Grid container sx={{ '> :not(:first-child)': { borderBottom: 1, borderColor: 'rgba(0,0,0,0.2)' }, bgcolor: 'background.default', border: 1, borderColor: 'primary.main', borderRadius: '5px', boxShadow: '3px 5px 5px 2px rgba(0, 0, 0, 0.25)', display: 'block', height: '245px', overflowY: 'scroll', position: 'absolute', top: '92px', zIndex: 100 }}>
          <Grid container item justifyContent='space-between' sx={{ borderBottom: 1, borderColor: 'primary.main', fontSize: '18px', fontWeight: 500, lineHeight: '40px' }}>
            <Grid item px='25px'>
              {t('Categories')}
            </Grid>
            <Grid item px='30px'>
              {t('Votes')}
            </Grid>
          </Grid>
          {existingVotes
            ? Object.keys(existingVotes).map((key, index) => (
              <Grid container item justifyContent='space-between' key={index} sx={{ lineHeight: '40px' }}>
                <Grid item px='25px'>
                  {toTitleCase(key)}
                </Grid>
                <Grid item px='50px'>
                  {existingVotes[key]}
                </Grid>
              </Grid>
            ))
            : existingVotes === undefined
              ? <Grid container item pb='25px' style={{ border: 'none' }}>
                <Progress pt='60px' size={50} title={t('Loading your existing votes ...')} />
              </Grid>
              : <Grid container item justifyContent='center' sx={{ border: 'none', m: 'auto' }}>
                <Typography>
                  {t('No locks were found for the existing votes.')}
                </Typography>
              </Grid>
          }
        </Grid>
      </ClickAwayListener>
    );
  };

  const getLockedUntil = (endBlock: BN, currentBlock: number) => {
    if (endBlock.eq(BN_MAX_INTEGER)) {
      return 'underway';
    }

    return remainingTime(endBlock.toNumber() - currentBlock);
  };

  const alreadyLockedTooltipText = useMemo(() => accountLocks && currentBlock &&
    (<>
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
                {l.refId.toNumber()}
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
    </>
    ), [accountLocks, currentBlock, decimal, t, token]);

  return (
    <Grid container>
      <Grid alignItems='center' container justifyContent='space-between' position='relative' pt='10px'>
        <Grid item xs={8.5}>
          <From
            address={address}
            api={api}
            style={{ '> div': { px: '10px' }, '> p': { fontWeight: 400 } }}
            title={t<string>('Delegate from account')}
          />
        </Grid>
        <Grid alignItems='center' container item onClick={toggleExistingVotes} sx={{ cursor: 'pointer', mt: '25px' }} xs={3}>
          {t('Existing votes')}
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: showExistingVoted ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>
        {showExistingVoted &&
          <ExistingVotesDisplay />
        }
      </Grid>
      <ReferendaTracks
        selectedTracks={checked}
        setSelectedTracks={setChecked}
        unvotedTracks={unvotedTracks}
      />
      <AmountWithOptions
        inputWidth={8.4}
        label={t<string>('Delegate Vote Value ({{token}})', { replace: { token } })}
        onChangeAmount={onValueChange}
        onPrimary={onMaxAmount}
        onSecondary={onLockedAmount}
        primaryBtnText={t<string>('Max amount')}
        secondaryBtnText={t<string>('Locked amount')}
        style={{
          fontSize: '16px',
          mt: '15px',
          width: '100%'
        }}
        value={delegateAmount}
      />
      <Grid container item>
        <Grid container item justifyContent='space-between' sx={{ mt: '10px', width: '70.25%' }}>
          <Grid item sx={{ fontSize: '14px' }}>
            {t('Available Voting Balance')}
          </Grid>
          <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
            <ShowBalance balance={balances?.votingBalance} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px', width: '75%' }}>
          <Grid item sx={{ fontSize: '14px' }}>
            <Infotip2 showQuestionMark text={t('The maximum number of tokens that are already locked in the ecosystem')}>
              {t('Already Locked Balance')}
            </Infotip2>
          </Grid>
          <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
            <Infotip2 showInfoMark text={alreadyLockedTooltipText || 'Fetching ...'}>
              <ShowBalance balance={getAlreadyLockedValue(balances)} decimal={decimal} decimalPoint={2} token={token} />
            </Infotip2>
          </Grid>
        </Grid>
      </Grid>
      <Convictions
        address={address}
        conviction={conviction}
        setConviction={setConviction}
      >
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '24px' }}>
          <Grid item>
            <Typography sx={{ fontSize: '16px' }}>
              {t('Your final delegated vote power')}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
            <Typography fontSize='28px' fontWeight={500}>
              {delegatePower}
            </Typography>
          </Grid>
        </Grid>
      </Convictions>
      <Grid container justifyContent='flex-end'>
        <PButton
          _ml={0}
          _mt='10px'
          _onClick={handleNext}
          _width={100}
          disabled={nextDisable}
          text={t<string>('Next')}
        />
      </Grid>
    </Grid>
  );
}
