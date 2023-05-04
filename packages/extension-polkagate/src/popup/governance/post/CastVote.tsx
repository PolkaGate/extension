// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TFunction } from 'i18next';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Box, FormControl, FormControlLabel, FormLabel, Grid, Modal, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_MAX_INTEGER, BN_ONE, BN_ZERO, bnMin, bnToBn, extractTime } from '@polkadot/util';

import { AmountWithOptions, From, Infotip, PButton, Select, ShowBalance, Warning } from '../../../components';
import { useAccountLocks, useApi, useBalances, useBlockInterval, useCurrentBlockNumber, useDecimal, useFormatted, useMyVote, useToken, useTranslation } from '../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../util/constants';
import { amountToHuman, amountToMachine, remainingTime } from '../../../util/utils';
import { CONVICTIONS, STATUS_COLOR } from '../utils/consts';
import { ReferendumSubScan } from '../utils/types';
import { getVoteType } from '../utils/util';
import { getConviction, isAye } from './myVote/util';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
  referendumInfo: ReferendumSubScan | undefined;
}

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
    { text: t<string>('0.1x voting balance, no lockup period'), value: 0.1 },
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

export default function CastVote({ address, open, referendumInfo, setOpen }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const balances = useBalances(address, undefined, undefined, true);
  const blockTime = useBlockInterval(address);
  const voteLockingPeriod = api && api.consts.convictionVoting.voteLockingPeriod;
  const theme = useTheme();
  const myVote = useMyVote(address, referendumInfo);
  const currentBlock = useCurrentBlockNumber(address);

  const accountLocks = useAccountLocks(address, 'referenda', 'convictionVoting', true);

  const getLockedUntil = (endBlock: BN, currentBlock: number) => {
    if (endBlock.eq(BN_MAX_INTEGER)) {
      return 'underway';
    }

    return remainingTime(endBlock.toNumber() - currentBlock);
  };

  const alreadyLockedTooltipText = useMemo(() => accountLocks && currentBlock &&
    <>
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
    , [accountLocks, currentBlock, decimal, t, token]);

  const trackId = useMemo(() => referendumInfo?.origins_id, [referendumInfo?.origins_id]);
  const convictionOptions = useMemo(() => blockTime && voteLockingPeriod && createOptions(blockTime, voteLockingPeriod, t), [blockTime, t, voteLockingPeriod]);
  const lockedAmount = useMemo(() => getAlreadyLockedValue(balances), [balances]);
  const myVoteBalance = useMemo((): number | undefined => (myVote?.standard?.balance || myVote?.splitAbstain?.abstain || myVote?.delegating?.balance), [myVote]);
  const myVoteConviction = useMemo(() => (myVote?.standard?.vote ? `(${getConviction(myVote.standard.vote)}x)` : myVote?.delegating?.conviction ? `(${myVote.delegating.conviction}x)` : ''), [myVote?.delegating?.conviction, myVote?.standard?.vote]);
  const myVoteType = getVoteType(myVote);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [params, setParams] = useState<unknown | undefined>();
  const [voteType, setVoteType] = useState<string | undefined>();

  const [voteAmount, setVoteAmount] = React.useState<string>('0');
  // api.query.balances.reserves
  const vote = api && api.tx.convictionVoting.vote;
  const [conviction, setConviction] = useState<number>(1);

  const voteOptions = useMemo(() => (['aye', 'nay', 'abstain']), []);

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

  useEffect(() => {
    if (!formatted || !vote) {
      return;
    }

    api && api.query.preimage.preimageFor.entries().then((x) => console.log('preimages', x));

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const dummyVote = undefined;
    const feeDummyParams = ['1', dummyVote];

    vote(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, vote]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onSelectVote = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: 'aye' | 'nay' | 'abstain'): void => {
    setVoteType(value);
  }, []);

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

  const style = {
    bgcolor: 'background.default',
    border: '2px solid #000',
    borderRadius: '10px',
    boxShadow: 24,
    left: '50%',
    maxHeight: '700px',
    pb: 3,
    position: 'absolute',
    pt: 2,
    px: 4,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px'
  };

  const onChangeConviction = useCallback((conviction: number): void => {
    setConviction(conviction);
  }, []);

  const CurrentVote = () => {
    return (
      <Grid alignItems='center' container direction='column' item pt='15px'>
        <Typography fontSize='16px' fontWeight={400} textAlign='left' width='100%'>
          {t<string>('Current Voting')}
        </Typography>
        <Grid alignItems='center' container item sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', justifyContent: 'space-between', p: '5px 10px' }}>
          <Grid alignItems='center' container item width='fit-content'>
            <Grid item sx={{ fontSize: '28px', fontWeight: 400 }}>
              <ShowBalance api={api} balance={myVoteBalance} decimalPoint={1} />
            </Grid>
            <Grid item sx={{ fontSize: '28px', fontWeight: 400, pl: '5px' }}>
              {myVoteConviction}
            </Grid>
          </Grid>
          <Grid alignItems='center' container fontSize='28px' fontWeight={500} item width='fit-content'>
            {myVoteType &&
              <>
                {myVoteType === 'Aye' && <>
                  <CheckIcon sx={{ color: 'aye.main', fontSize: '25px', stroke: theme.palette.aye.main, strokeWidth: 1.5 }} />
                  {t('Aye')}
                </>
                }
                {myVoteType === 'Nay' && <>
                  <CloseIcon sx={{ color: 'nay.main', fontSize: '25px', stroke: theme.palette.nay.main, strokeWidth: 1.5 }} />
                  {t('Nay')}
                </>
                }
                {myVoteType === 'Abstain' && <>
                  <AbstainIcon sx={{ color: 'primary.light', fontSize: '25px' }} />
                  {t('Abstain')}
                </>
                }
              </>
            }
          </Grid>
        </Grid>
        <Grid container height='35px' item>
          <Warning
            fontWeight={400}
            marginTop={0}
            theme={theme}
          >
            {t<string>('Resubmitting the vote will override the current voting record.')}
          </Warning>
        </Grid>
      </Grid>
    );
  };

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
    <Modal disableScrollLock={true} onClose={handleClose} open={open}>
      <Box sx={{ ...style }}>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Cast Your Vote')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative' }}>
          <From
            address={address}
            api={api}
            style={{ '> div': { px: '10px' }, '> p': { fontWeight: 400 } }}
            title={t<string>('Account')}
          />
          <Grid container item justifyContent='flex-start' mt='15px'>
            <FormControl fullWidth>
              <FormLabel sx={{ color: 'text.primary', fontSize: '16px', '&.Mui-focused': { color: 'text.primary' }, textAlign: 'left' }}>
                {t('Vote')}
              </FormLabel>
              <RadioGroup onChange={onSelectVote} row>
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
            label={t<string>(`Vote Value(${token})`)}
            onChangeAmount={onVoteAmountChange}
            onPrimary={onMaxAmount}
            onSecondary={onLockedAmount}
            primaryBtnText={t<string>('Max amount')}
            secondaryBtnText={t<string>('Locked amount')}
            style={{
              fontSize: '16px',
              mt: '15px',
              width: '100%'
            }}
            value={voteAmount}
          />
          <Grid container item justifyContent='space-between' sx={{ mt: '10px' }}>
            <Grid item sx={{ fontSize: '16px' }}>
              {t('Available Voting Balance')}
            </Grid>
            <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
              <ShowBalance balance={balances?.votingBalance} decimal={decimal} token={token} />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px' }}>
            <Grid item sx={{ fontSize: '16px' }}>
              <Infotip iconLeft={5} iconTop={4} showQuestionMark text={t('The maximum number of tokens that are already locked in the ecosystem')}>
                {t('Already Locked Balance')}
              </Infotip>
            </Grid>
            <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
              <Infotip iconLeft={5} iconTop={4} showQuestionMark text={alreadyLockedTooltipText || 'Fetching ...'}>
                <ShowBalance balance={getAlreadyLockedValue(balances)} decimal={decimal} token={token} />
              </Infotip>
            </Grid>
          </Grid>
          {convictionOptions && voteType !== 'abstain' &&
            <>
              <Select
                _mt='15px'
                defaultValue={convictionOptions?.[0]?.value}
                label={t<string>('Vote Multiplier')}
                onChange={onChangeConviction}
                options={convictionOptions}
                value={conviction || convictionOptions?.[0]?.value}
              />
              <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '24px' }}>
                <Grid item>
                  <Typography sx={{ fontSize: '16px' }}>
                    {t('Your final vote power after multiplying')}
                  </Typography>
                </Grid>
                <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
                  <ShowBalance balance={amountToMachine(voteAmount, decimal).muln(conviction)} decimal={decimal} token={token} />
                </Grid>
              </Grid>
            </>
          }
          {myVote &&
            <CurrentVote />
          }
          <PButton
            _mt='15px'
            _width={100}
            text={t<string>('Next to review')}
            _ml={0}
            // _onClick={onCastVote}
            disabled={!conviction || !voteAmount || voteAmount === '0' || amountToMachine(voteAmount || 0, decimal)?.gt(balances?.votingBalance || 0) || !voteType}
          />
        </Grid>
      </Box>
    </Modal>
  );
}
