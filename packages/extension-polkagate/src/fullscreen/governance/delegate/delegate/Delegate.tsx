// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { Lock } from '../../../../hooks/useAccountLocks';
import type { BalancesInfo } from '../../../../util/types';
import type { Track } from '../../utils/types';
import type { DelegateInformation } from '..';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { Convictions, PButton } from '../../../../components';
import { useBlockInterval, useConvictionOptions, useCurrentBlockNumber, useDecimal, useFormatted, useToken, useTranslation } from '../../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import AmountWithOptionsAndLockAmount from '../partial/AmountWithOptionsAndLockAmount';
import ReferendaTracks from '../partial/ReferendaTracks';
import { STEPS } from '..';

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

interface EditAdvanceProps {
  toggleAdvance: () => void;
  showAdvance: boolean;
  checked: BN[];
  setChecked: React.Dispatch<React.SetStateAction<BN[]>>;
  tracks: Track[] | undefined;
  accountLocks: Lock[] | null | undefined;
  currentBlock: number | undefined;
}

const EditAdvance = ({ accountLocks, checked, currentBlock, setChecked, showAdvance, toggleAdvance, tracks }: EditAdvanceProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container item>
      <Grid container item onClick={toggleAdvance} sx={{ cursor: 'pointer' }}>
        <Typography color='secondary.light' fontSize='16px' fontWeight={400}>
          {t('Advanced')}
        </Typography>
        <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto 8px', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showAdvance ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
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
};

export default function DelegateVote({ accountLocks, address, api, balances, delegateInformation, lockedAmount, setDelegateInformation, setStatus, setStep, tracks }: Props): React.ReactElement {
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

  const delegate = api?.tx['convictionVoting']['delegate'];
  const batch = api?.tx['utility']['batchAll'];

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

    if (!api?.call?.['transactionPaymentApi']) {
      return setMaxFee(api.createType('Balance', BN_ONE));
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

    const ED = api.consts['balances']['existentialDeposit'] as unknown as BN;
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
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '24px', pt: '25px' }}>
          <Grid item>
            <Typography fontSize='14px'>
              {t('Your final delegated vote power')}
            </Typography>
          </Grid>
          <Grid item>
            <Typography fontSize='16px' fontWeight={400}>
              {delegatePower}
            </Typography>
          </Grid>
        </Grid>
      </Convictions>
      <EditAdvance
        accountLocks={accountLocks}
        checked={checked}
        currentBlock={currentBlock}
        setChecked={setChecked}
        showAdvance={showAdvance}
        toggleAdvance={toggleAdvance}
        tracks={tracks}
      />
      <Grid container justifyContent='flex-end'>
        <PButton
          _ml={0}
          _mt={showAdvance ? '10px' : '224px'}
          _onClick={handleNext}
          _width={100}
          disabled={nextDisable}
          text={t('Next')}
        />
      </Grid>
    </Grid>
  );
}
