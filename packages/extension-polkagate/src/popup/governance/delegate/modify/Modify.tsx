// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { Convictions, From, TwoButtons } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { Lock } from '../../../../hooks/useAccountLocks';
import { MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { BalancesInfo } from '../../../../util/types';
import { amountToHuman } from '../../../../util/utils';
import { Track } from '../../utils/types';
import AmountWithOptionsAndLockAmount from '../partial/AmountWithOptionsAndLockAmount';
import ReferendaTracks from '../partial/ReferendaTracks';
import { STEPS } from '..';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  delegateeAddress: string | undefined;
  accountLocks: Lock[] | null | undefined;
  setDelegateAmount: React.Dispatch<React.SetStateAction<string>>;
  decimal: number | undefined;
  token: string | undefined;
  lockedAmount: BN | undefined;
  balances: BalancesInfo | undefined;
  estimatedFee: Balance | undefined;
  currentBlock: number | undefined;
  setConviction: React.Dispatch<React.SetStateAction<number | undefined>>;
  conviction: number | undefined;
  tracks: Track[] | undefined;
  setMode: (value: React.SetStateAction<'ReviewModify' | 'Modify'>) => void;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setSelectedTracks: React.Dispatch<React.SetStateAction<BN[]>>;
  selectedTracks: BN[];
  delegatePower: number;
  delegateAmount: string;
  nextButtonDisabled: boolean;
  chain: Chain | null | undefined;
}

export default function Modify ({ accountLocks, address, api, balances, chain, conviction, currentBlock, decimal, delegateAmount, delegatePower, delegateeAddress, estimatedFee, lockedAmount, nextButtonDisabled, selectedTracks, setConviction, setDelegateAmount, setMode, setSelectedTracks, setStep, token, tracks }: Props): React.ReactElement {
  const { t } = useTranslation();

  const onValueChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal} `);

      return;
    }

    setDelegateAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal, setDelegateAmount]);

  const onLockedAmount = useCallback(() => {
    if (!lockedAmount) {
      return;
    }

    setDelegateAmount(amountToHuman(lockedAmount, decimal));
  }, [decimal, lockedAmount, setDelegateAmount]);

  const onMaxAmount = useCallback(() => {
    if (!api || !balances || !estimatedFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(balances.votingBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setDelegateAmount(maxToHuman);
  }, [api, balances, decimal, estimatedFee, setDelegateAmount]);

  const backToPreview = useCallback(() => setStep(STEPS.PREVIEW), [setStep]);
  const goReviewModify = useCallback(() => setMode('ReviewModify'), [setMode]);

  return (
    <>
      <From
        _chain={chain}
        api={api}
        formatted={delegateeAddress}
        style={{ py: '10px' }}
        title={t<string>('Delegatee')}
      />
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
      <ReferendaTracks
        filterLockedTracks={{
          accountLocks,
          currentBlockNumber: currentBlock
        }}
        selectedTracks={selectedTracks}
        setSelectedTracks={setSelectedTracks}
        tracks={tracks}
      />
      <Grid container item sx={{ '> div': { ml: 0, width: '100%' } }}>
        <TwoButtons
          disabled={nextButtonDisabled}
          mt='15px'
          onPrimaryClick={goReviewModify}
          onSecondaryClick={backToPreview}
          primaryBtnText={t<string>('Next')}
          secondaryBtnText={t<string>('Back')}
        />
      </Grid>
    </>
  );
}
