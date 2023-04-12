// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Groups as FellowshipIcon, HowToVote as ReferendaIcon, ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import { Breadcrumbs, Button, Container, Divider, Grid, imageListClasses, LinearProgress, Link, SxProps, Typography, useTheme } from '@mui/material';
import { CubeGrid, Wordpress } from 'better-react-spinkit';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { DeriveTreasuryProposals } from '@polkadot/api-derive/types';
import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';

import { ActionContext, FormatPrice, Identity, InputFilter, ShowBalance, ShowValue } from '../../components';
import { useApi, useChain, useChainName, useDecidingCount, useDecimal, usePrice, useToken, useTracks, useTranslation } from '../../hooks';
import { remainingTime } from '../../util/utils';
import { Header } from './Header';
import { getLatestReferendums, getReferendumStatistics, getTrackReferendums, Statistics } from './helpers';
import ReferendaMenu from './ReferendaMenu';
import { TrackStats } from './TrackStats';

const STATUS_COLOR = {
  Canceled: '#ff4f4f',
  ConfirmStarted: '#27ae60',
  Confirmed: '#2ecc71',
  Deciding: '#3498db',
  Executed: '#8e44ad',
  Rejected: '#f39c12',
  Submitted: '#bdc3c7',
  TimedOut: '#7f8c8d',
};

type TopMenu = 'Referenda' | 'Fellowship';
const EMPTY_U8A_32 = new Uint8Array(32);

export const MAX_WIDTH = '1280px';

