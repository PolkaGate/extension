// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Box, FormControl, FormControlLabel, FormLabel, Grid, Modal, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_MAX_INTEGER, BN_ONE, BN_ZERO } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AmountWithOptions, Convictions, From, Infotip, PButton, ShowBalance, Warning } from '../../../../components';
import { nFormatter } from '../../../../components/FormatPrice';
import { useAccountLocks, useApi, useBalances, useBlockInterval, useConvictionOptions, useCurrentBlockNumber, useDecimal, useFormatted, useMyVote, useToken, useTranslation } from '../../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { amountToHuman, amountToMachine, remainingTime } from '../../../../util/utils';
import { STATUS_COLOR } from '../../utils/consts';
import { ReferendumSubScan } from '../../utils/types';
import { getVoteType } from '../../utils/util';
import { getConviction } from '../myVote/util';
import Review from './partial/Review';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
  referendumInfo: ReferendumSubScan | undefined;
}

export interface VoteInformation {
  voteBalance: string;
  voteAmountBN: BN;
  votePower: string;
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

export default function CastVote({ address, open, referendumInfo, setOpen }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const balances = useBalances(address, undefined, undefined, true);
  const blockTime = useBlockInterval(address);
  const theme = useTheme();
  const myVote = useMyVote(address, referendumInfo);
  const currentBlock = useCurrentBlockNumber(address);
  const accountLocks = useAccountLocks(address, 'referenda', 'convictionVoting', true);
  const convictionOptions = useConvictionOptions(address, blockTime, t);

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

  const trackId = useMemo(() => referendumInfo?.origins_id, [referendumInfo?.origins_id]);
  const refIndex = useMemo(() => referendumInfo?.referendum_index, [referendumInfo?.referendum_index]);
  const lockedAmount = useMemo(() => getAlreadyLockedValue(balances), [balances]);
  const myVoteBalance = useMemo((): number | undefined => (myVote?.standard?.balance || myVote?.splitAbstain?.abstain || myVote?.delegating?.balance), [myVote]);
  const myVoteConviction = useMemo(() => (myVote?.standard?.vote ? `(${getConviction(myVote.standard.vote)}x)` : myVote?.delegating?.conviction ? `(${myVote.delegating.conviction}x)` : ''), [myVote?.delegating?.conviction, myVote?.standard?.vote]);

  const myVoteType = getVoteType(myVote);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [voteType, setVoteType] = useState<'Aye' | 'Nay' | 'Abstain' | undefined>();
  const [voteInformation, setVoteInformation] = useState<VoteInformation | undefined>();
  const [voteAmount, setVoteAmount] = React.useState<string>('0');
  const vote = api && api.tx.convictionVoting.vote;
  const [conviction, setConviction] = useState<number>();
  const [step, setStep] = useState<number>(0);

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

    return Number(voteAmount) * (conviction);
  }, [conviction, voteAmount, voteAmountAsBN]);

  useEffect(() => {
    convictionOptions === undefined && setConviction(1);
  }, [convictionOptions]);

  useEffect(() => {
    voteType === 'Abstain' && setConviction(0);
  }, [voteType]);

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

  useEffect(() => {
    if (!convictionLockUp || !voteType || !votePower || !voteAmountAsBN || !trackId || !voteAmount || conviction === undefined || refIndex === undefined) {
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
  }, [conviction, convictionLockUp, refIndex, trackId, voteAmount, voteAmountAsBN, votePower, voteType]);

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

  const onCastVote = useCallback(() => {
    setStep(1);
  }, []);

  const CurrentVote = ({ api, voteBalance, voteConviction, voteType }: { api: ApiPromise | undefined, voteBalance: number, voteConviction: string, voteType: 'Aye' | 'Nay' | 'Abstain' | undefined }) => {
    return (
      <Grid alignItems='center' container direction='column' item>
        <Typography fontSize='16px' fontWeight={400} textAlign='left' width='100%'>
          {t<string>('Current Voting')}
        </Typography>
        <Grid alignItems='center' container item sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', justifyContent: 'space-between', p: '5px 10px' }}>
          <Grid alignItems='center' container item width='fit-content'>
            <Grid item sx={{ fontSize: '28px', fontWeight: 400 }}>
              <ShowBalance api={api} balance={voteBalance} decimalPoint={1} />
            </Grid>
            <Grid item sx={{ fontSize: '28px', fontWeight: 400, pl: '5px' }}>
              {voteConviction}
            </Grid>
          </Grid>
          <Grid alignItems='center' container fontSize='28px' fontWeight={500} item width='fit-content'>
            {voteType &&
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

  const refreshAll = useCallback(() => {
    setVoteAmount('0');
    setVoteType(undefined);
    setVoteInformation(undefined);
    setConviction(undefined);
    setStep(0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    refreshAll();
  }, [refreshAll, setOpen]);

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

  return (
    <Modal disableScrollLock={true} onClose={handleClose} open={open}>
      <Box sx={{ ...style }}>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {step === 0
                ? t<string>('Cast Your Vote')
                : step === 1
                  ? t<string>('Review Your Vote')
                  : step === 2
                    ? t<string>('Voting')
                    : step === 3
                      ? t<string>('Voting Completed')
                      : t<string>('Select Proxy')
              }
            </Typography>
          </Grid>
          <Grid item>
            {step !== 2 && <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />}
          </Grid>
        </Grid>
        {step === 0
          ? <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative' }}>
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
              inputWidth={8.4}
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
            <Grid container item>
              <Grid container item justifyContent='space-between' sx={{ mt: '10px', width: '70%' }}>
                <Grid item sx={{ fontSize: '16px' }}>
                  {t('Available Voting Balance')}
                </Grid>
                <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
                  <ShowBalance balance={balances?.votingBalance} decimal={decimal} decimalPoint={2} token={token} />
                </Grid>
              </Grid>
              <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px', width: '70%' }}>
                <Grid item sx={{ fontSize: '16px' }}>
                  <Infotip iconLeft={5} iconTop={4} showQuestionMark text={t('The maximum number of tokens that are already locked in the ecosystem')}>
                    {t('Already Locked Balance')}
                  </Infotip>
                </Grid>
                <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
                  <Infotip iconLeft={5} iconTop={2} showInfoMark text={alreadyLockedTooltipText || 'Fetching ...'}>
                    <ShowBalance balance={getAlreadyLockedValue(balances)} decimal={decimal} decimalPoint={2} token={token} />
                  </Infotip>
                </Grid>
              </Grid>
            </Grid>
            {voteType !== 'Abstain' &&
              <Convictions address={address} conviction={conviction} setConviction={setConviction}>
                <Grid alignItems='center' container item justifyContent='space-between' sx={{ height: '42px' }}>
                  <Grid item>
                    <Typography sx={{ fontSize: '16px' }}>
                      {t('Your final vote power after multiplying')}
                    </Typography>
                  </Grid>
                  <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
                    <Typography fontSize='28px' fontWeight={500}>
                      {nFormatter(votePower, 2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Convictions>
            }
            {myVoteBalance !== undefined &&
              <CurrentVote api={api} voteBalance={myVoteBalance} voteConviction={myVoteConviction} voteType={myVoteType} />
            }
            <PButton
              _ml={0}
              _mt='15px'
              _onClick={onCastVote}
              _width={100}
              disabled={goVoteDisabled}
              text={t<string>('Next to review')}
            />
          </Grid>
          : voteInformation &&
          <Review
            address={address}
            estimatedFee={estimatedFee}
            formatted={String(formatted)}
            handleClose={handleClose}
            setStep={setStep}
            step={step}
            voteInformation={voteInformation}
          />
        }
      </Box>
    </Modal>
  );
}
