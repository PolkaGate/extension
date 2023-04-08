// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AccountBalance as TreasuryIcon, AdminPanelSettings as AdminsIcon, BorderAll as All, Cancel, Close, Groups as FellowshipIcon, HowToVote as ReferendaIcon, Hub as Root, ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import { Box, Breadcrumbs, Button, Container, Divider, Grid, LinearProgress, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { DeriveTreasuryProposals } from '@polkadot/api-derive/types';
import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';

import { logoBlack, logoWhite } from '../../assets/logos';
import { FormatPrice, Identity, ShowBalance, ShowValue } from '../../components';
import { useApi, useChain, useChainName, useDecidingCount, useDecimal, usePrice, useTracks, useTranslation } from '../../hooks';
import { postData } from '../../util/api';
import { remainingTime } from '../../util/utils';
import { getLatestReferendums, getReferendumStatistics, getReferendumVotes, getTrackReferendums } from './helpers';

const STATUS_COLOR = {
  Canceled: '#FF595E', // Status color for Canceled proposals
  Confirmed: '#8AC926', // Status color for Confirmed proposals
  Deciding: '#1982C4', // Status color for Deciding proposals
  Executed: '#6A4C93', // Status color for Executed proposals
  Rejected: '#FFA94D', // Status color for Rejected proposals
  Submitted: '#FFD166', // Status color for Submitted proposals
  TimedOut: '#A3A3A3', // Status color for TimedOut proposals
};

type TopMenu = 'Referenda' | 'Fellowship';
const EMPTY_U8A_32 = new Uint8Array(32);

export default function OpenGov(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address);
  const chain = useChain(address);
  const tracks = useTracks(address, api);
  const price = usePrice(address);
  const decimal = useDecimal(address);
  const chainName = useChainName(address);

  const decidingCounts = useDecidingCount(api, tracks);
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>('All');

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
  const [referendumCount, setReferendumCount] = useState<number | undefined>();
  const [approved, setApproved] = useState<BN | undefined>();
  const [referendaToList, setReferenda] = useState<string[]>();

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
        // console.log('proposals:', JSON.stringify(p?.proposals));
      }
    }).catch(console.error);

    return () => {
      cancel = true;
    };
  }, [api]);

  useEffect(() => {
    /** To fetch treasury info */
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
        const rt = remainingTime(remainingSpendPeriod.toNumber(), true);
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
    chainName && getReferendumVotes(chainName, 124);
  }, [chainName]);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!api.consts.referenda || !api.query.referenda) {
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
      console.log('total referendum count:', count.toNumber());
      setReferendumCount(count?.toNumber());

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
    chainName && getLatestReferendums(chainName).then((res) => {
      setReferenda(res);
    });
  }, [chainName]);

  useEffect(() => {
    chainName && getReferendumStatistics(chainName).then((stat) => {
      setReferendumCount(stat.OriginsCount);
    });
  }, [chainName]);

  useEffect(() => {
    if (chainName && selectedSubMenu && selectedSubMenu !== 'All' && tracks) {
      const trackId = tracks.find((t) => t[1].name === selectedSubMenu.toLowerCase().replace(' ', '_'))?.[0];
      console.log('selectedSubMenu:', selectedSubMenu)
      console.log('trackId:', trackId)
      trackId !== undefined && getTrackReferendums(chainName, trackId).then((res) => {
        setReferenda(res);
      }).catch(console.error);
    }
  }, [chainName, selectedSubMenu, tracks]);

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
    setSelectedTopMenu(item);
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

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

  function MenuItem({ borderWidth = '2px', clickable = true, fontWeight, icon, item, width = '18%' }: { item: string, icon?: React.ReactElement, width?: string, borderWidth?: string, fontWeight?: number, clickable?: boolean }): React.ReactElement {
    const decidingCount = findItemDecidingCount(item);
    const onSubMenuClick = useCallback(() => {
      setSelectedSubMenu(item);
      setMenuOpen((prevStatus) => !prevStatus);
    }, [item]);

    return (
      <Grid alignItems='center' container item sx={{ borderBottom: `${borderWidth} solid`, color: clickable && 'primary.main', cursor: clickable && 'pointer', fontSize: '18px', width, borderColor: 'primary.main', mr: '37px', py: '5px', '&:hover': clickable && { fontWeight: 700 } }}>
        <Typography onClick={onSubMenuClick} sx={{ display: 'inline-block', fontWeight: fontWeight || 'inherit' }}>
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
          item='Referendum Canceller'
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
      {menuOpen && selectedTopMenu === 'Referenda' &&
        <ReferendaMenu />
      }
      <Container disableGutters maxWidth={false} sx={{ px: '50px', top: 138, position: 'fixed', maxHeight: parent.innerHeight - 138, overflowY: 'scroll' }}>
        <Grid container sx={{ py: '10px', fontWeight: 500 }}>
          <Breadcrumbs color='text.primary' aria-label='breadcrumb'>
            <Link underline='hover' href='#'>
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
            <Grid container item alignItems='center' sx={{ borderBottom: '1px solid', fontSize: '26px', fontWeight: 500, height: '36px', letterSpacing: '-0.015em' }} xs={12}>
              <ShowValue value={remainingTimeToSpend} /> / <ShowValue value={spendPeriod?.toString()} width='20px' /> {t('days')}
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
        {
          referendaToList?.map((referendum, index) => {
            if (referendum.post_id < referendumCount) {
              return (
                <Grid item key={index} sx={{ borderRadius: '10px', bgcolor: 'background.paper', height: '137px', pt: '30px', pb: '20px', my: '13px', px: '20px' }}>
                  <Grid item sx={{ pb: '15px', fontSize: 20, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {`#${referendum.post_id}  ${referendum.title || t('No title yet')}`}
                  </Grid>
                  <Grid item container justifyContent='space-between' alignItems='center'>
                    <Grid item container alignItems='center' xs={10}>
                      <Grid item sx={{ fontSize: '16px', fontWeight: 400, mr: '17px' }}>
                        {t('By')}:
                      </Grid>
                      <Grid item>
                        <Identity
                          api={api}
                          chain={chain}
                          formatted={referendum.proposer}
                          identiconSize={25}
                          showSocial={false}
                          style={{
                            height: '38px',
                            maxWidth: '100%',
                            minWidth: '35%',
                            width: 'fit-content',
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '47px'
                          }}
                        />
                      </Grid>
                      <Divider orientation='vertical' flexItem sx={{ mx: '2%' }} />
                      <Grid item sx={{ bgcolor: 'background.default', border: `1px solid ${theme.palette.primary.main}`, borderRadius: '30px', fontSize: '16px', fontWeight: 400, p: '6.5px 14.5px' }}>
                        {referendum.origin}
                      </Grid>
                      <Divider orientation='vertical' flexItem sx={{ mx: '2%' }} />
                      <ClockIcon sx={{ fontSize: 28, ml: '10px' }} />
                      <Grid item sx={{ fontSize: '16px', fontWeight: 400, pl: '1%' }}>
                        {new Date(referendum.created_at).toDateString()}
                      </Grid>
                    </Grid>
                    <Grid item xs={1} sx={{ textAlign: 'center', mb: '10px', color: 'white', fontSize: '16px', fontWeight: 400, border: '1px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[referendum.status], p: '11.5px 17.5px' }}>
                      {referendum.status}
                    </Grid>
                  </Grid>
                </Grid>
              );
            }
          })
        }
      </Container>
    </>
  );
}
