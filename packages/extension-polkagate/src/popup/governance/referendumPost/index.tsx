// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import { Groups as FellowshipIcon, HowToVote as ReferendaIcon } from '@mui/icons-material/';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Breadcrumbs, Button, Container, Divider, Grid, Link, Typography, useTheme } from '@mui/material';
import { CubeGrid, Wordpress } from 'better-react-spinkit';
import { Chart, registerables } from 'chart.js';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';
import { BN, BN_BILLION, BN_ZERO, bnMax, bnMin } from '@polkadot/util';

import { ActionContext, Identity, InputFilter } from '../../../components';
import { useApi, useChain, useChainName, useDecidingCount, useTracks, useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { AllReferendaStats } from '../AllReferendaStats';
import { Header } from '../Header';
import { getLatestReferendums, getReferendum, getReferendumFromSubscan, getTrackReferendums, LatestReferenda, Statistics } from '../helpers';
import ReferendaMenu from '../ReferendaMenu';
import { ReferendumSummary } from '../ReferendumSummary';
import { TrackStats } from '../TrackStats';

type TopMenu = 'Referenda' | 'Fellowship';

export const MAX_WIDTH = '1280px';

interface Reply {
  content: string;
  created_at: Date,
  id: string,
  proposer: string,
  updated_at: Date,
  user_id: number,
  username: string
}

interface Reaction {
  '👍': {
    count: number,
    usernames: string[]
  },
  '👎': {
    count: number,
    usernames: []
  }
}

interface Comment {
  comment_reactions: Reaction,
  content: string,
  created_at: Date,
  id: string,
  proposer: string,
  replies: Reply[],
  sentiment: number,
  updated_at: Date,
  user_id: number,
  username: string
}

interface History {
  timestamp: Date,
  status: string,
  block: number
}

export interface Referendum {
  bond: any,
  comments: Comment[],
  content: string,
  created_at: Date,
  curator: any,
  curator_deposit: any,
  deciding: {
    confirming: any,
    since: number
  },
  decision_deposit_amount: string,
  delay: any,
  deposit: any,
  description: any,
  enactment_after_block: number,
  enactment_at_block: any,
  end: any,
  ended_at: Date,
  fee: any,
  hash: string,
  last_edited_at: Date,
  method: string,
  origin: string,
  payee: null,
  post_id: number,
  post_reactions: Reaction,
  proposal_arguments: any,
  proposed_call: {
    method: string,
    args: Record<string, any>,
    description: string
    section: string
  },
  proposer: string,
  requested: string,
  reward: any,
  status: string,
  statusHistory: History[],
  submission_deposit_amount: string,
  submitted_amount: string,
  tally: {
    ayes: string,
    bareAyes: string,
    nays: string,
    support: string
  },
  timeline: [
    {
      created_at: Date,
      hash: string,
      index: number,
      statuses: History[],
      type: string
    }
  ],
  topic: {
    id: number,
    name: string,
  },
  track_number: number,
  type: string,
  user_id: number,
  title: string,
  tags: any[],
  post_link: any,
  spam_users_count: number
}

export default function ReferendumPost(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { address, postId } = useParams<{ address: string, postId: number }>();
  const history = useHistory();
  const chain = useChain(address);
  const { state } = useLocation();
  const theme = useTheme();
  const chainName = useChainName(address);
  const chartRef = useRef(null);

  Chart.register(...registerables);

  const api = useApi(address);
  const tracks = useTracks(address, api);
  const decidingCounts = useDecidingCount(api, tracks);
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>();
  const [referendum, setReferendum] = useState<Referendum>();
  const [referendumInfoFromSubscan, setReferendumInfoFromSubscan] = useState<Referendum>();

  const ayesPercent = useMemo(() =>
    referendumInfoFromSubscan
      ? Number(referendumInfoFromSubscan.ayes_amount) / (Number(referendumInfoFromSubscan.ayes_amount) + Number(new BN(referendumInfoFromSubscan.nays_amount))) * 100
      : 0
    , [referendumInfoFromSubscan]);

  const naysPercent = useMemo(() =>
    referendumInfoFromSubscan
      ? Number(referendumInfoFromSubscan.nays_amount) / (Number(referendumInfoFromSubscan.ayes_amount) + Number(new BN(referendumInfoFromSubscan.nays_amount))) * 100
      : 0
    , [referendumInfoFromSubscan]);


  useEffect(() => {
    selectedSubMenu && history.push({
      pathname: `/governance/${address}`,
      state: { selectedSubMenu }
    });
  }, [address, history, selectedSubMenu]);

  useEffect(() => {
    chainName && postId && getReferendum(chainName, postId).then((res) => {
      setReferendum(res);
    });

    chainName && postId && getReferendumFromSubscan(chainName, postId).then((res) => {
      setReferendumInfoFromSubscan(res);
    });
  }, [chainName, postId]);

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
    if (!api) {
      return;
    }

    api.query.referenda.referendumInfoFor(124).then((res) => {
      console.log(`referendumInfoFor referendum ${124} :, ${res}`);
    }).catch(console.error);
  }, [api]);

  const onTopMenuMenuClick = useCallback((item: TopMenu) => {
    setSelectedTopMenu(item);
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

  const backToTopMenu = useCallback((event) => {
    setSelectedSubMenu('All');
  }, []);

  const backToSubMenu = useCallback((event) => {
    setSelectedSubMenu(state?.selectedSubMenu);
  }, [state?.selectedSubMenu]);

  const onAccountChange = useCallback((address: string) =>
    onAction(`/governance/${address}`)
    , [onAction]);

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

  const Bread = () => (
    <Grid container sx={{ py: '10px' }}>
      <Breadcrumbs aria-label='breadcrumb' color='text.primary'>
        <Link onClick={backToTopMenu} sx={{ cursor: 'pointer', fontWeight: 500 }} underline='hover'>
          {selectedTopMenu || 'Referenda'}
        </Link>
        <Link onClick={backToSubMenu} sx={{ cursor: 'pointer', fontWeight: 500 }} underline='hover'>
          {state?.selectedSubMenu}
        </Link>
        <Typography color='text.primary' sx={{ fontWeight: 500 }}>
          {`Referendum #${postId}`}
        </Typography>
      </Breadcrumbs>
    </Grid>
  );

  useEffect(() => {
    const chartData = {
      labels: [
        'Aye',
        'Nay',
        // 'Abstain'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [ayesPercent, naysPercent],
        backgroundColor: [
          '#008080',
          '#FF5722',
          // '#BBBBBB'
        ],
        hoverOffset: 4
      }]
    };

    const chartInstance = new Chart(chartRef.current, {
      data: chartData,
      // options: chartOptions,
      type: 'pie'
    });

    // Clean up the chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, [ayesPercent]);

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
          <Grid container justifyContent='space-between'>
            <Grid container item xs={8.9}>
              <Accordion sx={{ width: 'inherit' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Grid container item>
                    <Grid container item xs={12}>
                      <Typography fontSize={24} fontWeight={500}>
                        {referendum?.title}
                      </Typography>
                    </Grid>
                    <Grid alignItems='center' container item justifyContent='space-between' xs={12}>
                      <Grid alignItems='center' container item xs={9.5}>
                        <Grid item sx={{ fontSize: '16px', fontWeight: 400, mr: '17px' }}>
                          {t('By')}:
                        </Grid>
                        <Grid item sx={{ mb: '10px' }}>
                          <Identity
                            api={api}
                            chain={chain}
                            formatted={referendum?.proposer}
                            identiconSize={25}
                            showSocial={false}
                            style={{
                              fontSize: '16px',
                              fontWeight: 400,
                              height: '38px',
                              lineHeight: '47px',
                              maxWidth: '100%',
                              minWidth: '35%',
                              width: 'fit-content',
                            }}
                          />
                        </Grid>
                        <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                        <Grid item sx={{ fontSize: '16px', fontWeight: 400, opacity: 0.6 }}>
                          {referendum?.method}
                        </Grid>
                        <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                        <ClockIcon sx={{ fontSize: 27, ml: '10px' }} />
                        {referendum?.created_at &&
                          <Grid item sx={{ fontSize: '16px', fontWeight: 400, pl: '1%' }}>
                            {new Date(referendum?.created_at).toDateString()}
                          </Grid>
                        }
                      </Grid>
                      <Grid item sx={{ textAlign: 'center', mb: '5px', color: 'white', fontSize: '16px', fontWeight: 400, border: '1px solid primary.main', borderRadius: '30px', bgcolor: '#737373', p: '5px 10px' }} xs={1.5}>
                        {referendum?.status.replace(/([A-Z])/g, ' $1').trim()}
                      </Grid>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container item xs={12}>
                    {referendum?.content &&
                      <ReactMarkdown
                        components={{ img: ({ node, ...props }) => <img style={{ maxWidth: '100%' }}{...props} /> }}
                        children={referendum?.content}
                      />
                    }
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
            <Grid container item xs={2.9} sx={{ bgcolor: 'background.paper', borderRadius: '10px' }}>
              <canvas height='150' id='chartCanvas' ref={chartRef} width='250' />
            </Grid>
          </Grid>
        </Container>
      </Container>
    </>
  );
}
