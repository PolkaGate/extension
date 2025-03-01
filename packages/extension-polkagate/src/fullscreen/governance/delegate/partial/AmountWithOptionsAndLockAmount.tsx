// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';
import type { Lock } from '../../../../hooks/useAccountLocks';
import type { BalancesInfo } from '../../../../util/types';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { isBn } from '@polkadot/util';

import { AmountWithOptions, Infotip2, ShowBalance } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { amountToHuman } from '../../../../util/utils';
import { getLockedUntil } from '../../utils/util';

interface Props {
  accountLocks: Lock[] | null | undefined;
  currentBlock: number | undefined;
  decimal: number | undefined;
  token: string | undefined;
  balances: BalancesInfo | undefined;
  lockedAmount: BN | undefined;
  onValueChange: (value: string) => void;
  onMaxAmount: () => void;
  onLockedAmount?: (() => void) | undefined;
  amount?: string | undefined;
}

interface AlreadyLockedTooltipTextProps {
  accountLocks: Lock[];
  currentBlock: number;
  decimal: number | undefined;
  token: string | undefined;
}

const AlreadyLockedTooltipText = ({ accountLocks, currentBlock, decimal, token }: AlreadyLockedTooltipTextProps) => {
  const { t } = useTranslation();

  return (
    <Grid container item sx={{ maxHeight: '400px', overflow: 'hidden', overflowY: 'scroll' }}>
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
  );
};

interface VotingInformationProps {
  balances: BalancesInfo | undefined;
  decimal: number | undefined;
  token: string | undefined;
  lockedAmount: BN | undefined;
  accountLocks: Lock[] | null | undefined;
  currentBlock: number | undefined;
}

const VotingInformation = ({ accountLocks, balances, currentBlock, decimal, lockedAmount, token }: VotingInformationProps) => {
  const { t } = useTranslation();

  return (
    <Grid container item pb='10px'>
      <Grid container item justifyContent='space-between' sx={{ mt: '10px', width: '70.25%' }}>
        <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
          {t('Available Voting Balance')}
        </Grid>
        <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
          <ShowBalance balance={balances?.votingBalance} decimal={decimal} decimalPoint={2} token={token} />
        </Grid>
      </Grid>
      {lockedAmount && !lockedAmount?.isZero() &&
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px', width: '75%' }}>
          <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
            <Infotip2 showQuestionMark text={t('The maximum number of tokens that are already locked in the ecosystem')}>
              {t('Already Locked Amount')}
            </Infotip2>
          </Grid>
          <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
            <Infotip2
              showInfoMark
              text={accountLocks && currentBlock
                ? <AlreadyLockedTooltipText accountLocks={accountLocks} currentBlock={currentBlock} decimal={decimal} token={token} />
                : t('Fetching ...')
              }
            >
              <ShowBalance balance={lockedAmount} decimal={decimal} decimalPoint={2} token={token} />
            </Infotip2>
          </Grid>
        </Grid>
      }
    </Grid>
  );
};

export default function AmountWithOptionsAndLockAmount({ accountLocks, amount, balances, currentBlock, decimal, lockedAmount, onLockedAmount, onMaxAmount, onValueChange, token }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <AmountWithOptions
        label={t('Amount ({{token}})', { replace: { token } })}
        onChangeAmount={onValueChange}
        onPrimary={onMaxAmount}
        onSecondary={lockedAmount && !lockedAmount?.isZero() ? onLockedAmount : undefined}
        primaryBtnText={t('Max amount')}
        secondaryBtnText={t('Locked amount')}
        style={{
          '> div div div': { fontSize: '16px', fontWeight: 400 },
          fontSize: '16px',
          mt: '15px',
          width: '100%'
        }}
        value={amount}
      />
      <VotingInformation
        accountLocks={accountLocks}
        balances={balances}
        currentBlock={currentBlock}
        decimal={decimal}
        lockedAmount={lockedAmount}
        token={token}
      />
    </>
  );
}
