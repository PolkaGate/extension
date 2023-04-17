// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import { Groups as FellowshipIcon, HowToVote as ReferendaIcon } from '@mui/icons-material/';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Breadcrumbs, Button, Container, Divider, Grid, LinearProgress, Link, Typography, useTheme } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { ActionContext, Identity, ShowBalance, ShowValue } from '../../../components';
import { useApi, useChain, useChainName, useDecidingCount, useDecimal, useToken, useTrack, useTranslation } from '../../../hooks';
import { Header } from '../Header';
import ReferendaMenu from '../ReferendaMenu';
import { blockToX, LabelValue } from '../TrackStats';
import { MAX_WIDTH, STATUS_COLOR } from '../utils/consts';
import { getReferendum, getReferendumFromSubscan } from '../utils/helpers';
import { ReferendumPolkassambly, ReferendumSubScan, TopMenu } from '../utils/types';
import { toPascalCase, toTitleCase } from '../utils/util';
import ReferendumTimeline from './ReferendumTimeline';

export default function ReferendumPost(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { address, postId } = useParams<{ address: string, postId: number }>();
  const history = useHistory();
  const chain = useChain(address);
  const { state } = useLocation();
  const theme = useTheme();
  const chainName = useChainName(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const chartRef = useRef(null);

  Chart.register(...registerables);

  const api = useApi(address);
  const decidingCounts = useDecidingCount(address);
  const [selectedTopMenu, setSelectedTopMenu] = useState<TopMenu>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>();
  const [referendumFromPA, setReferendum] = useState<ReferendumPolkassambly>();
  const [referendumInfoFromSubscan, setReferendumInfoFromSubscan] = useState<ReferendumSubScan>();
  const [totalIssuance, setTotalIssuance] = useState<BN>();
  const [inactiveIssuance, setInactiveIssuance] = useState<BN>();
  const [decidingProgress, setDecidingProgress] = useState<number>();

  const trackName = useMemo((): string | undefined => {
    const name = (state?.selectedSubMenu || referendumInfoFromSubscan?.origins || referendumFromPA?.origin) as string | undefined;

    return name && toTitleCase(name);
  }, [referendumFromPA?.origin, referendumInfoFromSubscan?.origins, state?.selectedSubMenu]);

  const track = useTrack(address, trackName);

  useEffect(() => {
    if (track?.[1]?.decisionPeriod && referendumInfoFromSubscan?.timeline[1]?.time) {
      setDecidingProgress((Date.now() / 1000 - referendumInfoFromSubscan.timeline[1].time) * 100 / (track[1].decisionPeriod * 6));
    }
  }, [referendumInfoFromSubscan?.timeline, track]);

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

  const supportPercent = useMemo(() => {
    if (totalIssuance && inactiveIssuance && referendumInfoFromSubscan) {
      return (Number(referendumInfoFromSubscan.support_amount) * 100 / Number(totalIssuance.sub(inactiveIssuance))).toFixed(2);
    }
  }, [inactiveIssuance, referendumInfoFromSubscan, totalIssuance]);

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

    api.query.balances.totalIssuance().then(setTotalIssuance);

    api.query.balances.inactiveIssuance().then(setInactiveIssuance);

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
        label: 'Percentage',
        data: [ayesPercent, naysPercent],
        backgroundColor: [
          '#008080',
          '#FF5722',
          // '#BBBBBB'
        ],
        hoverOffset: 4
      }]
    };

    const chartOptions = {
      plugins: {
        legend: {
          align: 'center',
          display: true,
          maxHeight: 50,
          maxWidth: '2px',
          position: 'bottom'
        },
        tooltip: {
          bodyFont: {
            displayColors: false,
            family: 'Roboto',
            size: 13,
            weight: 'bold'
          },
          callbacks: {
            label: function (TooltipItem: string | { label: string }[] | undefined) {
              if (!TooltipItem) {
                return;
              }

              return `${TooltipItem.formattedValue} %`;
            },
            title: function (TooltipItem: string | { label: string }[] | undefined) {
              if (!TooltipItem) {
                return;
              }

              return `${TooltipItem[0].label}`;
            }
          },
          displayColors: false,
          // titleColor: theme.palette.mode === 'dark' ? '#000' : '#fff',
          titleFont: {
            displayColors: false,
            family: 'Roboto',
            size: 14,
            weight: 'bold'
          }
        }
      },
      responsive: true
    };

    const chartInstance = new Chart(chartRef.current, {
      data: chartData,
      options: chartOptions,
      type: 'pie'
    });

    // Clean up the chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, [ayesPercent, naysPercent]);

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
            <Grid container item md={8.9} sx={{ height: '100%' }}>
              <Accordion defaultExpanded sx={{ width: 'inherit', px: '2%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}` }} />} sx={{ borderBottom: `1px solid ${theme.palette.action.disabledBackground}`, px: 0 }}>
                  <Grid container item>
                    <Grid container item xs={12}>
                      <Typography fontSize={24} fontWeight={500}>
                        <ShowValue value={trackName ? trackName || 'No Title' : undefined} width='500px' />
                      </Typography>
                    </Grid>
                    <Grid alignItems='center' container item justifyContent='space-between' xs={12}>
                      <Grid alignItems='center' container item xs={9.5}>
                        <Grid item sx={{ fontSize: '14px', fontWeight: 400, mr: '17px' }}>
                          {t('By')}:
                        </Grid>
                        <Grid item sx={{ mb: '10px' }}>
                          <Identity
                            api={api}
                            chain={chain}
                            formatted={referendumFromPA?.proposer}
                            identiconSize={25}
                            showSocial={false}
                            style={{
                              fontSize: '14px',
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
                        <Grid item sx={{ fontSize: '14px', fontWeight: 400, opacity: 0.6 }}>
                          {referendumFromPA?.method}
                        </Grid>
                        <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                        <ClockIcon sx={{ fontSize: 27, ml: '10px' }} />
                        <Grid item sx={{ fontSize: '14px', fontWeight: 400, pl: '1%' }}>
                          <ShowValue value={referendumFromPA?.created_at && new Date(referendumFromPA?.created_at).toDateString()} />
                        </Grid>
                        <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
                        <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
                          {referendumFromPA?.requested &&
                            <LabelValue
                              label={`${t('Requested')}: `}
                              noBorder
                              value={<ShowBalance
                                balance={new BN(referendumFromPA?.requested)}
                                decimal={decimal}
                                decimalPoint={2}
                                token={token}
                              />}
                              valueStyle={{ fontSize: 16, fontWeight: 500, pl: '5px' }}
                              labelStyle={{ fontSize: 14 }}
                            />}
                        </Grid>
                      </Grid>
                      <Grid item sx={{ textAlign: 'center', mb: '5px', color: 'white', fontSize: '16px', fontWeight: 400, border: '0.01px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[toPascalCase(referendumFromPA?.status)], p: '5px 10px' }} xs={1.5}>
                        {toTitleCase(referendumFromPA?.status)}
                      </Grid>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container item xs={12}>
                    {referendumFromPA?.content &&
                      <ReactMarkdown
                        components={{ img: ({ node, ...props }) => <img style={{ maxWidth: '100%' }}{...props} /> }}
                        children={referendumFromPA?.content}
                      />
                    }
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <ReferendumTimeline
                address={address}
                history={referendumFromPA?.statusHistory} 
                />
            </Grid>
            <Grid container alignItems='flex-start' item md={2.9} sx={{ bgcolor: 'background.paper', borderRadius: '10px', height: '100%' }}>
              <canvas height='150' id='chartCanvas' ref={chartRef} width='250' />
              <Grid item px='5%' xs={12}>
                <LabelValue
                  label={`${t('Ayes')}(${referendumInfoFromSubscan?.ayes_count ? referendumInfoFromSubscan.ayes_count : ''})`}
                  value={<ShowBalance
                    balance={referendumInfoFromSubscan?.ayes_amount && new BN(referendumInfoFromSubscan.ayes_amount)}
                    decimal={decimal}
                    token={token}
                  />}
                />
                <LabelValue
                  label={`${t('Nays')}(${referendumInfoFromSubscan?.nays_count ? referendumInfoFromSubscan.nays_count : ''})`}
                  value={<ShowBalance
                    balance={referendumInfoFromSubscan?.nays_amount && new BN(referendumInfoFromSubscan.nays_amount)}
                    decimal={decimal}
                    token={token}
                  />}
                />
                <LabelValue
                  label={`${t('Support')} (${supportPercent || ''}%)`}
                  value={<ShowBalance
                    balance={referendumInfoFromSubscan?.support_amount && new BN(referendumInfoFromSubscan.support_amount)}
                    decimal={decimal}
                    token={token}
                  />}
                  style={{ mt: '20px' }}
                />
                <LabelValue
                  label={t('Total issuance')}
                  value={<ShowBalance
                    balance={totalIssuance && inactiveIssuance && totalIssuance.sub(inactiveIssuance)}
                    decimal={decimal}
                    token={token}
                  />}
                />
              </Grid>
              <Grid alignItems='center' container item justifyContent='space-between' sx={{ fontSize: '16px', letterSpacing: '-0.015em', my: '20px', px: '2%' }}>
                <Grid item xs={9}>
                  <LinearProgress
                    sx={{ bgcolor: 'primary.contrastText', mt: '15px' }}
                    value={decidingProgress || 0}
                    variant='determinate'
                  />
                </Grid>
                <Grid fontWeight={400} item sx={{ textAlign: 'right' }} xs>
                  {blockToX(track?.[1]?.decisionPeriod)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Container>
    </>
  );
}
