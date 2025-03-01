// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description to show claimed rewards chart
 * */

import type { ClaimedRewardInfo, SubscanClaimedRewardInfo } from '../../../../util/types';

import { faChartColumn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowDropDown as ArrowDropDownIcon, KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Accordion, AccordionSummary, Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, type PluginChartOptions, Title, Tooltip } from 'chart.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import { BN, BN_ZERO } from '@polkadot/util';

import { Progress } from '../../../../components';
import { useInfo, useTranslation } from '../../../../hooks';
import { getNominationPoolsClaimedRewards } from '../../../../util/api';
import { MAX_HISTORY_RECORD_TO_SHOW } from '../../../../util/constants';
import { amountToHuman } from '../../../../util/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MAX_REWARDS_INFO_TO_SHOW = 50;
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

interface ArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
}

interface Props {
  address?: string;
}

export default function ClaimedRewardsChart({ address }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { chainName, decimal, token } = useInfo(address);

  const [claimedRewardsInfo, setClaimedRewardsInfo] = useState<ClaimedRewardInfo[] | null | undefined>();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [mostPrize, setMostPrize] = useState<number>(0);
  const [dataToShow, setDataToShow] = useState<[string[], string[]][]>();
  const [weeksRewards, setWeekRewards] = useState<{ amount: BN, amountInHuman: string, date: string, timestamp: number, }[][]>();
  const [showDetails, setShowDetails] = useState<boolean>();

  const [expanded, setExpanded] = useState<number>(-1);

  const dateOptions = useMemo((): Intl.DateTimeFormatOptions => ({ day: 'numeric', month: 'short' }), []);
  const weekDaysShort = ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.', 'Sat.'];

  const formateDate = useCallback((date: number) => {
    return new Date(date * 1000).toLocaleDateString('en-US', dateOptions);
  }, [dateOptions]);

  const ascSortedRewards = useMemo(() => {
    const sorted = claimedRewardsInfo && [...claimedRewardsInfo];

    sorted?.sort((a, b) => a.timeStamp - b.timeStamp);

    const newSorted = sorted?.map((reward) => {
      reward.date = formateDate(reward.timeStamp);

      return reward;
    });

    return newSorted;
  }, [formateDate, claimedRewardsInfo]);

  // sorted labels and rewards and removed duplicates dates and sum rewards on the same date
  const aggregatedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !decimal) {
      return;
    }

    const uDate = new Set();

    ascSortedRewards.forEach((item) => {
      uDate.add(item.date);
    });

    const ascSortedLabels = Array.from(uDate) as string[];
    const temp = ascSortedLabels.map((uniqueDate) => ({ amount: BN_ZERO, amountInHuman: undefined as unknown as string, date: uniqueDate, timestamp: undefined as unknown as number }));

    ascSortedRewards.forEach((item) => {
      const relatedDateIndex = temp.findIndex((dateItem) => dateItem.date === item.date);

      temp[relatedDateIndex].amount = temp[relatedDateIndex].amount.add(item.amount);
      temp[relatedDateIndex].timestamp = temp[relatedDateIndex].timestamp ?? new Date(item.timeStamp).getTime();
      temp[relatedDateIndex].amountInHuman = amountToHuman(temp[relatedDateIndex].amount, decimal);
    });

    for (let j = 0; j < temp.length; j++) {
      if (j + 1 === temp.length) {
        continue;
      }

      const firstRewardDate = new Date(temp[j].timestamp * 1000);
      const nextRewardDate = temp[j + 1].timestamp;
      const pnd = new Date(firstRewardDate.setDate(firstRewardDate.getDate() + 1));

      if (formateDate(pnd.getTime() / 1000) !== formateDate(nextRewardDate)) {
        temp.splice(j + 1, 0, { amount: BN_ZERO, amountInHuman: '0', date: formateDate(pnd.getTime() / 1000), timestamp: (pnd.getTime() / 1000) });
      }
    }

    let estimatedMostPrize = BN_ZERO;

    temp.forEach((prize) => {
      if (prize.amount.gt(estimatedMostPrize)) {
        estimatedMostPrize = prize.amount;
      }
    });

    setMostPrize(Number(amountToHuman(estimatedMostPrize, decimal)));

    return temp;
  }, [ascSortedRewards, decimal, formateDate]);

  const descSortedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !weeksRewards?.length) {
      return;
    }

    const availableDates = weeksRewards[pageIndex].map((item) => formateDate(item.timestamp));
    const rewardsDetailInAWeek = ascSortedRewards.filter(({ date }) => availableDates.includes(date ?? ''));

    // These lines filter dates from previous years within the same week.
    const biggestDate = Math.max(...rewardsDetailInAWeek.map(({ timeStamp }) => timeStamp));
    const thresholdDate = biggestDate - (ONE_DAY_IN_SECONDS * 8);
    const filteredRewardsDetail = rewardsDetailInAWeek.filter(({ timeStamp }) => timeStamp >= thresholdDate);

    return filteredRewardsDetail.reverse();
  }, [ascSortedRewards, formateDate, pageIndex, weeksRewards]);

  useEffect(() => {
    if (!aggregatedRewards?.length) {
      return;
    }

    const aWeekRewards = [];
    const sliced: [string[], string[]][] = [];

    let counter = 0;

    for (let i = aggregatedRewards.length - 1; i >= 0; i--) {
      if (new Date(aggregatedRewards[i].timestamp * 1000).getDay() === 0) {
        aWeekRewards.push(aggregatedRewards.slice(i, i + 7));
        counter = i;
      }

      if (i === 0 && new Date(aggregatedRewards[i].timestamp * 1000).getDay() !== 0) {
        const cutIndex = counter > 0 ? counter : aggregatedRewards.length - 1;

        aWeekRewards.push(aggregatedRewards.slice(0, cutIndex || 1));
      }
    }

    aWeekRewards.length > 0 && aWeekRewards.forEach((week) => {
      const aWeekRewardsAmount: string[] = [];
      const aWeekRewardsLabel: string[] = [];

      for (let i = 0; i < 7; i++) {
        if (week[i]?.date) {
          aWeekRewardsAmount.push(week[i].amountInHuman);
          aWeekRewardsLabel.push(formateDate(week[i].timestamp));
        } else {
          const firstDay = new Date(week[0].timestamp * 1000).getDay();
          const dateToAdd = new Date(week[firstDay ? 0 : week.length - 1].timestamp * 1000);

          if (firstDay) {
            const newDate = new Date(dateToAdd.setDate(dateToAdd.getDate() - 1)).getTime() / 1000;

            aWeekRewardsAmount.unshift('0');
            aWeekRewardsLabel.unshift(formateDate(newDate));
            week.unshift({
              amount: BN_ZERO,
              amountInHuman: '0',
              date: formateDate(newDate),
              timestamp: newDate
            });
          } else {
            const newDate = new Date(dateToAdd.setDate(dateToAdd.getDate() + 1)).getTime() / 1000;

            aWeekRewardsAmount.push('0');
            aWeekRewardsLabel.push(formateDate(newDate));
            week.push({
              amount: BN_ZERO,
              amountInHuman: '0',
              date: formateDate(newDate),
              timestamp: newDate
            });
          }
        }
      }

      sliced.push([aWeekRewardsAmount, aWeekRewardsLabel]);
    });

    setDataToShow(sliced);

    setWeekRewards(aWeekRewards);
  }, [aggregatedRewards, formateDate]);

  useEffect((): void => {
    address && chainName && getNominationPoolsClaimedRewards(chainName, String(address), MAX_HISTORY_RECORD_TO_SHOW).then((r) => {
      const list = r?.data.list as SubscanClaimedRewardInfo[];
      const claimedRewardsFromSubscan: ClaimedRewardInfo[] | undefined = list?.map((i: SubscanClaimedRewardInfo): ClaimedRewardInfo => {
        return {
          amount: new BN(i.amount),
          era: i.era,
          event: i.event_id,
          timeStamp: i.block_timestamp
        } as ClaimedRewardInfo;
      });

      if (claimedRewardsFromSubscan.length) {
        return setClaimedRewardsInfo(claimedRewardsFromSubscan);
      } else {
        return setClaimedRewardsInfo(null);
      }
    }).catch(console.error);
  }, [chainName, address]);

  const handleAccordionChange = useCallback((panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : -1);
  }, []);

  const nextPrevWeek = (next: boolean) => {
    if (!dataToShow?.length || !weeksRewards?.length) {
      return;
    }

    const start = dataToShow[next ? pageIndex - 1 : pageIndex + 1]?.[1][0];
    const end = dataToShow[next ? pageIndex - 1 : pageIndex + 1]?.[1][6];

    const newDate = new Date(weeksRewards[next ? 0 : weeksRewards?.length - 1][next ? 6 : 0].timestamp * 1000);
    const estimatedStart = next ? formateDate(new Date(newDate.setDate(newDate.getDate() + 1)).getTime() / 1000) : formateDate(new Date(newDate.setDate(newDate.getDate() - 7)).getTime() / 1000);
    const estimatedEnd = next ? formateDate(new Date(newDate.setDate(newDate.getDate() + 7)).getTime() / 1000) : formateDate(new Date(newDate.setDate(newDate.getDate() + 6)).getTime() / 1000);

    return `${start ?? estimatedStart} - ${end ?? estimatedEnd}`;
  };

  const options = {
    aspectRatio: 1.9,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
        bodyColor: theme.palette.mode === 'dark' ? '#000' : '#fff',
        bodyFont: {
          displayColors: false,
          family: 'Roboto',
          size: 13,
          weight: 'bold'
        },
        callbacks: {
          label: function (TooltipItem: { formattedValue: string; } | undefined) {
            if (!dataToShow || !TooltipItem) {
              return;
            }

            return `${TooltipItem.formattedValue} ${token ?? ''}`;
          },
          title: function (TooltipItem: { label: string; }[] | undefined) {
            if (!dataToShow || !TooltipItem || !token) {
              return;
            }

            const weekDayIndex = dataToShow[pageIndex][1].indexOf(TooltipItem[0].label);

            return `${weekDaysShort[weekDayIndex]} ${TooltipItem[0].label}`;
          }
        },
        displayColors: false,
        titleColor: theme.palette.mode === 'dark' ? '#000' : '#fff',
        titleFont: {
          displayColors: false,
          family: 'Roboto',
          size: 14,
          weight: 'bold'
        }
      }
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          borderColor: theme.palette.secondary.light,
          color: '',
          tickColor: ''
        },
        ticks: { color: theme.palette.text.primary }
      },
      y: {
        grid: {
          tickColor: ''
        },
        max: mostPrize,
        ticks: {
          color: theme.palette.text.primary
        }
      }
    }
  } as unknown as PluginChartOptions<'bar'>;

  const data = {
    datasets: [
      {
        backgroundColor: 'rgba(154, 125, 179, 0.75)',
        barThickness: 20,
        borderColor: '#3A0B63',
        borderRadius: 3,
        borderWidth: 1,
        data: dataToShow?.[pageIndex][0],
        label: token
      }
    ],
    labels: dataToShow?.[pageIndex][1]
  };

  const toggleDetails = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  const onNext = useCallback(() => {
    pageIndex && setPageIndex(pageIndex - 1);
  }, [pageIndex]);

  const onPrevious = useCallback(() => {
    dataToShow && pageIndex !== (dataToShow.length - 1) && setPageIndex(pageIndex + 1);
  }, [dataToShow, pageIndex]);

  const Arrows = ({ onNext, onPrevious }: ArrowsProps) => (
    <Grid container justifyContent='space-between' m='auto' width='96%'>
      <Grid alignItems='center' container item justifyContent='flex-start' maxWidth='50%' onClick={onPrevious} sx={{ cursor: dataToShow && pageIndex === dataToShow.length - 1 ? 'default' : 'pointer' }} width='fit_content'>
        <KeyboardDoubleArrowLeftIcon sx={{ color: dataToShow && pageIndex === dataToShow?.length - 1 ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '28px', ml: '3px', mr: '7px', my: 'auto', width: '1px' }} />
        <Grid container direction='column' item xs={7}>
          <Typography color={dataToShow && pageIndex === dataToShow.length - 1 ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400}>{t('Previous')}</Typography>
          <Typography color={dataToShow && pageIndex === dataToShow.length - 1 ? 'secondary.contrastText' : 'text.primary'} fontSize='12px' fontWeight={300}>{nextPrevWeek(false)}</Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' maxWidth='50%' onClick={onNext} sx={{ cursor: pageIndex === 0 ? 'default' : 'pointer' }} width='fit_content'>
        <Grid container direction='column' item textAlign='right' xs={7}>
          <Typography color={pageIndex === 0 ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400}>{t('Next')}</Typography>
          <Typography color={pageIndex === 0 ? 'secondary.contrastText' : 'text.primary'} fontSize='12px' fontWeight={300}>{nextPrevWeek(true)}</Typography>
        </Grid>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '28px', ml: '7px', mr: '3px', my: 'auto', width: '1px' }} />
        <KeyboardDoubleArrowRightIcon sx={{ color: pageIndex === 0 ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
      </Grid>
    </Grid>
  );

  return (
    <Grid alignItems={'flex-start'} container item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', maxHeight: 'fit-content', minHeight: claimedRewardsInfo === null ? 'fit-content' : '295px', p: '10px', width: 'inherit' }}>
      <Grid alignItems='center' container item justifyContent='center' sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <FontAwesomeIcon
          color={`${theme.palette.text.primary}`}
          icon={faChartColumn}
          style={{ height: '20px', marginRight: '10px', width: '20px' }}
        />
        <Typography color={'text.primary'} fontSize='18px' fontWeight={500}>
          {t('Claimed Rewards')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' mt='10px'>
        {claimedRewardsInfo && descSortedRewards && decimal && mostPrize &&
          <Grid container item>
            <Arrows onNext={onNext} onPrevious={onPrevious} />
            <Grid item sx={{ p: '5px 10px 5px' }} xs={12}>
              <Bar data={data} options={options} />
            </Grid>
            <Grid container item justifyContent='flex-end'>
              <Collapse in={showDetails} orientation='vertical' sx={{ '> .MuiCollapse-wrapper .MuiCollapse-wrapperInner': { display: 'grid', rowGap: '10px' }, width: '100%' }}>
                <>
                  <Grid container sx={{ borderBottom: '2px solid', borderBottomColor: 'secondary.light', m: 'auto', width: '92%' }}>
                    <Typography fontSize='18px' fontWeight={400} width='46%'>
                      {t('Date')}
                    </Typography>
                    <Typography fontSize='18px' fontWeight={400} width='53%'>
                      {t('Reward')}
                    </Typography>
                  </Grid>
                  <Grid container sx={{ '> .MuiPaper-root': { backgroundImage: 'none', boxShadow: 'none' }, '> .MuiPaper-root::before': { bgcolor: 'transparent' }, maxHeight: parent.innerHeight - 425, overflowX: 'hidden', overflowY: 'scroll' }}>
                    {descSortedRewards.length
                      ? descSortedRewards.slice(0, MAX_REWARDS_INFO_TO_SHOW).map((d, index) =>
                        <>
                          <Accordion disableGutters expanded={expanded === index} key={index} onChange={handleAccordionChange(index)} sx={{ bgcolor: 'transparent', flexGrow: 1, fontSize: 12 }}>
                            <AccordionSummary sx={{ height: '35px', m: 'auto', minHeight: '35px' }}>
                              <Grid container item key={index} sx={{ textAlign: 'left' }}>
                                <Grid item width='50%'>
                                  {d.timeStamp ? new Date(d.timeStamp * 1000).toDateString() : d.era}
                                </Grid>
                                <Grid item width='50%'>
                                  {amountToHuman(d.amount, decimal, 4)} {` ${token ?? ''}`}
                                </Grid>
                              </Grid>
                            </AccordionSummary>
                          </Accordion>
                          {descSortedRewards.length !== index + 1 && <Divider sx={{ bgcolor: 'secondary.light', height: '1.5px', m: 'auto', width: '92%' }} />}
                        </>
                      )
                      : <Typography fontSize='18px' fontWeight={400} lineHeight='40px' m='auto'>
                        {t('No reward this week!')}
                      </Typography>
                    }
                  </Grid>
                </>
              </Collapse>
              <Divider sx={{ bgcolor: 'divider', height: '2px', mt: '5px', width: '100%' }} />
              <Grid alignItems='flex-start' container item justifyContent='space-between'>
                <Grid item>
                  <Typography color='text.disabled' fontSize='10px'>
                    {'Powered by Subscan'}
                  </Typography>
                </Grid>
                <Grid container item onClick={toggleDetails} sx={{ cursor: 'pointer', p: '5px', width: 'fit-content' }}>
                  <Typography color='secondary.light' fontSize='14px' fontWeight={400}>
                    {t(showDetails ? t('Less') : t('More'))}
                  </Typography>
                  <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showDetails ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        }
        {claimedRewardsInfo === undefined && !descSortedRewards &&
          <Progress
            pt='20px'
            size={125}
            title={t('Loading rewards...')}
            type='cubes'
          />
        }
        {claimedRewardsInfo === null &&
          <Grid container item justifyContent='center'>
            <Typography fontSize='16px' fontWeight={400}>
              {t('No Claim Rewards History!')}
            </Typography>
          </Grid>
        }
      </Grid>
    </Grid>
  );
}
