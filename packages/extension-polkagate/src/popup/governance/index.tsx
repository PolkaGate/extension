// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Groups as FellowshipIcon, HowToVote as ReferendaIcon } from '@mui/icons-material/';
import { Breadcrumbs, Button, Container, Grid, Link, Typography, useTheme } from '@mui/material';
import { CubeGrid, Wordpress } from 'better-react-spinkit';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory,useLocation } from 'react-router-dom';

import { ActionContext, InputFilter } from '../../components';
import { useApi, useChainName, useDecidingCount, useTracks, useTranslation } from '../../hooks';
import { getLatestReferendums, getTrackReferendums, LatestReferenda, Statistics } from './utils/helpers';
import { TopMenu } from './utils/types';
import { AllReferendaStats } from './AllReferendaStats';
import { Header } from './Header';
import ReferendaMenu from './ReferendaMenu';
import { ReferendumSummary } from './ReferendumSummary';
import { TrackStats } from './TrackStats';
import { MAX_WIDTH } from './utils/consts';

export default function Governance(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { state } = useLocation();
  const history = useHistory();

  const theme = useTheme();
  const { address, postId } = useParams<{ address: string, postId?: number }>();

  const api = useApi(address);
  const tracks = useTracks(address);
  const chainName = useChainName(address);
  const pageTrackRef = useRef({ page: 1, trackId: undefined, listFinished: false });
  const decidingCounts = useDecidingCount(address);
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>(state?.selectedSubMenu || 'All');
  const [referendumCount, setReferendumCount] = useState<number | undefined>();
  const [referendumStats, setReferendumStats] = useState<Statistics | undefined>();
  const [referendaToList, setReferenda] = useState<LatestReferenda[] | null>();
  const [getMore, setGetMore] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const currentTrack = useMemo(() => tracks && tracks.find((t) => String(t[1].name) === selectedSubMenu.toLowerCase().replace(' ', '_')), [selectedSubMenu, tracks]);

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

  // useEffect(() => {
  //   if (!api || !api.derive.treasury) {
  //     return;
  //   }

  //   let cancel = false;

  // clear proposals state
  // setProposals(undefined);

  // fetch proposals
  // api.derive.treasury.proposals()?.then((p) => {
  //   if (!cancel) {
  //     setProposals(p);
  //     setActiveProposalCount(p?.proposals.length + p?.approvals.length);
  //     // console.log('proposals:', JSON.stringify(p?.proposals));
  //   }
  // }).catch(console.error);

  //   return () => {
  //     cancel = true;
  //   };
  // }, [api]);

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
    }).catch(console.error);

    api.query.referenda.referendumInfoFor(124).then((res) => {
      console.log('referendumInfoFor 124:', res.toString());
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

  const getReferendaById = useCallback((postId: number) => {
    history.push({
      pathname: `/governance/${address}/${postId}`,
      state: { selectedSubMenu }
    });
  }, [address, history, selectedSubMenu]);

  useEffect(() => {
    if (chainName && selectedSubMenu && selectedSubMenu !== 'All' && tracks?.length) {
      const trackId = tracks.find((t) => String(t[1].name) === selectedSubMenu.toLowerCase().replace(' ', '_'))?.[0] as number;
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
            <TopMenuComponent item={'Referenda'} />
            <TopMenuComponent item={'Fellowship'} />
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

  function TopMenuComponent({ item }: { item: TopMenu }): React.ReactElement<{ item: TopMenu }> {
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
            ? <AllReferendaStats address={address} referendumStats={referendumStats} setReferendumStats={setReferendumStats} />
            : <TrackStats address={address} decidingCounts={decidingCounts} selectedSubMenu={selectedSubMenu} track={currentTrack} />
          }
          <SearchBar />
          {referendaToList
            ? <>
              {referendaToList.map((referendum, index) => {
                if (referendum?.post_id < (referendumCount || referendumStats?.OriginsCount)) {
                  return (
                    <ReferendumSummary address={address} key={index} referendum={referendum} onClick={() => getReferendaById(referendum.post_id)} />
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
