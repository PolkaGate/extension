// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AccountBalance as TreasuryIcon, AdminPanelSettings as AdminsIcon, BorderAll as All, Cancel, Close, Groups as FellowshipIcon, HowToVote as ReferendaIcon, Hub as Root } from '@mui/icons-material/';
import { Box, Breadcrumbs, Button, Container, Divider, Grid, LinearProgress, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { DeriveTreasuryProposals } from '@polkadot/api-derive/types';
import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';

import { logoBlack, logoWhite } from '../../assets/logos';
import { FormatPrice, ShowBalance, ShowValue } from '../../components';
import { useApi, useDecidingCount, useDecimal, usePrice, useTracks, useTranslation } from '../../hooks';
import { postData } from '../../util/api';
import { remainingTime } from '../../util/utils';

type TopMenu = 'Referenda' | 'Fellowship';
const EMPTY_U8A_32 = new Uint8Array(32);

export default function OpenGov(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address);
  const tracks = useTracks(address, api);
  const price = usePrice(address);
  const decimal = useDecimal(address);

  const decidingCounts = useDecidingCount(api, tracks);
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu>();
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>();

  const [proposals, setProposals] = useState<DeriveTreasuryProposals | undefined>();
  const [activeProposalCount, setActiveProposalCount] = useState<number | undefined>();
  const [availableTreasuryBalance, setAvailableTreasuryBalance] = useState<BN | undefined>();
  const [spendPeriod, setSpendPeriod] = useState<BN | undefined>();
  const [remainingSpendPeriod, setRemainingSpendPeriod] = useState<BN | undefined>();
  const [remainingTimeToSpend, setRemainingTimeToSpend] = useState<string | undefined>();
  const [remainingSpendPeriodPercent, setRemainingSpendPeriodPercent] = useState<number | undefined>();
  const [pendingBounties, setPendingBounties] = useState<BN | undefined>();
  const [pendingProposals, setPendingProposals] = useState<BN | undefined>();
  const [spendable, setSpendable] = useState<BN | undefined>();
  const [spenablePercent, setSpendablePercent] = useState<number | undefined>();
  const [nextBurn, setNextBurn] = useState<BN | undefined>();
  const [approved, setApproved] = useState<BN | undefined>();

  useEffect(() => {
    if (!api) {
      return;
    }

    let cancel = false;

    // clear proposals state
    setProposals(undefined);

    // fetch proposals
    api.derive.treasury.proposals()?.then((p) => {
      if (!cancel) {
        setProposals(p);
        setActiveProposalCount(p?.proposals.length + p?.approvals.length);
        console.log('proposals:', JSON.stringify(p?.proposals));
      }
    }).catch(console.error);

    return () => {
      cancel = true;
    };
  }, [api]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!api) {
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
        const rt = remainingTime(remainingSpendPeriod.toNumber());
        const nextBurn = api.consts.treasury.burn.mul(treasuryBalance).div(BN_MILLION) as BN;

        setRemainingSpendPeriod(remainingSpendPeriod);
        setSpendPeriod(spendPeriod.divn(24 * 60 * 10));
        setRemainingTimeToSpend(rt);
        setRemainingSpendPeriodPercent(spendPeriod.sub(remainingSpendPeriod).muln(100).div(spendPeriod).toNumber());
        setAvailableTreasuryBalance(treasuryBalance);
        setNextBurn(nextBurn);
        setPendingBounties(pendingBounties);
        setPendingProposals(pendingProposals);
        setApproved(approved);
        setSpendable(spendable);
        setSpendablePercent(spendable.muln(100).div(treasuryBalance).toNumber());
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [api]);

  useEffect(() => {
    console.log('*******************************************************');
    getReferendumVotes('kusama', 124);
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!api.consts.referenda) {
      console.log('OpenGov is not supported on this chain');

      return;
    }

    console.log('getting info ...');

    console.log('Maximum size of the referendum queue for a single track:', api.consts.referenda.maxQueued.toString());
    console.log('minimum amount to be used as a deposit :', api.consts.referenda.submissionDeposit.toString());
    console.log('*******************************************************');
    console.log('blocks after submission that a referendum must begin decided by.', api.consts.referenda.undecidingTimeout.toString());

    console.log('*******************************************************');

    api.query.referenda.referendumCount().then((count) => {
      console.log('total referendum count:', count.toString());

      const latestReferendumNumber = count.toNumber() - 2;
      api.query.referenda.referendumInfoFor(latestReferendumNumber).then((res) => {
        console.log(`referendumInfoFor referendum ${latestReferendumNumber} :, ${res}`);
      });
    }).catch(console.error);

    const trackId_mediumSpender = 33;

    api.query.referenda.decidingCount(trackId_mediumSpender).then((res) => {
      console.log('total referendum being decided in trackId_mediumSpender:', res.toString());
    }).catch(console.error);

    api.query.referenda.trackQueue(trackId_mediumSpender).then((res) => {
      console.log('trackQueue for trackId_mediumSpender:', res.toString());
    }).catch(console.error);
  }, [api]);

  useEffect(() => {
    /** to change app width to full screen */
    const root = document.getElementById('root');

    if (root) {
      root.style.width = '100%';
    }

    return () => {
      if (root) {
        root.style.width = '';
      }
    };
  }, []);

  const onTopMenuMenuClick = useCallback((item: TopMenu) => {
    setSelectedTopMenu((prevSelectedTopMenu) =>
      prevSelectedTopMenu !== item ? item : undefined
    );

    setSelectedSubMenu('All');
  }, []);

  const findItemDecidingCount = useCallback((item: string): number | undefined => {
    if (!decidingCounts) {
      return undefined;
    }

    const itemKey = item.toLowerCase().replaceAll(' ', '_');
    const filtered = decidingCounts.find(([key]) => key === itemKey);

    return filtered?.[1];
  }, [decidingCounts]);

  function TopMenu({ item }: { item: TopMenu }): React.ReactElement<{ item: TopMenu }> {
    return (
      <Grid alignItems='center' container item justifyContent='center' onClick={() => onTopMenuMenuClick(item)} sx={{ mt: '3px', px: '5px', bgcolor: selectedTopMenu === item ? 'background.paper' : 'primary.main', color: selectedTopMenu === item ? 'primary.main' : 'text.secondary', width: '150px', height: '48px', cursor: 'pointer' }}>
        <Typography sx={{ display: 'inline-block', fontWeight: 500, fontSize: '20px' }}>
          {item}
        </Typography>
        {item === 'Fellowship'
          ? <FellowshipIcon sx={{ fontSize: 29, ml: '10px' }} />
          : <ReferendaIcon sx={{ fontSize: 29, ml: '10px', transform: 'scaleX(-1)' }} />
        }
      </Grid>
    );
  }

  function MenuItem({ borderWidth = '2px', icon, item, width = '18%', fontWeight, clickable = true }: { item: string, icon?: React.ReactElement, width?: string, borderWidth?: string, fontWeight?: number, clickable?: boolean }): React.ReactElement {
    const decidingCount = findItemDecidingCount(item);

    return (
      <Grid alignItems='center' container item sx={{ cursor: clickable && 'pointer', fontSize: '18px', width, borderBottom: `${borderWidth} solid`, borderColor: 'primary.main', mr: '37px', py: '5px', '&:hover': clickable && { color: 'primary.main', fontWeight: 700 } }}>
        <Typography onClick={() => setSelectedSubMenu(item)} sx={{ display: 'inline-block', fontWeight: fontWeight || 'inherit' }}>
          {item}{decidingCount ? ` (${decidingCount})` : ''}
        </Typography>
        {icon}
      </Grid>
    );
  }

  const ReferendaMenu = () => (
    <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', px: '50px', py: '15px', zIndex: 10, position: 'absolute' }}>
      <MenuItem
        fontWeight={500}
        icon={<All sx={{ fontSize: 20, fontWeight: 500, ml: '10px' }} />}
        item='All'
      />
      <MenuItem
        fontWeight={500}
        icon={<Root sx={{ fontSize: 20, ml: '10px' }} />}
        item='Root'
      />
      <Grid container item sx={{ width: '18%' }}>
        <MenuItem
          clickable={false}
          fontWeight={500}
          icon={<Cancel sx={{ fontSize: 20, ml: '10px' }} />}
          item='Referendum'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Referendum Canceler'
          width='100%'
        />
        <MenuItem
          borderWidth='2px'
          item='Referendum Killer'
          width='100%'
        />
      </Grid>
      <Grid container item sx={{ width: '18%' }}>
        <MenuItem
          clickable={false}
          fontWeight={500}
          icon={<AdminsIcon sx={{ fontSize: 20, ml: '10px' }} />}
          item='Admin'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Auction Admin'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='General Admin'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Lease Admin'
          width='100%'
        />
        <MenuItem
          borderWidth='2px'
          item='Staking Admin'
          width='100%'
        />
      </Grid>
      <Grid container item sx={{ width: '18%' }}>
        <MenuItem
          clickable={false}
          fontWeight={500}
          icon={<TreasuryIcon sx={{ fontSize: 20, ml: '10px' }} />}
          item='Treasury'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Treasurer'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='small Tipper'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Big Tipper'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Small Spender'
          width='100%'
        />
        <MenuItem
          borderWidth='1px'
          item='Medium Spender'
          width='100%'
        />
        <MenuItem
          borderWidth='2px'
          item='Big Spender'
          width='100%'
        />
      </Grid>
    </Grid>
  );

  return (
    <>
      <Grid alignItems='center' container id='header' sx={{ bgcolor: '#180710', height: '85px', color: 'text.secondary', fontSize: '42px', fontWeight: 400, fontFamily: 'Eras' }}>
        <Box
          component='img'
          src={theme.palette.mode === 'light' ? logoBlack as string : logoWhite as string}
          sx={{ height: 50, width: 50, ml: '50px', mr: '8.5px' }}
        />
        Polkagate
      </Grid>
      <Grid alignItems='center' container id='menu' justifyContent='space-between' sx={{ bgcolor: 'primary.main', height: '51.5px', color: 'text.secondary', fontSize: '20px', fontWeight: 500, pl: '50px' }}>
        <Grid container alignItems='flex-end' item md={4} justifyContent='flex-start'>
          <TopMenu item={'Referenda'} />
          <TopMenu item={'Fellowship'} />
        </Grid>
        <Grid container item justifyContent='flex-end' sx={{ pr: '50px' }} md={5}>
          <Button
            // disabled={disabled}
            // onClick={_onClick}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '5px',
              color: 'primary.main',
              fontSize: '18px',
              fontWeight: 500,
              height: '36px',
              textTransform: 'none',
              width: '208px',
              '&:hover': {
                backgroundColor: '#fff',
                color: '#3c52b2'
              }
            }}
            variant='contained'
          >
            Multirole Delegate
          </Button>
          <Button
            // disabled={disabled}
            // onClick={_onClick}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '5px',
              color: 'primary.main',
              fontSize: '18px',
              fontWeight: 500,
              height: '36px',
              textTransform: 'none',
              ml: '15px',
              width: '208px',
              '&:hover': {
                backgroundColor: '#fff',
                color: '#3c52b2'
              }
            }}
            variant='contained'
          >
            Submit Referendum
          </Button>
        </Grid>
      </Grid>
      {selectedTopMenu === 'Referenda' &&
        <ReferendaMenu />
      }
      <Container disableGutters maxWidth={false} sx={{ px: '50px', top: 132, position: 'fixed' }} >
        <Grid container sx={{ py: '10px', fontWeight: 500 }}>
          <Breadcrumbs color='text.primary' aria-label='breadcrumb'>
            <Link underline='hover' href='/'>
              {selectedTopMenu || 'Referenda'}
            </Link>
            <Typography color='text.primary'>{selectedSubMenu || 'All'}</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid container alignItems='start' sx={{ bgcolor: 'background.paper', height: '162px', pt: '30px', pb: '20px' }}>
          <Grid container item sx={{ px: '3%' }} xs={2.5}>
            <Grid item sx={{ height: '34px' }} md={12}>
              <Typography fontWeight={400}>
                {t('Available')}
              </Typography>
            </Grid>
            <Grid container item alignItems='center' sx={{ borderBottom: '1px solid', fontSize: '28px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
              <ShowBalance api={api} balance={availableTreasuryBalance} decimalPoint={2} />
            </Grid>
            <Grid item sx={{ fontSize: '18px', pt: '8px', letterSpacing: '-0.015em', height: '36px' }} xs={12}>
              <FormatPrice
                amount={availableTreasuryBalance}
                decimals={decimal}
                price={price?.amount}
              />
            </Grid>
          </Grid>
          <Divider orientation='vertical' flexItem />
          <Grid container item sx={{ px: '3%' }} xs={2.5}>
            <Grid item sx={{ height: '34px' }} md={12}>
              <Typography fontWeight={400}>
                {t('Approved')}
              </Typography>
            </Grid>
            <Grid container item alignItems='center' sx={{ borderBottom: '1px solid', fontSize: '28px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
              <ShowBalance api={api} balance={approved} decimalPoint={2} />
            </Grid>
            <Grid item sx={{ fontSize: '18px', pt: '8px', letterSpacing: '-0.015em', height: '36px' }} xs={12}>
              <FormatPrice
                amount={approved}
                decimals={decimal}
                price={price?.amount}
              />
            </Grid>
          </Grid>
          <Divider orientation='vertical' flexItem />
          <Grid container item sx={{ px: '3%' }} xs={4}>
            <Grid item sx={{ height: '34px' }} md={12}>
              <Typography fontWeight={400}>
                {t('Spend Period')}
              </Typography>
            </Grid>
            <Grid container item alignItems='center' sx={{ borderBottom: '1px solid', fontSize: '28px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
              <ShowValue value={remainingTimeToSpend} /> / <ShowValue value={spendPeriod?.toString()} width='20px' />
            </Grid>
            <Grid container item sx={{ fontSize: '18px', pt: '8px', letterSpacing: '-0.015em', height: '36px' }} xs={12}>
              <Grid item xs={10.5}>
                <LinearProgress variant='determinate' value={remainingSpendPeriodPercent || 0} sx={{ mt: '10px', bgcolor: 'primary.contrastText' }} />
              </Grid>
              <Grid item xs sx={{ textAlign: 'right' }}>
                {remainingSpendPeriodPercent}%
              </Grid>
            </Grid>
          </Grid>
          <Divider orientation='vertical' flexItem />
          <Grid container item sx={{ px: '3%' }} xs={2.5}>
            <Grid item sx={{ height: '34px' }} md={12}>
              <Typography fontWeight={400}>
                {t('Next Burn')}
              </Typography>
            </Grid>
            <Grid container item alignItems='center' sx={{ borderBottom: '1px solid', fontSize: '28px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
              <ShowBalance api={api} balance={nextBurn} decimalPoint={2} />
            </Grid>
            <Grid item sx={{ fontSize: '18px', pt: '8px', letterSpacing: '-0.015em', height: '36px' }} xs={12}>
              <FormatPrice
                amount={nextBurn}
                decimals={decimal}
                price={price?.amount}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export async function getReferendumVotes(chainName: string, referendumIndex: number | undefined): Promise<string | null> {
  if (!referendumIndex) {
    console.log('referendumIndex is undefined getting Referendum Votes ');

    return null;
  }

  console.log(`Getting referendum ${referendumIndex} votes from subscan ... `);

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + '.api.subscan.io/api/scan/referenda/votes',
        {
          page: 2,
          referendum_index: referendumIndex,
          row: 99
        })
        .then((data: { message: string; data: { count: number, list: string[]; } }) => {
          if (data.message === 'Success') {
            console.log(data.data)


            resolve(data.data);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendum votes ');
      resolve(null);
    }
  });
}