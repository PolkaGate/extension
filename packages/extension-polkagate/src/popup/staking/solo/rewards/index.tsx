// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description to show rewards chart
 * */
import { ExpandMore as ExpandMoreIcon, KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Typography, useTheme } from '@mui/material';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { ChainLogo, Identity, PButton, Progress } from '../../../../components';
import { useApi, useChain, useFormatted, useTranslation } from '../../../../hooks';
import { HeaderBrand } from '../../../../partials';
import getRewardsSlashes from '../../../../util/api/getRewardsSlashes';
import { MAX_REWARDS_TO_SHOW } from '../../../../util/constants';
import { getRewards } from '../../../../util/subquery/staking';
import { RewardInfo, SubQueryRewardInfo, SubscanRewardInfo } from '../../../../util/types';
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

interface ArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
}

interface State {
  api?: ApiPromise;
  chain?: Chain;
}

export default function RewardDetails(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const { state } = useLocation<State>();
  const api = useApi(address, state?.api);
  const chain = useChain(address, state?.chain);
  const history = useHistory();
  const formatted = useFormatted(address);
  const theme = useTheme();

  const [rewardsInfo, setRewardsInfo] = useState<RewardInfo[]>();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [mostPrize, setMostPrize] = useState<number>(0);
  const [dataToShow, setDataToShow] = useState<[string[], string[]][]>();
  const [weeksRewards, setWeekRewards] = useState<{ date: number; amount?: string | undefined; }[][]>();

  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');
  const decimal = api && api.registry.chainDecimals[0];
  const token = api && api.registry.chainTokens[0];
  const [expanded, setExpanded] = useState<number>(-1);

  const dateOptions = useMemo(() => { return { day: 'numeric', month: 'short' } }, []);
  const weekDaysShort = ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.', 'Sat.'];

  const formateDate = useCallback((date: number) => {
    return new Date(date * 1000).toLocaleDateString('en-GB', dateOptions);
  }, [dateOptions]);

  const ascSortedRewards = useMemo(() => {
    const sorted = rewardsInfo && [...rewardsInfo];

    sorted?.sort((a, b) => a.era - b.era);

    const newSorted = sorted?.map((reward) => {
      reward.date = formateDate(reward.timeStamp);

      return reward;
    });

    return newSorted;
  }, [formateDate, rewardsInfo]);

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

    const tempToHuman: { date: number, amount?: string }[] = [];
    const temp = new Array(ascSortedLabels.length).fill(BN_ZERO) as BN[];
    let index = 0;

    ascSortedRewards.forEach((item) => {
      if (item.date === ascSortedLabels[index]) {
        temp[index] = temp[index].add(item.amount);
        tempToHuman[index] = ({ amount: amountToHuman(temp[index], decimal), date: new Date(item.timeStamp).getTime() });
      } else {
        index++;
        temp[index] = temp[index].add(item.amount);
        tempToHuman[index] = ({ amount: amountToHuman(temp[index], decimal), date: new Date(item.timeStamp).getTime() });
      }
    });

    for (let j = 0; j < tempToHuman.length; j++) {
      if (j + 1 === tempToHuman.length) {
        continue;
      }

      const firstRewardDate = new Date(tempToHuman[j].date * 1000);
      const lastRewardDate = new Date(tempToHuman[j + 1].date * 1000);
      const difference = (lastRewardDate.getTime() / 1000) - (firstRewardDate.getTime() / 1000);
      const TotalDays = Math.round(difference / (3600 * 24));

      if (TotalDays > 1) {
        for (let i = 1; i < TotalDays; i++) {
          const pnd = new Date(firstRewardDate.setDate(firstRewardDate.getDate() + 1));

          tempToHuman.splice(j + i, 0, { amount: '0', date: (pnd.getTime() / 1000) });
        }
      }
    }

    let estimatedMostPrize = BN_ZERO;

    temp.forEach((prize) => {
      if (prize.gt(estimatedMostPrize)) {
        estimatedMostPrize = prize;
      }
    });

    setMostPrize(Number(amountToHuman(estimatedMostPrize, decimal)));

    return tempToHuman;
  }, [ascSortedRewards, decimal]);

  const descSortedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !weeksRewards?.length) {
      return;
    }

    const availableDates = weeksRewards[pageIndex].map((item) => formateDate(item.date));
    const filteredRewardsDetail = ascSortedRewards.filter((item) => availableDates.includes(item.date));

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
      if (new Date(aggregatedRewards[i].date * 1000).getDay() === 0) {
        aWeekRewards.push(aggregatedRewards.slice(i, i + 7));
        counter = i;
      }

      if (i === 0 && new Date(aggregatedRewards[i].date * 1000).getDay() !== 0) {
        aWeekRewards.push(aggregatedRewards.slice(0, counter));
      }
    }

    aWeekRewards.length && aWeekRewards.forEach((week, index) => {
      const aWeekRewardsAmount: string[] = [];
      const aWeekRewardsLabel: string[] = [];

      for (let i = 0; i < 7; i++) {
        if (week[i]?.date) {
          aWeekRewardsAmount.push(week[i].amount);
          aWeekRewardsLabel.push(formateDate(week[i].date));
        } else {
          const dateToAdd = new Date(week[index ? 0 : week.length - 1].date * 1000);

          if (index) {
            const newDate = new Date(dateToAdd.setDate(dateToAdd.getDate() - 1)).getTime() / 1000;

            aWeekRewardsAmount.unshift('0');
            aWeekRewardsLabel.unshift(formateDate(newDate));
            week.unshift({
              amount: '0',
              date: newDate
            });
          } else {
            const newDate = new Date(dateToAdd.setDate(dateToAdd.getDate() + 1)).getTime() / 1000;

            aWeekRewardsAmount.push('0');
            aWeekRewardsLabel.push(formateDate(newDate));
            week.push({
              amount: '0',
              date: newDate
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
    // TODO: to get rewrads info from subquery
    formatted && chainName && getRewards(chainName, formatted).then((info) => {
      const rewardsFromSubQuery: RewardInfo[] | undefined = info?.map(
        (i: SubQueryRewardInfo): RewardInfo => {
          return {
            amount: new BN(i.reward.amount),
            era: i.reward.era,
            event: i.reward.isReward ? 'Rewarded' : '',
            stash: i.reward.stash,
            timeStamp: Number(i.timestamp),
            validator: i.reward.validator
          };
        });

      console.log('rewardsFromSubQuery:', rewardsFromSubQuery);

      if (rewardsFromSubQuery?.length) {
        return setRewardsInfo(rewardsFromSubQuery);
      }
    });

    // eslint-disable-next-line no-void
    formatted && chainName && void getRewardsSlashes(chainName, 0, MAX_REWARDS_TO_SHOW, String(formatted)).then((r) => {
      const list = r?.data.list as SubscanRewardInfo[];
      const rewardsFromSubscan: RewardInfo[] | undefined = list?.map((i: SubscanRewardInfo): RewardInfo => {
        return {
          amount: new BN(i.amount),
          era: i.era,
          event: i.event_id,
          stash: i.stash,
          timeStamp: i.block_timestamp,
          validator: i.validator_stash
        } as RewardInfo;
      });

      console.log('rewardsFromSubscan:', rewardsFromSubscan);

      if (rewardsFromSubscan?.length) {
        return setRewardsInfo(rewardsFromSubscan);
      }
    });
  }, [chainName, formatted]);

  const handleAccordionChange = useCallback((panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : -1);
  }, []);

  const nextPrevWeek = (next: boolean) => {
    if (!dataToShow?.length || !weeksRewards?.length) {
      return;
    }

    const start = dataToShow[next ? pageIndex - 1 : pageIndex + 1] && dataToShow[next ? pageIndex - 1 : pageIndex + 1][1][0];
    const end = dataToShow[next ? pageIndex - 1 : pageIndex + 1] && dataToShow[next ? pageIndex - 1 : pageIndex + 1][1][6];

    const newDate = new Date(weeksRewards[next ? 0 : weeksRewards?.length - 1][next ? 6 : 0].date * 1000);
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
          label: function (TooltipItem: string | { label: string }[] | undefined) {
            if (!dataToShow || !TooltipItem) {
              return;
            }

            return `${TooltipItem.formattedValue} ${token}`;
          },
          title: function (TooltipItem: string | { label: string }[] | undefined) {
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
          color: theme.palette.secondary.light,
          tickColor: ''
        },
        max: mostPrize,
        ticks: {
          color: theme.palette.text.primary
        }
      }
    }
  };

  const data = {
    datasets: [
      {
        backgroundColor: 'rgba(154, 125, 179, 0.75)',
        barThickness: 20,
        borderColor: '#3A0B63',
        borderRadius: 3,
        borderWidth: 1,
        data: dataToShow && dataToShow[pageIndex][0],
        label: token
      }
    ],
    labels: dataToShow && dataToShow[pageIndex][1]
  };

  const backToStakingHome = useCallback(() => {
    history.push({
      pathname: `/solo/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const onNext = useCallback(() => {
    pageIndex && setPageIndex(pageIndex - 1);
  }, [pageIndex]);

  const onPrevious = useCallback(() => {
    dataToShow && pageIndex !== (dataToShow.length - 1) && setPageIndex(pageIndex + 1);
  }, [dataToShow, pageIndex]);

  const Arrows = ({ onNext, onPrevious }: ArrowsProps) => (
    <Grid container justifyContent='space-between' m='auto' width='96%'>
      <Grid alignItems='center' container item justifyContent='flex-start' maxWidth='48%' onClick={onPrevious} sx={{ cursor: pageIndex === dataToShow?.length - 1 ? 'default' : 'pointer' }} width='fit_content'>
        <KeyboardDoubleArrowLeftIcon sx={{ color: pageIndex === dataToShow?.length - 1 ? 'text.disabled' : 'secondary.light', fontSize: '25px' }} />
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '28px', ml: '3px', mr: '7px', my: 'auto', width: '1px' }} />
        <Grid container direction='column' item xs={7}>
          <Typography color={pageIndex === dataToShow?.length - 1 ? 'text.disabled' : 'secondary.light'} fontSize='14px' fontWeight={400}>{t<string>('Previous')}</Typography>
          <Typography color={pageIndex === dataToShow?.length - 1 ? 'text.disabled' : 'text.primay'} fontSize='12px' fontWeight={300}>{nextPrevWeek(false)}</Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' maxWidth='48%' onClick={onNext} sx={{ cursor: pageIndex === 0 ? 'default' : 'pointer' }} width='fit_content'>
        <Grid container direction='column' item textAlign='right' xs={7}>
          <Typography color={pageIndex === 0 ? 'text.disabled' : 'secondary.light'} fontSize='14px' fontWeight={400}>{t<string>('Next')}</Typography>
          <Typography color={pageIndex === 0 ? 'text.disabled' : 'text.primay'} fontSize='12px' fontWeight={300}>{nextPrevWeek(true)}</Typography>
        </Grid>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '28px', ml: '7px', mr: '3px', my: 'auto', width: '1px' }} />
        <KeyboardDoubleArrowRightIcon sx={{ color: pageIndex === 0 ? 'text.disabled' : 'secondary.light', fontSize: '25px' }} />
      </Grid>
    </Grid>
  );

  return (
    <>
      <HeaderBrand
        onBackClick={backToStakingHome}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Rewards')}
      />
      {descSortedRewards && decimal && mostPrize
        ? (
          <>
            <Grid container justifyContent='center'>
              <Grid item>
                <ChainLogo genesisHash={chain?.genesisHash} size={31} />
              </Grid>
              <Typography fontSize='20px' fontWeight={400} lineHeight='35px' pl='8px'>
                {token}
              </Typography>
            </Grid>
            <Arrows onNext={onNext} onPrevious={onPrevious} />
            <Grid item sx={{ p: '5px 10px 20px' }} xs={12}>
              <Bar data={data} options={options} />
            </Grid>
            <Grid container sx={{ borderBottom: '2px solid', borderBottomColor: 'secondary.light', m: 'auto', width: '92%' }}>
              <Typography fontSize='18px' fontWeight={400} width='37%'>
                {t('Date')}
              </Typography>
              <Typography fontSize='18px' fontWeight={400} width='18%'>
                {t('Era')}
              </Typography>
              <Typography fontSize='18px' fontWeight={400} width='45%'>
                {t('Reward')}
              </Typography>
            </Grid>
            <Grid container sx={{ '&::-webkit-scrollbar': { display: 'none', width: 0 }, '> .MuiPaper-root': { boxShadow: 'none', backgroundImage: 'none' }, '> .MuiPaper-root::before': { bgcolor: 'transparent' }, maxHeight: parent.innerHeight - 450, overflowX: 'hidden', overflowY: 'scroll', scrollbarWidth: 'none' }}>
              {descSortedRewards.length
                ? descSortedRewards.slice(0, MAX_REWARDS_INFO_TO_SHOW).map((d, index: number) =>
                  <>
                    <Accordion disableGutters expanded={expanded === index} key={index} onChange={handleAccordionChange(index)} sx={{ bgcolor: 'transparent', flexGrow: 1, fontSize: 12 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'secondary.light', fontSize: '35px' }} />} sx={{ height: '35px', m: 'auto', minHeight: '35px' }}>
                        <Grid container item key={index} sx={{ textAlign: 'left' }}>
                          <Grid item width='40%'>
                            {d.timeStamp ? new Date(d.timeStamp * 1000).toDateString() : d.era}
                          </Grid>
                          <Grid item width='20%'>
                            {d.era}
                          </Grid>
                          <Grid item width='40%'>
                            {amountToHuman(d.amount, decimal, 9)} {` ${token}`}
                          </Grid>
                        </Grid>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <Grid alignItems='center' container height='50px' m='auto' width='92%'>
                          <Typography fontSize='14px' fontWeight={400} textAlign='center' width='35%'>
                            {t('Received from')}:
                          </Typography>
                          <Grid item width='65%'>
                            <Identity
                              address={d.validator}
                              api={api}
                              chain={chain}
                              formatted={d.validator}
                              identiconSize={30}
                              showSocial
                              style={{ fontSize: '14px' }}
                              withShortAddress
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                    <Divider sx={{ bgcolor: 'secondary.light', height: '1.5px', m: 'auto', width: '92%' }} />
                  </>
                )
                : <Typography fontSize='18px' fontWeight={400} lineHeight='40px' m='30px auto 0' textAlign='center' width='92%'>
                  {t('No reward this week!')}
                </Typography>
              }
            </Grid>
            <PButton _onClick={backToStakingHome} text={t<string>('Back')} />
          </>)
        : <Progress pt='120px' size={125} title={t<string>('Loading rewards...')} />
      }
    </>
  );
}
