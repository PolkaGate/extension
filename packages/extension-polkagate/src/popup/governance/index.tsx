// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { useApi, useChainName, useDecidingCount, useFullscreen, useTracks, useTranslation } from '../../hooks';
import HorizontalWaiting from './components/HorizontalWaiting';
import { LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST, REFERENDA_STATUS } from './utils/consts';
import { getLatestReferendums, getReferendumsListSb, getTrackOrFellowshipReferendumsPA, Statistics } from './utils/helpers';
import { LatestReferenda, TopMenu } from './utils/types';
import { AllReferendaStats } from './AllReferendaStats';
import Bread from './Bread';
import { Header } from './Header';
import { ReferendumSummary } from './ReferendumSummary';
import SearchBox from './SearchBox';
import Toolbar from './Toolbar';
import { TrackStats } from './TrackStats';

export default function Governance(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const { state } = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const { address, topMenu } = useParams<{ address: string, topMenu: 'referenda' | 'fellowship' }>();
  const api = useApi(address);
  const chainName = useChainName(address);
  const decidingCounts = useDecidingCount(address);

  const { fellowshipTracks, tracks } = useTracks(address);

  const pageTrackRef = useRef({ listFinished: false, page: 1, topMenu, trackId: -1 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>(state?.selectedSubMenu || 'All');
  const [referendumCount, setReferendumCount] = useState<number | undefined>();
  const [referendumStats, setReferendumStats] = useState<Statistics | undefined>();
  const [referendaToList, setReferenda] = useState<LatestReferenda[] | null>();
  const [filteredReferenda, setFilteredReferenda] = useState<LatestReferenda[] | null>();
  const [getMore, setGetMore] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [filterState, setFilterState] = useState(0);

  const referendaTrackId = tracks?.find((t) => String(t[1].name) === selectedSubMenu.toLowerCase().replace(' ', '_'))?.[0]?.toNumber();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentTrack = useMemo(() => {
    if (!tracks || !fellowshipTracks) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return tracks.concat(fellowshipTracks).find((t) =>
      String(t[1].name) === selectedSubMenu.toLowerCase().replace(' ', '_') ||
      String(t[1].name) === selectedSubMenu.toLowerCase() // fellowship tracks have no underscore!
    );
  }, [fellowshipTracks, selectedSubMenu, tracks]);

  useEffect(() => {
    if (referendaToList === undefined) {
      return;
    }

    if (referendaToList === null) {
      setFilteredReferenda(null);

      return;
    }

    const list = filterState ? referendaToList?.filter((ref) => REFERENDA_STATUS[filterState].includes(ref.status)) : referendaToList;

    setFilteredReferenda(list);
  }, [filterState, referendaToList]);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!api.consts.referenda || !api.query.referenda) {
      console.log('OpenGov is not supported on this chain');

      return;
    }

    api.query.referenda.referendumCount().then((count) => {
      console.log('total referendum count:', count.toNumber());
      setReferendumCount(count?.toNumber());
    }).catch(console.error);
  }, [api]);

  const getReferendaById = useCallback((postId: number, type: 'ReferendumV2' | 'FellowshipReferendum') => {
    history.push({
      pathname: `/governance/${address}/${type === 'ReferendumV2' ? 'referenda' : 'fellowship'}/${postId}`,
      state: { selectedSubMenu }
    });
  }, [address, history, selectedSubMenu]);

  useEffect(() => {
    chainName && selectedSubMenu && fetchRef().catch(console.error);

    async function fetchRef() {
      let list = referendaToList;

      // to reset referenda list on menu change
      if (pageTrackRef.current.trackId !== referendaTrackId || pageTrackRef.current.topMenu !== topMenu) {
        setReferenda(undefined);
        list = [];
        pageTrackRef.current.trackId = referendaTrackId as number; // Update the ref with new values
        pageTrackRef.current.page = 1;
        pageTrackRef.current.listFinished = false;
      }

      if (pageTrackRef.current.page > 1) {
        setIsLoading(true);
      }

      pageTrackRef.current.topMenu = topMenu;

      if (topMenu === 'referenda' && selectedSubMenu === 'All') {
        const allReferenda = await getLatestReferendums(chainName, pageTrackRef.current.page * LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST)

        setIsLoading(false);

        if (allReferenda === null) {
          if (pageTrackRef.current.page === 1) { // there is no referendum !!
            setReferenda(null);

            return;
          }

          pageTrackRef.current.listFinished = true;

          return;
        }

        setReferenda(allReferenda);

        return;
      }

      let resPA = await getTrackOrFellowshipReferendumsPA(chainName, pageTrackRef.current.page, referendaTrackId);

      setIsLoading(false);

      if (resPA === null) {
        if (pageTrackRef.current.page === 1) { // there is no referendum for this track
          setReferenda(null);

          return;
        }

        pageTrackRef.current.listFinished = true;

        return;
      }

      if (topMenu === 'fellowship') {
        const resSb = await getReferendumsListSb(chainName, topMenu, pageTrackRef.current.page * LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST);

        if (resSb) {
          const fellowshipTrackId = fellowshipTracks?.find((t) => String(t[1].name) === selectedSubMenu.toLowerCase())?.[0]?.toNumber();

          pageTrackRef.current.trackId = fellowshipTrackId as number;
          resPA = resPA.map((r) => {
            const found = resSb.list.find((f) => f.referendum_index === r.post_id);

            if (found) {
              r.fellowship_origins = found.origins;
              r.fellowship_origins_id = found.origins_id;
            }

            return r;
          }).filter((r) => selectedSubMenu === 'All' || r.fellowship_origins_id === fellowshipTrackId);
        }
      }

      const concatenated = (list || []).concat(resPA);

      setReferenda([...concatenated]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName, getMore, selectedSubMenu, tracks]);

  const getMoreReferenda = useCallback(() => {
    pageTrackRef.current = { ...pageTrackRef.current, page: pageTrackRef.current.page + 1 };
    setGetMore(pageTrackRef.current.page);
  }, [pageTrackRef]);

  return (
    <>
      <Header />
      <Toolbar
        decidingCounts={decidingCounts}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        setSelectedSubMenu={setSelectedSubMenu}
      />
      <Container disableGutters sx={{ maxWidth: 'inherit' }}>
        <Bread
          address={address}
          setSelectedSubMenu={setSelectedSubMenu}
          subMenu={selectedSubMenu}
          topMenu={topMenu}
        />
        <Container disableGutters sx={{ maxHeight: parent.innerHeight - 170, maxWidth: 'inherit', opacity: menuOpen ? 0.3 : 1, overflowY: 'scroll', position: 'fixed', top: 160 }}>
          {selectedSubMenu === 'All'
            ? <AllReferendaStats address={address} referendumStats={referendumStats} setReferendumStats={setReferendumStats} />
            : <TrackStats
              address={address}
              decidingCounts={decidingCounts}
              selectedSubMenu={selectedSubMenu}
              topMenu={topMenu}
              track={currentTrack}
            />
          }
          <SearchBox
            address={address}
            api={api}
            filterState={filterState}
            referendaToList={referendaToList}
            setFilterState={setFilterState}
            setFilteredReferenda={setFilteredReferenda}
            tracks={tracks}
          />
          {filteredReferenda
            ? <>
              {filteredReferenda.map((referendum, index) => {
                if (referendum?.post_id < (referendumCount || referendumStats?.OriginsCount)) {
                  return (
                    <ReferendumSummary
                      address={address}
                      key={index}
                      onClick={() => getReferendaById(referendum.post_id, referendum.type)}
                      referendum={referendum}
                    />
                  );
                }
              })}
              {!pageTrackRef.current.listFinished &&
                <>
                  {
                    !isLoading
                      ? <Grid container item justifyContent='center' sx={{ pb: '15px', '&:hover': { cursor: 'pointer' } }}>
                        <Typography color='secondary.contrastText' fontSize='18px' fontWeight={600} onClick={getMoreReferenda}>
                          {t('{{count}} referenda loaded. Click here to load more', { replace: { count: LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST * pageTrackRef.current.page } })}
                        </Typography>
                      </Grid>
                      : isLoading && <Grid container justifyContent='center'>
                        <HorizontalWaiting color={theme.palette.primary.main} />
                      </Grid>
                  }
                </>
              }
            </>
            : filteredReferenda === null
              ? <Grid container justifyContent='center' pt='10%'>
                <Typography color={'text.disabled'} fontSize={20} fontWeight={500}>
                  {t('No referenda in this track to display')}
                </Typography>
              </Grid>
              : <Grid container justifyContent='center' pt='10%'>
                <CubeGrid col={3} color={theme.palette.secondary.main} row={3} size={200} style={{ opacity: '0.4' }} />
              </Grid>
          }
        </Container>
      </Container>
    </>
  );
}
