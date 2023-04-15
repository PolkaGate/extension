// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, LinearProgress, SxProps, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';

import { FormatPrice, ShowBalance, ShowValue } from '../../components';
import { useApi, useChainName, useDecimal, usePrice, useToken, useTranslation } from '../../hooks';
import { remainingTime } from '../../util/utils';
import { getReferendumStatistics, Statistics } from './helpers';
import { LabelValue } from './TrackStats';

interface Props {
  address: string;
}

export interface TreasuryStats {
  // activeProposalCount: number;
  availableTreasuryBalance: BN;
  approved: BN;
  nextBurn: BN;
  pendingBounties: BN;
  pendingProposals: BN;
  // proposals: DeriveTreasuryProposals;
  remainingSpendPeriod: BN;
  remainingTimeToSpend: string;
  remainingSpendPeriodPercent: number;
  spendPeriod: BN;
  spendable: BN;
  spendablePercent: number;
}

const EMPTY_U8A_32 = new Uint8Array(32);

const TreasuryBalanceStat = ({ address, balance, noDivider, style, title, tokenPrice }: { address: string, title: string, balance: BN | undefined, tokenPrice: number | undefined, noDivider?: boolean, style?: SxProps }) => {
  const api = useApi(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  return (
    <>
      <Grid container item sx={{ ...style }} xs={2}>
        <Grid item md={12} sx={{ height: '25px' }}>
          <Typography fontSize={18} fontWeight={400}>
            {title}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item sx={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.015em', pt: '10px', height: '36px' }} xs={12}>
          <ShowBalance api={api} balance={balance} decimal={decimal} decimalPoint={2} token={token} />
        </Grid>
        <Grid item sx={{ fontSize: '16px', letterSpacing: '-0.015em' }} xs={12}>
          <FormatPrice
            amount={balance}
            decimals={decimal}
            price={tokenPrice}
          />
        </Grid>
      </Grid>
      {!noDivider && <Divider flexItem orientation='vertical' sx={{ mx: '3%' }} />}
    </>
  )
}

export function AllReferendaStats({ address }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const api = useApi(address);
  const chainName = useChainName(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const price = usePrice(address);

  const [referendumStats, setReferendumStats] = useState<Statistics | undefined>();
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | undefined>();

  useEffect(() => {
    // reset all if chainchanged
    setTreasuryStats(undefined);

    /** To fetch treasury info */
    async function fetchData() {
      try {
        if (!api || !api.derive.treasury) {
          return;
        }

        const treasuryAccount = u8aConcat(
          'modl',
          api.consts.treasury && api.consts.treasury.palletId
            ? api.consts.treasury.palletId.toU8a(true)
            : 'py/trsry',
          EMPTY_U8A_32
        ).subarray(0, 32);

        const [bestNumber, bounties, treasuryProposals, account] = await Promise.all([
          api.derive.chain.bestNumber(),
          api.derive.bounties?.bounties(),
          api.derive.treasury?.proposals(),
          api.derive.balances?.account(treasuryAccount)
        ]);

        const spendPeriod = new BN(api.consts.treasury?.spendPeriod) ?? BN_ZERO;
        const remainingSpendPeriod = spendPeriod.sub(bestNumber.mod(spendPeriod));
        const treasuryBalance = account ? account.freeBalance : BN_ZERO;
        const pendingBounties = bounties
          ? bounties.reduce((total, { bounty: { status, value } }) =>
            total.iadd(status.isApproved ? value : BN_ZERO), new BN(0))
          : BN_ZERO;
        const pendingProposals = treasuryProposals
          ? treasuryProposals.approvals.reduce((total, { proposal: { value } }) => total.iadd(value), new BN(0))
          : BN_ZERO;

        const approved = pendingBounties.add(pendingProposals);
        const spendable = treasuryBalance.sub(approved);
        const rt = remainingTime(remainingSpendPeriod.toNumber(), true);
        const nextBurn = api.consts.treasury.burn.mul(treasuryBalance).div(BN_MILLION) as BN;

        setTreasuryStats({
          approved,
          availableTreasuryBalance: treasuryBalance,
          nextBurn,
          pendingBounties,
          pendingProposals,
          remainingSpendPeriod,
          remainingSpendPeriodPercent: spendPeriod.sub(remainingSpendPeriod).muln(100).div(spendPeriod).toNumber(),
          remainingTimeToSpend: rt,
          spendPeriod: spendPeriod.divn(24 * 60 * 10),
          spendable,
          spendablePercent: spendable.muln(100).div(treasuryBalance).toNumber()
        });
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [api]);

  useEffect(() => {
    chainName && getReferendumStatistics(chainName).then((stat) => {
      setReferendumStats(stat);
    });
  }, [chainName]);

  return (
    <Grid alignItems='start' container justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '10px', height: '180px', pt: '15px', pb: '20px' }}>
      <Grid container item sx={{ ml: '3%' }} xs={2.5}>
        <Grid item sx={{ borderBottom: '2px solid gray', mb: '10px' }} xs={12}>
          <Typography fontSize={20} fontWeight={500}>
            {t('Referenda stats')}
          </Typography>
        </Grid>
        <LabelValue
          label={t('Confirming')}
          value={referendumStats?.confirm_total}
        />
        <LabelValue
          label={t('Deciding')}
          value={referendumStats?.voting_total}
        />
        <LabelValue
          label={t('Participation')}
          value={<ShowBalance api={api} balance={referendumStats?.referendum_participate} decimal={decimal} decimalPoint={2} token={token} />}
        />
        <Divider orientation='vertical' />
      </Grid>
      <Divider flexItem orientation='vertical' sx={{ mx: '10px' }} />
      <Grid container item sx={{ pr: '3%' }} xs={8.5}>
        <Grid item sx={{ borderBottom: '2px solid gray', mb: '10px' }} xs={12}>
          <Typography fontSize={20} fontWeight={500}>
            {t('Treasury stats')}
          </Typography>
        </Grid>
        <TreasuryBalanceStat
          address={address}
          balance={treasuryStats?.availableTreasuryBalance}
          title={t('Available')}
          tokenPrice={price?.amount}
        />
        <TreasuryBalanceStat
          address={address}
          balance={treasuryStats?.approved}
          title={t('Approved')}
          tokenPrice={price?.amount}
        />
        <Grid container item xs={3.5}>
          <Grid item md={12} sx={{ height: '25px' }}>
            <Typography fontWeight={400}>
              {t('Spend Period')}
            </Typography>
          </Grid>
          <Grid alignItems='center' container item sx={{ fontSize: '20px', fontWeight: 500, pt: '10px', letterSpacing: '-0.015em', height: '36px' }}>
            <ShowValue value={treasuryStats?.remainingTimeToSpend} width='131px' /> / <ShowValue value={treasuryStats?.spendPeriod?.toString()} width='20px' /> {t('days')}
          </Grid>
          <Grid alignItems='center' container item spacing={1} sx={{ fontSize: '18px', letterSpacing: '-0.015em' }}>
            <Grid item>
              <LinearProgress sx={{ bgcolor: 'primary.contrastText', mt: '5px', width: '185px' }} value={treasuryStats?.remainingSpendPeriodPercent || 0} variant='determinate' />
            </Grid>
            <Grid fontSize={18} fontWeight={400} item sx={{ textAlign: 'right' }}>
              {treasuryStats?.remainingSpendPeriodPercent}%
            </Grid>
          </Grid>
        </Grid>
        <Divider flexItem orientation='vertical' sx={{ mx: '3%' }} />
        <TreasuryBalanceStat
          address={address}
          balance={treasuryStats?.nextBurn}
          noDivider
          title={t('Next Burn')}
          tokenPrice={price?.amount}
        />
      </Grid>
    </Grid>
  );
}
