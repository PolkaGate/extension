// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { Convictions, PButton } from '../../../../components';
import { useBlockInterval, useConvictionOptions, useCurrentBlockNumber, useDecimal, useFormatted, useToken, useTranslation } from '../../../../hooks';
import { Lock } from '../../../../hooks/useAccountLocks';
import { MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { BalancesInfo } from '../../../../util/types';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import { Track } from '../../utils/types';
import AmountWithOptionsAndLockAmount from '../partial/AmountWithOptionsAndLockAmount';
import ReferendaTracks from '../partial/ReferendaTracks';
import { DelegateInformation, STEPS } from '..';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  tracks: Track[] | undefined;
  estimatedFee: Balance | undefined;
  setDelegateInformation: React.Dispatch<React.SetStateAction<DelegateInformation | undefined>>;
  delegateInformation: DelegateInformation | undefined;
  setStatus: React.Dispatch<React.SetStateAction<'Delegate' | 'Remove' | 'Modify'>>;
  lockedAmount: BN | undefined;
  balances: BalancesInfo | undefined;
  accountLocks: Lock[] | null | undefined;
}

export default function DelegateVote({ accountLocks, address, api, balances, delegateInformation, estimatedFee, lockedAmount, setDelegateInformation, setStatus, setStep, tracks }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [showAdvance, setShowAdvance] = useState<boolean>(false);
  const currentBlock = useCurrentBlockNumber(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const blockTime = useBlockInterval(address);
  const convictionOptions = useConvictionOptions(address, blockTime, t);
  const formatted = useFormatted(address);

  const [delegateAmount, setDelegateAmount] = useState<string>('0');
  const [conviction, setConviction] = useState<number | undefined>();
  const [checked, setChecked] = useState<BN[]>([]);
  const [maxFee, setMaxFee] = useState<Balance>();

  const delegate = api && api.tx.convictionVoting.delegate;
  const batch = api && api.tx.utility.batchAll;

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
    if (!delegate || !batch || !formatted || !tracks) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setMaxFee(api?.createType('Balance', BN_ONE));
    }

    const txList = tracks.map((track) =>
      delegate(...[
        track[0],
        formatted,
        1,
        BN_ONE
      ]));

    batch(txList)
      .paymentInfo(formatted)
      .then((i) => setMaxFee(i?.partialFee))
      .catch(console.error);
  }, [api, batch, delegate, formatted, tracks]);

  useEffect(() => {
    convictionOptions === undefined && setConviction(1);
  }, [convictionOptions]);

  const unvotedTracks = useMemo(() => {
    if (!tracks || accountLocks === undefined) {
      return undefined;
    }

    if (accountLocks === null) {
      return tracks;
    }

    return tracks.filter((value) => !accountLocks.find((lock) => lock.classId.eq(value[0])));
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
    if (!api || !balances || !maxFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(balances.votingBalance.toString()).sub(ED.muln(2)).sub(new BN(maxFee));
    const maxToHuman = balances.votingBalance?.isZero() ? BN_ZERO : amountToHuman(max.toString(), decimal);

    maxToHuman && setDelegateAmount(String(maxToHuman));
  }, [api, balances, decimal, maxFee]);

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

  const toggleAdvance = useCallback(() => setShowAdvance(!showAdvance), [showAdvance]);

  const EditAdvance = () => (
    <Grid container item>
      <Grid container item onClick={toggleAdvance} sx={{ cursor: 'pointer' }}>
        <Typography color='secondary.main' fontSize='16px' fontWeight={400}>
          {t<string>('Advanced')}
        </Typography>
        <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto 8px', stroke: '#BA2882', strokeWidth: '2px', transform: showAdvance ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
      </Grid>
      {showAdvance &&
        <ReferendaTracks
          filterLockedTracks={{
            accountLocks,
            currentBlockNumber: currentBlock
          }}
          selectedTracks={checked}
          setSelectedTracks={setChecked}
          tracks={tracks}
        />
      }
    </Grid>
  );

  return (
    <Grid container>
      <AmountWithOptionsAndLockAmount
        accountLocks={accountLocks}
        amount={delegateAmount}
        balances={balances}
        currentBlock={currentBlock}
        decimal={decimal}
        lockedAmount={lockedAmount}
        onLockedAmount={onLockedAmount}
        onMaxAmount={onMaxAmount}
        onValueChange={onValueChange}
        token={token}
      />
      <Convictions
        address={address}
        conviction={conviction}
        setConviction={setConviction}
        style={{ py: '15px' }}
      >
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '24px' }}>
          <Grid item>
            <Typography fontSize='16px' fontWeight={400}>
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
      <EditAdvance />
      <Grid container justifyContent='flex-end'>
        <PButton
          _ml={0}
          _mt={showAdvance ? '10px' : '224px'}
          _onClick={handleNext}
          _width={100}
          disabled={nextDisable}
          text={t<string>('Next')}
        />
      </Grid>
    </Grid>
  );
}
