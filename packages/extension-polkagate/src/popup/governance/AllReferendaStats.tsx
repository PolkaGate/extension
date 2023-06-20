// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Divider, Grid, LinearProgress, makeStyles, SxProps, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';

import { FormatPrice, ShowBalance, ShowValue } from '../../components';
import { useApi, useChain, useChainName, useDecidingCount, useDecimal, usePrice, useToken, useTranslation } from '../../hooks';
import { remainingTime } from '../../util/utils';
import { getReferendumStatistics, Statistics } from './utils/helpers';
import { LabelValue } from './TrackStats';

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

const TreasuryBalanceStat = ({ address, balance, noDivider, rowDisplay, style, title, tokenPrice }: TreasuryBalanceStatProps) => {
  const api = useApi(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  return (
    <>
      <Grid container item sx={{ ...style, justifyContent: rowDisplay ? 'space-between' : 'flex-start' }}>
        <Grid alignItems='center' container item width='fit-content'>
          <Typography fontSize={18} fontWeight={400} lineHeight='25px'>
            {title}
          </Typography>
        </Grid>
        <Grid alignItems='flex-start' container direction='column' item width={rowDisplay ? 'fit-content' : '100%'}>
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
      {!noDivider && <Divider flexItem orientation={rowDisplay ? 'horizontal' : 'vertical'} sx={{ width: rowDisplay ? '100%' : 'auto' }} />}
    </>
  );
};

export function AllReferendaStats({ address, topMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const firstBreakpoint = !useMediaQuery('(min-width:1000px)');
  const secondBreakpoint = !useMediaQuery('(min-width:700px)');
  const decidingCounts = useDecidingCount(address);
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const price = usePrice(address);

  const [referendumStats, setReferendumStats] = useState<Statistics | undefined | null>();
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | undefined>();

  const styles = {
    parent: {
      alignItems: 'start',
      bgcolor: 'background.paper',
      border: 1,
      borderColor: theme.palette.mode === 'light' ? 'background.paper' : 'secondary.main',
      borderRadius: '10px',
      boxShadow: '2px 3px 4px rgba(0, 0, 0, 0.1)',
      justifyContent: 'space-around',
      p: '15px'
    },
    firstChild: {
      boxSizing: 'content-box',
      maxWidth: secondBreakpoint ? '100%' : firstBreakpoint ? '400px' : '292px',
      minWidth: ' 225px',
      width: secondBreakpoint ? '100%' : firstBreakpoint ? '40%' : 'auto'
    },
    secondChild: {
      justifyContent: firstBreakpoint ? 'initial' : 'space-around',
      maxWidth: secondBreakpoint ? '100%' : firstBreakpoint ? '500px' : '730px',
      minWidth: secondBreakpoint ? '100%' : firstBreakpoint ? '365px' : '635px',
      width: secondBreakpoint ? '100%' : firstBreakpoint ? '52%' : '65%'
    }
  };

  useEffect(() => {
    // reset all if chain changed
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

    if (api?.genesisHash && chain?.genesisHash === api?.genesisHash.toString()) {
      // eslint-disable-next-line no-void
      void fetchData();
    }
  }, [api, api?.genesisHash, chain?.genesisHash]);

  useEffect(() => {
    chainName && getReferendumStatistics(chainName, topMenu).then((stat) => {
      setReferendumStats(stat);
    }).catch(console.error);
  }, [chainName, setReferendumStats, topMenu]);

  const allDeciding = useMemo(() => decidingCounts?.[topMenu]?.find((d) => d[0] === 'all')?.[1], [decidingCounts, topMenu]);

  return (
    <Container disableGutters sx={{ px: '8px' }}>
      <Grid container sx={styles.parent}>
        <Grid container item sx={styles.firstChild}>
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
        <Divider flexItem orientation={secondBreakpoint ? 'horizontal' : 'vertical'} sx={{ my: '15px', width: secondBreakpoint ? '100%' : 'auto' }} />
        <Grid container item sx={styles.secondChild}>
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
                {t('Spend Period')}
              </Typography>
            </Grid>
            <Grid alignItems='flex-start' container direction='column' item width={firstBreakpoint ? 'fit-content' : '100%'}>
              <Grid alignItems='center' container item sx={{ fontSize: '20px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em', pt: '10px' }} width='fit-content'>
                <ShowValue value={treasuryStats?.remainingTimeToSpend} width='131px' /> / <ShowValue value={treasuryStats?.spendPeriod?.toString()} width='20px' /> {t('days')}
              </Grid>
              <Grid container item sx={{ fontSize: '16px', letterSpacing: '-0.015em' }} width='fit-content'>
                <Grid alignItems='center' container item pr='5px' width='fit-content'>
                  <LinearProgress sx={{ bgcolor: 'primary.contrastText', borderRadius: '5px', height: '6px', mt: '5px', width: '185px' }} value={treasuryStats?.remainingSpendPeriodPercent || 0} variant='determinate' />
                </Grid>
                <Grid fontSize={18} fontWeight={400} item>
                  {treasuryStats?.remainingSpendPeriodPercent}%
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider flexItem orientation={firstBreakpoint ? 'horizontal' : 'vertical'} sx={{ width: firstBreakpoint ? '100%' : 'auto' }} />
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
