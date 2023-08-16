// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Divider, Grid, LinearProgress, SxProps, Typography, useMediaQuery } from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';

import { FormatPrice, ShowBalance, ShowValue } from '../../components';
import { useApi, useChain, useChainName, useDecidingCount, useDecimal, usePrice, useToken, useTranslation } from '../../hooks';
import { remainingTime } from '../../util/utils';
import useStyles from './styles/styles';
import { getReferendumStatistics, Statistics } from './utils/helpers';
import { LabelValue } from './TrackStats';
import blockToDate from '../crowdloans/partials/blockToDate';

interface Props {
  address: string;
  topMenu: 'referenda' | 'fellowship';
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

interface TreasuryBalanceStatProps {
  address: string;
  title: string;
  balance: BN | undefined;
  tokenPrice: number | undefined;
  noDivider?: boolean;
  style?: SxProps;
  rowDisplay?: boolean;
}

export const Separator = ({ changeOrientation, m }: { changeOrientation: boolean, m?: number }) => (<Divider flexItem orientation={changeOrientation ? 'horizontal' : 'vertical'} sx={{ my: `${m}px`, width: changeOrientation ? '100%' : 'auto' }} />);

const TreasuryBalanceStat = ({ address, balance, noDivider, rowDisplay, style, title, tokenPrice }: TreasuryBalanceStatProps) => {
  const api = useApi(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  return (
    <>
      <Grid container item sx={{ ...style, justifyContent: rowDisplay ? 'space-between' : 'flex-start' }}>
        <Grid alignItems='center' container item width='fit-content'>
          <Typography fontSize={18} fontWeight={400} lineHeight='25px' mt='6px'>
            {title}
          </Typography>
        </Grid>
        <Grid alignItems='flex-start' container direction='column' item width={rowDisplay ? 'fit-content' : '100%'} mt='11px'>
          <Grid alignItems='center' container item sx={{ fontSize: '20px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em', pt: '10px' }} width='fit-content'>
            <ShowBalance api={api} balance={balance} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
          <Grid container item sx={{ fontSize: '16px', letterSpacing: '-0.015em' }} width='fit-content'>
            <FormatPrice
              amount={balance}
              decimals={decimal}
              price={tokenPrice}
            />
          </Grid>
        </Grid>
      </Grid>
      {!noDivider && <Separator changeOrientation={!!rowDisplay} />}
    </>
  );
};

export function AllReferendaStats({ address, topMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const firstBreakpoint = !useMediaQuery('(min-width:1000px)');
  const secondBreakpoint = !useMediaQuery('(min-width:700px)');
  const styles = useStyles(firstBreakpoint, secondBreakpoint);
  const decidingCounts = useDecidingCount(address);
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const price = usePrice(address);
  const myRef = useRef();

  const [referendumStats, setReferendumStats] = useState<Statistics | undefined | null>();
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | undefined>();
  const [nextSpendingWidth, setNextSpendingWidth] = useState<number>(0);

  useEffect(() => {
    if (myRef.current) {
      setNextSpendingWidth(myRef.current.clientWidth);
    }
  }, [treasuryStats]);

  useEffect(() => {
    if (chain?.genesisHash !== String(api?.genesisHash)) {
      // reset all if chain changed
      setTreasuryStats(undefined);
    }
  }, [api?.genesisHash, chain?.genesisHash]);

  useEffect(() => {
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
        // const rt = remainingTime(remainingSpendPeriod.toNumber(), true);
        const dateFormat = { day: 'numeric', hour: '2-digit', hourCycle: 'h23', minute: '2-digit', month: 'short', hour12: true };

        const rt = blockToDate(remainingSpendPeriod.add(bestNumber).toNumber(), bestNumber.toNumber(), dateFormat);
        const nextBurn = api.consts.treasury.burn.mul(treasuryBalance).div(BN_MILLION) as BN;

        setTreasuryStats({
          approved,
          availableTreasuryBalance: treasuryBalance,
          nextBurn,
          pendingBounties,
          pendingProposals,
          remainingSpendPeriod,
          remainingSpendPeriodPercent: remainingSpendPeriod.muln(100).div(spendPeriod).toNumber(),
          remainingTimeToSpend: rt,
          spendPeriod: spendPeriod.divn(24 * 60 * 10),
          spendable,
          spendablePercent: spendable.muln(100).div(treasuryBalance).toNumber()
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (api?.genesisHash && chain?.genesisHash === api?.genesisHash.toString()) {
      // eslint-disable-next-line no-void
      void fetchData();
    }
  }, [api, chain]);

  useEffect(() => {
    if (chainName) {
      setReferendumStats(undefined);

      // eslint-disable-next-line no-void
      void getReferendumStatistics(chainName, topMenu).then((stat) => {
        setReferendumStats(stat);
      });
    }
  }, [chainName, setReferendumStats, topMenu]);

  const allDeciding = useMemo(() => decidingCounts?.[topMenu]?.find((d) => d[0] === 'all')?.[1], [decidingCounts, topMenu]);

  return (
    <Container disableGutters sx={{ px: '8px' }}>
      <Grid container sx={styles.allReferendaStatsContainer}>
        <Grid container item sx={styles.referendaStats}>
          <Grid container item sx={{ borderBottom: '2px solid gray', mb: '10px' }}>
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
            value={allDeciding || referendumStats?.voting_total}
          />
          {referendumStats?.active_fellowship_members
            ? <LabelValue
              label={t('Active Members')}
              noBorder
              value={`${referendumStats?.active_fellowship_members} out of ${referendumStats?.fellowship_members}`}
            />
            : <LabelValue
              label={t('Participation')}
              noBorder
              value={
                <ShowBalance
                  api={api}
                  balance={referendumStats?.referendum_participate}
                  decimal={decimal}
                  decimalPoint={2}
                  token={token}
                />
              }
            />
          }
        </Grid>
        <Separator changeOrientation={secondBreakpoint} m={15} />
        <Grid container item sx={styles.treasuryStats}>
          <Grid container item sx={{ borderBottom: '2px solid gray', mb: firstBreakpoint ? 0 : '10px' }}>
            <Typography fontSize={20} fontWeight={500}>
              {t('Treasury stats')}
            </Typography>
          </Grid>
          <TreasuryBalanceStat
            address={address}
            balance={treasuryStats?.availableTreasuryBalance}
            rowDisplay={firstBreakpoint}
            style={{ maxWidth: firstBreakpoint ? '100%' : '135px', minWidth: '120px' }}
            title={t('Available')}
            tokenPrice={price?.amount}
          />
          <TreasuryBalanceStat
            address={address}
            balance={treasuryStats?.approved}
            rowDisplay={firstBreakpoint}
            style={{ maxWidth: firstBreakpoint ? '100%' : '115px', minWidth: '105px' }}
            title={t('Approved')}
            tokenPrice={price?.amount}
          />
          <Grid container item justifyContent={firstBreakpoint ? 'space-between' : 'flex-start'} maxWidth={firstBreakpoint ? '100%' : '250px'} width={firstBreakpoint ? '100%' : 'fit-content'}>
            <Grid alignItems='center' container item width='fit-content'>
              <Typography fontSize={18} fontWeight={400} lineHeight='25px'>
                {t('Next Spending')}
              </Typography>
            </Grid>
            <Grid alignItems='flex-start' container direction='column' item width={firstBreakpoint ? 'fit-content' : '100%'} pt='10px'>
              <Grid alignItems='center' ref={myRef} container item sx={{ fontSize: '20px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em', pt: '10px' }} width='fit-content'>
                <ShowValue value={treasuryStats?.remainingTimeToSpend} width='150px' />
              </Grid>
              <Grid container item sx={{ fontSize: '16px', letterSpacing: '-0.015em' }} width='fit-content'>
                <ShowValue value={treasuryStats?.spendPeriod && `${t('Each spending period is {{sp}} days', { replace: { sp: treasuryStats?.spendPeriod?.toString() } })}`} width='220px' />
              </Grid>
            </Grid>
          </Grid>
          <Separator changeOrientation={firstBreakpoint} />
          <TreasuryBalanceStat
            address={address}
            balance={treasuryStats?.nextBurn}
            noDivider
            rowDisplay={firstBreakpoint}
            style={{ maxWidth: firstBreakpoint ? '100%' : '115px', minWidth: '100px' }}
            title={t('Next Burn')}
            tokenPrice={price?.amount}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
