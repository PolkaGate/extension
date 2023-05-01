// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TFunction } from 'i18next';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Box, FormControl, FormControlLabel, FormLabel, Grid, Modal, Radio, RadioGroup, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_MAX_INTEGER, BN_ONE, BN_ZERO, bnMin, bnToBn, extractTime } from '@polkadot/util';

import { AmountWithOptions, From, Infotip, Select, ShowBalance } from '../../../components';
import { useApi, useBalances, useBlockInterval, useDecimal, useFormatted, useToken, useTranslation } from '../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../util/utils';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
  referendumIndex: number | undefined;
  trackId: number | undefined;
}

const CONVICTIONS = [1, 2, 4, 8, 16, 32].map((lock, index): [value: number, duration: number, durationBn: BN] => [index + 1, lock, new BN(lock)]);

type Result = [blockInterval: number, timeStr: string, time: Time];

export function calcBlockTime(blockTime: BN, blocks: BN, t: TFunction): Result {
  // in the case of excessively large locks, limit to the max JS integer value
  const value = bnMin(BN_MAX_INTEGER, blockTime.mul(blocks)).toNumber();

  // time calculations are using the absolute value (< 0 detection only on strings)
  const time = extractTime(Math.abs(value));
  const { days, hours, minutes, seconds } = time;

  return [
    blockTime.toNumber(),
    `${value < 0 ? '+' : ''}${[
      days
        ? (days > 1)
          ? t<string>('{{days}} days', { replace: { days } })
          : t<string>('1 day')
        : null,
      hours
        ? (hours > 1)
          ? t<string>('{{hours}} hrs', { replace: { hours } })
          : t<string>('1 hr')
        : null,
      minutes
        ? (minutes > 1)
          ? t<string>('{{minutes}} mins', { replace: { minutes } })
          : t<string>('1 min')
        : null,
      seconds
        ? (seconds > 1)
          ? t<string>('{{seconds}} s', { replace: { seconds } })
          : t<string>('1 s')
        : null
    ]
      .filter((s): s is string => !!s)
      .slice(0, 2)
      .join(' ')}`,
    time
  ];
}

