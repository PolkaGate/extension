// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { ReferendaContext, Warning } from '../../components';
import { useApi, useChain, useChainName, useDecidingCount, useFullscreen, useTracks, useTranslation } from '../../hooks';
import { GOVERNANCE_CHAINS } from '../../util/constants';
import HorizontalWaiting from './components/HorizontalWaiting';
import { getAllVotes } from './post/myVote/util';
import { LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST } from './utils/consts';
import { getLatestReferendums, getReferendumsListSb, getTrackOrFellowshipReferendumsPA } from './utils/helpers';
import { LatestReferenda } from './utils/types';
import { AllReferendaStats } from './AllReferendaStats';
import Bread from './Bread';
import FellowshipsList from './FellowshipsList';
import { FullScreenHeader } from './FullScreenHeader';
import ReferendumSummary from './ReferendumSummary';
import SearchBox from './SearchBox';
import Toolbar from './Toolbar';
import { TrackStats } from './TrackStats';

export type Fellowship = [string, number];

export default function Governance(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const { state } = useLocation();
  const theme = useTheme();
  const { address, topMenu } = useParams<{ address: string, topMenu: 'referenda' | 'fellowship' }>();
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const decidingCounts = useDecidingCount(address);
  const chainChangeRef = useRef('');
  const refsContext = useContext(ReferendaContext);

  const { fellowshipTracks, tracks } = useTracks(address);

  const pageTrackRef = useRef({ listFinished: false, page: 1, subMenu: 'All', topMenu });
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>(state?.selectedSubMenu as string || 'All');
  const [referendumCount, setReferendumCount] = useState<{ referenda: number | undefined, fellowship: number | undefined }>({ fellowship: undefined, referenda: undefined });
  const [referenda, setReferenda] = useState<LatestReferenda[] | null>();
  const [filteredReferenda, setFilteredReferenda] = useState<LatestReferenda[] | null>();
  const [getMore, setGetMore] = useState<number | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>();
  const [myVotedReferendaIndexes, setMyVotedReferendaIndexes] = useState<number[] | null>();
  const [fellowships, setFellowships] = useState<Fellowship[] | null>();
  const [notSupportedChain, setNotSupportedChain] = useState<boolean>();
  const [manifest, setManifest] = useState<chrome.runtime.Manifest>();
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const notSupported = useMemo(() => chain?.genesisHash && !(GOVERNANCE_CHAINS.includes(chain.genesisHash ?? '')), [chain?.genesisHash]);

  const fetchJson = () => {
    fetch('./manifest.json')
      .then((response) => {
        return response.json();
      }).then((data: chrome.runtime.Manifest) => {
        setManifest(data);
      }).catch((e: Error) => {
        console.log(e.message);
      });
  };

  useEffect(() => {
    fetchJson();
  }, []);

  const referendaTrackId = tracks?.find((t) => String(t[1].name) === selectedSubMenu.toLowerCase().replace(' ', '_'))?.[0]?.toNumber() as number;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentTrack = useMemo(() => {
    if (!tracks && !fellowshipTracks) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (tracks || []).concat(fellowshipTracks || []).find((t) =>
      String(t[1].name) === selectedSubMenu.toLowerCase().replace(' ', '_') ||
      String(t[1].name) === selectedSubMenu.toLowerCase() // fellowship tracks have no underscore!
    );
  }, [fellowshipTracks, selectedSubMenu, tracks]);

  const isSubMenuChanged = pageTrackRef.current.subMenu !== selectedSubMenu;
  const isTopMenuChanged = pageTrackRef.current.topMenu !== topMenu;

  useEffect(() => {
    if (!chainName) {
      return;
    }

    if (!chainChangeRef.current) {
      chainChangeRef.current = chainName;
    } else if (chainChangeRef.current !== chainName) { // if chain is changed
      chainChangeRef.current = chainName;
      setReferenda(undefined);
      setFilteredReferenda(undefined);
    }
  }, [address, chainName]);

  useEffect(() => {
    if (String(api?.genesisHash) !== chain?.genesisHash) {
      setMyVotedReferendaIndexes(undefined);
    }

    if (!api || !address || !tracks) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getAllVotes(address, api, tracks).then(setMyVotedReferendaIndexes);
  }, [address, api, chain?.genesisHash, tracks]);

  useEffect(() => {
    // since the on chain referendaCount may have delay, we set the count for all case with the latest Id +1
    referenda?.length && selectedSubMenu === 'All' && setReferendumCount({ fellowship: referenda[0].post_id + 1, referenda: referenda[0].post_id + 1 });
  }, [referenda, selectedSubMenu]);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!api.consts.referenda || !api.query.referenda) {
      console.log('OpenGov is not supported on this chain');
      setNotSupportedChain(true);
      // to reset refs on non supported chain, or when chain has changed
      pageTrackRef.current.page = 1;
      pageTrackRef.current.listFinished = false;

      return;
    }

    setNotSupportedChain(false);

    api.query.referenda.referendumCount().then((count) => {
      referendumCount.referenda = count?.toNumber();
      setReferendumCount({ ...referendumCount });
    }).catch(console.error);

    api.query.fellowshipReferenda && api.query.fellowshipReferenda.referendumCount().then((count) => {
      referendumCount.fellowship = count?.toNumber();
      setReferendumCount({ ...referendumCount });
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, chainName]);

  const addFellowshipOriginsFromSb = useCallback(async (resPA: LatestReferenda[]): Promise<LatestReferenda[] | undefined> => {
    const resSb = await getReferendumsListSb(chainName, topMenu, pageTrackRef.current.page * LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST);

    if (resSb) {
      const fellowshipTrackId = fellowshipTracks?.find((t) => String(t[1].name) === selectedSubMenu.toLowerCase())?.[0]?.toNumber();

      pageTrackRef.current.subMenu = selectedSubMenu;

      return resPA.map((r) => {
        const found = resSb.list.find((f) => f.referendum_index === r.post_id);

        if (found) {
          r.fellowship_origins = found.origins;
          r.fellowship_origins_id = found.origins_id;
        }

        return r;
      }).filter((r) => selectedSubMenu === 'All' || r.fellowship_origins_id === fellowshipTrackId);
    }

    return undefined;
  }, [chainName, fellowshipTracks, selectedSubMenu, topMenu]);

  const handleSettingReferenda = useCallback((key: string, referenda: LatestReferenda[]) => {
    let maybeNewRefs;
    let updatedContext;

    if (refsContext.refs[key]) {
      // eslint-disable-next-line camelcase
      maybeNewRefs = referenda.filter(({ post_id }) => !refsContext.refs[key].find((item) => item.post_id === post_id));
      updatedContext = refsContext.refs[key].map((contextItem) => {
        const found = referenda.find((item) => item.post_id === contextItem.post_id);

        return found || contextItem;
      });
    }

    const maybeMerged = updatedContext ? updatedContext.concat(maybeNewRefs || []) : referenda;

    refsContext.setRefs({
      ...refsContext.refs,
      [key]: maybeMerged
    });
    setReferenda([...maybeMerged]);
  }, [refsContext]);

  const _key = useMemo(() => chainName && topMenu && `${chainName}${topMenu}${selectedSubMenu.replace(/\s/g, '')}`, [chainName, selectedSubMenu, topMenu]);

  useEffect(() => {
    if (!chainName || !selectedSubMenu || isFetching || !_key) {
      return;
    }

    fetchRef(_key).then(() => setIsFetching(false)).catch(console.error);
    setReferenda(refsContext.refs?.[_key]);

    async function fetchRef(key: string) {
      if (!chainName) {
        return;
      }

      let list = referenda;

      setIsFetching(true);

      // Reset referenda list on menu change
      if (isSubMenuChanged || isTopMenuChanged) {
        // setReferenda(undefined);
        // setFilteredReferenda(undefined);
        list = [];
        pageTrackRef.current.subMenu = selectedSubMenu; // Update the ref with new values
        pageTrackRef.current.page = 1;
        pageTrackRef.current.listFinished = false;
      }

      if (pageTrackRef.current.page > 1) {
        setIsLoadingMore(true);
      }

      pageTrackRef.current.topMenu = topMenu;

      if (topMenu === 'referenda' && selectedSubMenu === 'All') {
        const allReferenda = await getLatestReferendums(chainName, pageTrackRef.current.page * LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST);

        setIsLoadingMore(false);

        if (allReferenda === null) {
          if (pageTrackRef.current.page === 1) { // there is no referendum or PA is down ... ⚠️ !!
            setReferenda(null);

            return;
          }

          pageTrackRef.current.listFinished = true;

          return;
        }

        // filter discussions if any
        const onlyReferenda = allReferenda.filter((r) => r.type !== 'Discussions');

        handleSettingReferenda(key, onlyReferenda);

        return;
      }

      if (referendaTrackId === undefined && topMenu === 'referenda') {
        return;
      }

      let resPA = await getTrackOrFellowshipReferendumsPA(chainName, pageTrackRef.current.page, referendaTrackId);

      setIsLoadingMore(false);

      if (resPA === null) {
        if (pageTrackRef.current.page === 1) { // there is no referendum for this track
          setReferenda(null);

          return;
        }

        pageTrackRef.current.listFinished = true;

        return;
      }

      if (topMenu === 'fellowship' && !['Whitelisted Caller', 'Fellowship Admin'].includes(selectedSubMenu)) {
        resPA = await addFellowshipOriginsFromSb(resPA) || resPA;
      }

      const concatenated = (list || []).concat(resPA);

      handleSettingReferenda(key, concatenated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addFellowshipOriginsFromSb, chainName, fellowshipTracks, _key, getMore, isSubMenuChanged, isTopMenuChanged, referendaTrackId, selectedSubMenu, topMenu, tracks]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.fellowshipCollective && api.query.fellowshipCollective.members.entries().then((keys) => {
      const fellowships = keys.map(([{ args: [id] }, option]) => {
        return [id.toString(), option?.value?.rank?.toNumber()] as Fellowship;
      });

      fellowships.sort((a, b) => b[1] - a[1]);
      setFellowships(fellowships);
    }).catch(console.error);
  }, [api]);

  const getMoreReferenda = useCallback(() => {
    pageTrackRef.current = { ...pageTrackRef.current, page: pageTrackRef.current.page + 1 };
    setGetMore(pageTrackRef.current.page);
  }, [pageTrackRef]);

  return (
    <>
      <FullScreenHeader page='governance' />
      {notSupported
        ? <Grid container item sx={{ display: 'block', m: 'auto', maxWidth: '80%' }}>
          <Typography fontSize='30px' fontWeight={700} p='30px 0 60px 80px'>
            {t<string>('Governance')}
          </Typography>
          <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', width: '400px' }}>
            <Warning
              fontWeight={500}
              isBelowInput
              theme={theme}
            >
              {t<string>('The chosen blockchain does not support governance.')}
            </Warning>
          </Grid>
        </Grid>
        : <>
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
                ? <AllReferendaStats
                  address={address}
                  topMenu={topMenu}
                />
                : selectedSubMenu !== 'Fellowships' &&
                <TrackStats
                  address={address}
                  decidingCounts={decidingCounts}
                  selectedSubMenu={selectedSubMenu}
                  topMenu={topMenu}
                  track={currentTrack}
                />
              }
              {selectedSubMenu !== 'Fellowships' &&
                <SearchBox
                  address={address}
                  myVotedReferendaIndexes={myVotedReferendaIndexes}
                  referenda={referenda}
                  setFilteredReferenda={setFilteredReferenda}
                />
              }
              {selectedSubMenu === 'Fellowships'
                ? <FellowshipsList
                  address={address}
                  fellowships={fellowships}
                />
                : <>
                  {filteredReferenda
                    ? <>
                      {filteredReferenda.map((r, index) => (
                        <ReferendumSummary
                          key={index}
                          myVotedReferendaIndexes={myVotedReferendaIndexes}
                          refSummary={r}
                        />
                      )
                      )}
                      {!pageTrackRef.current.listFinished &&
                        <>
                          {
                            !isLoadingMore
                              ? <Grid container item justifyContent='center' sx={{ '&:hover': { cursor: 'pointer' }, pb: '15px' }}>
                                {notSupportedChain
                                  ? <Typography color='secondary.contrastText' fontSize='18px' fontWeight={600} onClick={getMoreReferenda} pt='50px'>
                                    {t('Open Governance is not supported on the {{chainName}}', { replace: { chainName } })}
                                  </Typography>
                                  : !!referenda?.length && referendumCount[topMenu] && referenda.length < (referendumCount[topMenu] || 0)
                                    ? <Typography color='secondary.contrastText' fontSize='18px' fontWeight={600} onClick={getMoreReferenda}>
                                      {t('Loaded {{count}} out of {{referendumCount}} referenda. Click here to load more', { replace: { count: referenda?.length || 0, referendumCount: referendumCount[topMenu] } })}
                                    </Typography>
                                    : <Typography color='text.disabled' fontSize='15px'>
                                      {t('No more referenda to load.')}
                                    </Typography>
                                }
                              </Grid>
                              : isLoadingMore &&
                              <Grid container justifyContent='center'>
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
                  <Grid color={'text.disabled'} container fontSize='13px' item justifyContent='center'>
                    {`${t('Version')} ${manifest?.version || ''}`}
                  </Grid>
                </>
              }
            </Container>
          </Container>
        </>}
    </>
  );
}