export default function Governance(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address);
  const chain = useChain(address);
  const tracks = useTracks(address, api);
  const price = usePrice(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const chainName = useChainName(address);
  const pageTrackRef = useRef({ page: 1, trackId: undefined, listFinished: false });

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
  const [referendumStats, setReferendumStats] = useState<Statistics | undefined>();
  const [approved, setApproved] = useState<BN | undefined>();
  const [referendaToList, setReferenda] = useState<string[] | null>();
  const [getMore, setGetMore] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const currentTrack = useMemo(() => tracks && tracks.find((t) => t[1].name === selectedSubMenu.toLowerCase().replace(' ', '_')), [selectedSubMenu, tracks]);

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

  useEffect(() => {
    if (!api || !api.derive.treasury) {
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
    // reset all if chainchanged
    setRemainingSpendPeriod(undefined);
    setSpendPeriod(undefined);
    setRemainingTimeToSpend(undefined);
    setRemainingSpendPeriodPercent(undefined);
    setAvailableTreasuryBalance(undefined);
    setNextBurn(undefined);
    setPendingBounties(undefined);
    setPendingProposals(undefined);
    setApproved(undefined);
    setSpendable(undefined);
    setSpendablePercent(undefined);

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

  // useEffect(() => {
  //   console.log('*******************************************************');
  //   chainName && getReferendumVotes(chainName, 124);
  // }, [chainName]);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!api.consts.referenda || !api.query.referenda) {
      console.log('OpenGov is not supported on this chain');

      return;
    }

    console.log('Maximum size of the referendum queue for a single track:', api.consts.referenda.maxQueued.toString());
    console.log('minimum amount to be used as a deposit :', api.consts.referenda.submissionDeposit.toString());
    console.log('blocks after submission that a referendum must begin decided by.', api.consts.referenda.undecidingTimeout.toString());

    api.query.referenda.referendumCount().then((count) => {
      console.log('total referendum count:', count.toNumber());
      setReferendumCount(count?.toNumber());

      const latestReferendumNumber = count.toNumber() - 2;

      api.query.referenda.referendumInfoFor(latestReferendumNumber).then((res) => {
        console.log(`referendumInfoFor referendum ${latestReferendumNumber} :, ${res}`);
      });
    }).catch(console.error);

    // const trackId_mediumSpender = 33;
    // api.query.referenda.trackQueue(trackId_mediumSpender).then((res) => {
    //   console.log('trackQueue for trackId_mediumSpender:', res.toString());
    // }).catch(console.error);
  }, [api]);

  useEffect(() => {
    if (chainName && selectedSubMenu === 'All') {
      setReferenda(undefined);
      // eslint-disable-next-line no-void
      void getLatestReferendums(chainName).then((res) => setReferenda(res));
    }
  }, [chainName, selectedSubMenu]);

  useEffect(() => {
    chainName && getReferendumStatistics(chainName).then((stat) => {
      setReferendumStats(stat);
    });
  }, [chainName]);

  useEffect(() => {
    if (chainName && selectedSubMenu && selectedSubMenu !== 'All' && tracks?.length) {
      const trackId = tracks.find((t) => t[1].name === selectedSubMenu.toLowerCase().replace(' ', '_'))?.[0] as number;
      let list = referendaToList;

      if (pageTrackRef.current.trackId !== trackId) {
        setReferenda(undefined);
        list = [];
        pageTrackRef.current.trackId = trackId; // Update the ref with new values
        pageTrackRef.current.page = 1;
        pageTrackRef.current.listFinished = false;
      }

      if (pageTrackRef.current.page > 1) {
        setIsLoading(true);
      }

      trackId !== undefined && getTrackReferendums(chainName, pageTrackRef.current.page, trackId).then((res) => {
        setIsLoading(false);

        if (res === null) {
          if (pageTrackRef.current.page === 1) { // there is no referendum for this track
            setReferenda(null);

            return;
          }
          pageTrackRef.current.listFinished = true;

          return;
        }

        const concated = (list || []).concat(res);

        setReferenda([...concated]);
      }).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName, getMore, selectedSubMenu, tracks]);

  const onTopMenuMenuClick = useCallback((item: TopMenu) => {
    setSelectedTopMenu(item);
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

  const backToTopMenu = useCallback((event) => {
    setSelectedSubMenu('All');
  }, []);

  const onAccountChange = useCallback((address: string) =>
    onAction(`/governance/${address}`)
    , [onAction]);

  const getMoreReferenda = useCallback(() => {
    pageTrackRef.current = { ...pageTrackRef.current, page: pageTrackRef.current.page + 1 };
    setGetMore(pageTrackRef.current.page);
  }, [pageTrackRef]);

  const Toolbar = () => (
    <Grid container id='menu' sx={{ bgcolor: 'primary.main', height: '51.5px', color: 'text.secondary', fontSize: '20px', fontWeight: 500 }}>
      <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
        <Grid container alignItems='center' justifyContent='space-between'>
          <Grid alignItems='flex-end' container item justifyContent='flex-start' md={4}>
            <TopMenu item={'Referenda'} />
            <TopMenu item={'Fellowship'} />
          </Grid>
          <Grid container item justifyContent='flex-end' md={5}>
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
                width: '190px',
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
                width: '190px',
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
      </Container>
    </Grid>
  );

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

  const TreasuryBalanceStat = ({ balance, noDivider, style, title, tokenPrice }: { title: string, balance: BN | undefined, tokenPrice: number | undefined, noDivider?: boolean, style?: SxProps }) => (
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
  );

  const AllReferendaStats = () => (
    <Grid alignItems='start' container justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '10px', height: '165px', pt: '15px', pb: '20px' }}>
      <Grid container item sx={{ ml: '3%' }} xs={2.5}>
        <Grid item sx={{ borderBottom: '2px solid gray', mb: '10px' }} xs={12}>
          <Typography fontSize={20} fontWeight={500}>
            {t('Referenda stats')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container height='26px' item justifyContent='space-between' md={12} my='2px'>
          <Grid item sx={{ height: '25px' }}>
            <Typography fontSize={18} fontWeight={400}>
              {t('Confirming')}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
            <ShowValue value={referendumStats?.confirm_total} />              </Grid>
        </Grid>
        <Grid alignItems='center' container height='26px' item justifyContent='space-between' md={12} my='2px'>
          <Grid item sx={{ height: '25px' }}>
            <Typography fontSize={18} fontWeight={400}>
              {t('Deciding')}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
            <ShowValue value={referendumStats?.voting_total} />
          </Grid>
        </Grid>
        <Grid alignItems='center' container height='26px' item justifyContent='space-between' md={12} my='2px'>
          <Grid item sx={{ height: '25px' }}>
            <Typography fontSize={18} fontWeight={400}>
              {t('Participation')}
            </Typography>
          </Grid>
          <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
            <ShowBalance api={api} balance={referendumStats?.referendum_participate} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
        </Grid>
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
          balance={availableTreasuryBalance}
          title={t('Available')}
          tokenPrice={price?.amount}
        />
        <TreasuryBalanceStat
          balance={approved}
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
            <ShowValue value={remainingTimeToSpend} width='131px' /> / <ShowValue value={spendPeriod?.toString()} width='20px' /> {t('days')}
          </Grid>
          <Grid alignItems='center' container item spacing={1} sx={{ fontSize: '18px', letterSpacing: '-0.015em' }}>
            <Grid item >
              <LinearProgress sx={{ bgcolor: 'primary.contrastText', mt: '5px', width: '185px' }} value={remainingSpendPeriodPercent || 0} variant='determinate' />
            </Grid>
            <Grid fontSize={18} fontWeight={400} item sx={{ textAlign: 'right' }}>
              {remainingSpendPeriodPercent}%
            </Grid>
          </Grid>
        </Grid>
        <Divider flexItem orientation='vertical' sx={{ mx: '3%' }} />
        <TreasuryBalanceStat
          balance={nextBurn}
          noDivider
          title={t('Next Burn')}
          tokenPrice={price?.amount}
        />
      </Grid>
    </Grid>
  );

  const SearchBar = () => (
    <Grid alignItems='center' container pt='15px'>
      <Grid item justifyContent='flex-start' xs>
        <InputFilter
          autoFocus={false}
          // onChange={onSearch}
          placeholder={t<string>('🔍 Search ')}
          theme={theme}
        // value={searchKeyword ?? ''}
        />
      </Grid>
      <Grid alignItems='center' container fontSize='16px' fontWeight={400} item py='10px' sx={{ cursor: 'pointer' }} xs={1} justifyContent='flex-start'
        // onClick={onFilters}
        pl='15px'>
        {t('Filters')}
        <Grid alignItems='center' container item justifyContent='center' pl='10px' sx={{ cursor: 'pointer', width: '40%' }}>
          <vaadin-icon icon='vaadin:ellipsis-dots-v' style={{ color: `${theme.palette.secondary.light}`, width: '33px' }} />
        </Grid>
      </Grid>
    </Grid>
  );

  const Bread = () => (
    <Grid container sx={{ py: '10px' }}>
      <Breadcrumbs aria-label='breadcrumb' color='text.primary'>
        <Link onClick={backToTopMenu} sx={{ cursor: 'pointer', fontWeight: 500 }} underline='hover'>
          {selectedTopMenu || 'Referenda'}
        </Link>
        <Typography color='text.primary' sx={{ fontWeight: 500 }}>
          {selectedSubMenu || 'All'}
        </Typography>
      </Breadcrumbs>
    </Grid>
  );

  const HorizontalWaiting = ({ color }: { color: string }) => (
    <div>
      <Wordpress color={color} timingFunction='linear' />
      <Wordpress color={color} timingFunction='ease' />
      <Wordpress color={color} timingFunction='ease-in' />
      <Wordpress color={color} timingFunction='ease-out' />
      <Wordpress color={color} timingFunction='ease-in-out' />
    </div>
  );

  return (
    <>
      <Header address={address} onAccountChange={onAccountChange} />
      <Toolbar />
      {menuOpen && selectedTopMenu === 'Referenda' &&
        <ReferendaMenu decidingCounts={decidingCounts} setMenuOpen={setMenuOpen} setSelectedSubMenu={setSelectedSubMenu} />
      }
      <Container disableGutters sx={{ maxWidth: 'inherit' }}>
        <Bread />
        <Container disableGutters sx={{ maxHeight: parent.innerHeight - 170, maxWidth: 'inherit', opacity: menuOpen ? 0.3 : 1, overflowY: 'scroll', position: 'fixed', top: 160 }}>
          {selectedSubMenu === 'All'
            ? <AllReferendaStats />
            : <TrackStats address={address} track={currentTrack} decidingCounts={decidingCounts} selectedSubMenu={selectedSubMenu} />
          }
          <SearchBar />
          {referendaToList
            ? <>
              {referendaToList.map((referendum, index) => {
                if (referendum?.post_id < (referendumCount || referendumStats?.OriginsCount)) {
                  return (
                    <Grid item key={index} sx={{ bgcolor: 'background.paper', borderRadius: '10px', cursor: 'pointer', height: '109px', p: '20px', my: '13px', '&:hover': { boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)' } }}>
                      <Grid item sx={{ fontSize: 20, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {`#${referendum.post_id}  ${referendum.title || t('No title yet')}`}
                      </Grid>
                      <Grid alignItems='center' container item justifyContent='space-between'>
                        <Grid alignItems='center' container item xs={9.5}>
                          <Grid item sx={{ fontSize: '16px', fontWeight: 400, mr: '17px' }}>
                            {t('By')}:
                          </Grid>
                          <Grid item sx={{ mb: '10px' }}>
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
                          <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                          {referendum.origin &&
                            <>
                              <Grid item sx={{ bgcolor: 'background.default', border: `1px solid ${theme.palette.primary.main}`, borderRadius: '30px', fontSize: '16px', fontWeight: 400, p: '0.5px 14.5px' }}>
                                {referendum.origin.replace(/([A-Z])/g, ' $1').trim()}
                              </Grid>
                              <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                            </>
                          }
                          <Grid item sx={{ fontSize: '16px', fontWeight: 400, opacity: 0.6 }}>
                            {referendum.method}
                          </Grid>
                          <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                          <ClockIcon sx={{ fontSize: 27, ml: '10px' }} />
                          <Grid item sx={{ fontSize: '16px', fontWeight: 400, pl: '1%' }}>
                            {new Date(referendum.created_at).toDateString()}
                          </Grid>
                        </Grid>
                        <Grid item sx={{ textAlign: 'center', mb: '10px', color: 'white', fontSize: '16px', fontWeight: 400, border: '1px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[referendum.status], p: '10px 15px' }} xs={1.5}>
                          {referendum.status.replace(/([A-Z])/g, ' $1').trim()}
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                }
              })}
              {selectedSubMenu !== 'All' && !pageTrackRef.current.listFinished &&
                <>
                  {
                    !isLoading
                      ? <Grid container item justifyContent='center' sx={{ pb: '15px', '&:hover': { cursor: 'pointer' } }}>
                        <Typography color='secondary.contrastText' fontSize='18px' fontWeight={600} onClick={getMoreReferenda}>
                          {t('Click to view more')}
                        </Typography>
                      </Grid>
                      : isLoading && <Grid container justifyContent='center'>
                        <HorizontalWaiting color={theme.palette.primary.main} />
                      </Grid>
                  }
                </>
              }
            </>
            : referendaToList === null
              ? <Grid container justifyContent='center' pt='10%'>
                <Typography fontSize={20} color={'text.disabled'} fontWeight={500}>
                  {t('No referenda in this track to display')}
                </Typography>
              </Grid>
              : <Grid container justifyContent='center' pt='10%'>
                <CubeGrid col={3} color={theme.palette.background.paper} row={3} size={200} />
              </Grid>
          }

        </Container>
      </Container>
    </>
  );
}