function createOptions(blockTime: BN | undefined, voteLockingPeriod: BN | undefined, t: TFunction): { text: string; value: number }[] | undefined {
  return blockTime && voteLockingPeriod && [
    { text: t<string>('0.1x voting balance, no lockup period'), value: 0 },
    ...CONVICTIONS.map(([value, duration, durationBn]): { text: string; value: number } => ({
      text: t<string>('{{value}}x voting balance, locked for {{duration}}x duration{{period}}', {
        replace: {
          duration,
          period: voteLockingPeriod && voteLockingPeriod.gt(BN_ZERO)
            ? ` (${calcBlockTime(blockTime, durationBn.mul(voteLockingPeriod), t)[1]})`
            : '',
          value
        }
      }),
      value
    }))
  ];
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

export default function CastVote({ address, open, setOpen, trackId }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const balances = useBalances(address, undefined, undefined, true);
  const blockTime = useBlockInterval(address);
  const voteLockingPeriod = api && api.consts.convictionVoting.voteLockingPeriod;

  const convictionOptions = useMemo(() => blockTime && voteLockingPeriod && createOptions(blockTime, voteLockingPeriod, t), [blockTime, t, voteLockingPeriod]);
  const lockedAmount = useMemo(() => getAlreadyLockedValue(balances), [balances]);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [params, setParams] = useState<unknown | undefined>();
  const [voteType, setVoteType] = useState<string | undefined>();

  const [voteAmount, setVoteAmount] = React.useState<string>();
  // api.query.balances.reserves
  const vote = api && api.tx.convictionVoting.vote;
  const [conviction, setConviction] = useState(1);

  useEffect((): void => {
    if (['aye', 'nay'].includes(voteType)) {
      setParams([trackId, {
        Standard: {
          balance: amountToMachine(voteAmount, decimal),
          vote: {
            aye: voteType === 'aye',
            conviction
          }
        }
      }]);
    } else if (voteType === 'abstain') {
      setParams([trackId, {
        SplitAbstain: {
          abstain: amountToMachine(voteAmount, decimal),
          aye: BN_ZERO,
          nay: BN_ZERO
        }
      }]);
    }
  }, [conviction, decimal, trackId, voteAmount, voteType]);

  //   <ConvictionDropdown
  //   label={t<string>('conviction')}
  //   onChange={setConviction}
  //   value={conviction}
  //   voteLockingPeriod={voteLockingPeriod}
  // />

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

  const handleClose = () => {
    setOpen(false);
  };

  const onSelectVote = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: 'aye' | 'nay' | 'abstain'): void => {
    setVoteType(value);
  }, []);

  const onVoteAmountChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

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

  const style = {
    bgcolor: 'background.paper',
    border: '2px solid #000',
    borderRadius: '10px',
    boxShadow: 24,
    left: '50%',
    pb: 3,
    position: 'absolute',
    pt: 2,
    px: 4,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '428px'
  };

  return (
    <Modal onClose={handleClose} open={open}>
      <Box sx={{ ...style }}>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Cast Your Votes')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer' }} />
          </Grid>
        </Grid>
        <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative', height: window.innerHeight - 240 }}>
          <From
            address={address}
            api={api}
            title={t<string>('Account')}
          />
          <Grid container justifyContent='flex-start' item mt='15px'>
            <FormControl>
              <FormLabel sx={{ color: 'text.primary', fontSize: '16px', '&.Mui-focused': { color: 'text.primary' }, textAlign: 'left' }}>
                {t('Vote')}
              </FormLabel>
              <RadioGroup onChange={onSelectVote} row>
                <FormControlLabel control={<Radio sx={{ color: 'secondary.main', '& .MuiSvgIcon-root': { fontSize: 28 } }} value='aye' />} label={<Typography sx={{ fontSize: '28px', fontWeight: 500 }}>{t('Aye')}</Typography>} />
                <FormControlLabel control={<Radio sx={{ color: 'secondary.main', '& .MuiSvgIcon-root': { fontSize: 28 } }} value='nay' />} label={<Typography sx={{ fontSize: '28px', fontWeight: 500 }}>{t('Nay')}</Typography>} />
                <FormControlLabel control={<Radio sx={{ color: 'secondary.main', '& .MuiSvgIcon-root': { fontSize: 28 } }} value='abstain' />} label={<Typography sx={{ fontSize: '28px', fontWeight: 500 }}>{t('Abstain')}</Typography>} />
              </RadioGroup>
            </FormControl>
          </Grid>
          <AmountWithOptions
            label={t<string>(`Vote Value (${token})`)}
            onChangeAmount={onVoteAmountChange}
            onPrimary={onMaxAmount}
            onSecondary={onLockedAmount}
            primaryBtnText={t<string>('Max amount')}
            secondaryBtnText={t<string>('Locked amount')}
            style={{
              mt: '30px',
              width: '100%',
              fontSize: '16px'
            }}
            value={voteAmount}
          />
          <Grid container item justifyContent='space-between' sx={{ mt: '15px' }}>
            <Grid item sx={{ fontSize: '16px' }}>
              {t('Available Voting Balance')}
            </Grid>
            <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
              <ShowBalance balance={balances?.votingBalance} decimal={decimal} token={token} />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '24px' }} >
            <Grid item sx={{ fontSize: '16px' }}>
              <Infotip iconLeft={5} iconTop={4} showQuestionMark text={t('The maximum balance which is already locked in the ecosystem')}>
                {t('Already Locked Balance')}
              </Infotip>
            </Grid>
            <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
              <ShowBalance balance={getAlreadyLockedValue(balances)} decimal={decimal} token={token} />
            </Grid>
          </Grid>
        </Grid>
        {convictionOptions && <Select
          _mt='10px'
          label={t<string>('Vote Multiplier')}
          // onChange={_onChangeEndpoint}
          options={convictionOptions}
          value={convictionOptions?.[0]?.value}
        />
        }
      </Box>
    </Modal>
  );
}
