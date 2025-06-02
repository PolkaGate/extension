// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActiveElement, Chart, ChartData, ChartEvent, PluginChartOptions } from 'chart.js';
import type { ClaimedRewardInfo, SubscanClaimedRewardInfo } from '../util/types';

import { useTheme } from '@mui/material';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { getNominationPoolsClaimedRewards } from '../util/api';
import { MAX_HISTORY_RECORD_TO_SHOW } from '../util/constants';
import { amountToHuman } from '../util/utils';
import useChainInfo from './useChainInfo';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const DAYS_TO_SHOW = 10;

interface usePoolRewardsProps {
  chartData: ChartData<'bar', string[] | undefined, string>;
  dateInterval: string | undefined;
  descSortedRewards: ClaimedRewardInfo[] | undefined;
  onNextPeriod: () => void;
  onPreviousPeriod: () => void;
  chartOptions: PluginChartOptions<'bar'>;
  totalClaimedReward: BN | undefined;
  detail: string | undefined;
  expand: Dispatch<SetStateAction<string | undefined>>;
}

export default function usePoolRewards (address: string | undefined, genesisHash: string | undefined): usePoolRewardsProps {
  const theme = useTheme();
  const { chainName, decimal, token } = useChainInfo(genesisHash, true);

  const [claimedRewardsInfo, setClaimedRewardsInfo] = useState<ClaimedRewardInfo[] | null | undefined>();
  const [weeksRewards, setWeekRewards] = useState<{ amount: BN, amountInHuman: string, date: string, timestamp: number, }[][]>();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [dataToShow, setDataToShow] = useState<[string[], string[]][]>();
  const [totalClaimedReward, setTotalClaimedReward] = useState<BN | undefined>(undefined);
  const [detail, expand] = useState<string | undefined>(undefined);

  const dateOptions = useMemo((): Intl.DateTimeFormatOptions => ({ day: 'numeric', month: 'short' }), []);

  useEffect((): void => {
    if (!address || !chainName) {
      return;
    }

    getNominationPoolsClaimedRewards(chainName, String(address), MAX_HISTORY_RECORD_TO_SHOW)
      .then((r) => {
        const list = r?.data.list as SubscanClaimedRewardInfo[];
        let totalClaimedRewardAmount = BN_ZERO;

        const claimedRewardsFromSubscan: ClaimedRewardInfo[] | undefined = list?.map((i: SubscanClaimedRewardInfo): ClaimedRewardInfo => {
          const amount = new BN(i.amount);

          totalClaimedRewardAmount = totalClaimedRewardAmount.add(amount);

          return {
            address: i.account_display.address,
            amount,
            era: i.era,
            event: i.event_id,
            timeStamp: i.block_timestamp
          } as ClaimedRewardInfo;
        });

        if (claimedRewardsFromSubscan.length) {
          setTotalClaimedReward(totalClaimedRewardAmount);

          return setClaimedRewardsInfo(claimedRewardsFromSubscan);
        } else {
          return setClaimedRewardsInfo(null);
        }
      }).catch(console.error);
  }, [chainName, address]);

  const formateDate = useCallback((date: number) => new Date(date * 1000).toLocaleDateString('en-US', dateOptions), [dateOptions]);

  const ascSortedRewards = useMemo(() => {
    if (!claimedRewardsInfo) {
      return undefined;
    }

    const sorted = [...claimedRewardsInfo];

    sorted.sort((a, b) => a.timeStamp - b.timeStamp);

    return sorted.map((reward) => {
      reward.date = formateDate(reward.timeStamp);

      return reward;
    });
  }, [formateDate, claimedRewardsInfo]);

  // sorted labels and rewards and removed duplicates dates and sum rewards on the same date
  const aggregatedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !decimal) {
      return;
    }

    const uDate = new Set();

    ascSortedRewards.forEach((item) => uDate.add(item.date));

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
    const thresholdDate = biggestDate - (ONE_DAY_IN_SECONDS * (DAYS_TO_SHOW + 2)); // +2 for buffer
    const filteredRewardsDetail = rewardsDetailInAWeek.filter(({ timeStamp }) => timeStamp >= thresholdDate);

    return filteredRewardsDetail.reverse();
  }, [ascSortedRewards, formateDate, pageIndex, weeksRewards]);

  useEffect(() => {
    if (!aggregatedRewards?.length) {
      return;
    }

    const rewardPeriods = [];
    const sliced: [string[], string[]][] = [];

    // Group data into DAYS_TO_SHOW periods starting from the most recent date
    for (let i = aggregatedRewards.length - 1; i >= 0; i -= DAYS_TO_SHOW) {
      const startIndex = Math.max(0, i - DAYS_TO_SHOW + 1);
      const endIndex = i + 1;

      rewardPeriods.push(aggregatedRewards.slice(startIndex, endIndex));
    }

    rewardPeriods.length > 0 && rewardPeriods.forEach((period) => {
      const periodRewardsAmount: string[] = [];
      const periodRewardsLabel: string[] = [];

      // Fill in the DAYS_TO_SHOW period
      for (let i = 0; i < DAYS_TO_SHOW; i++) {
        if (period[i]?.date) {
          periodRewardsAmount.push(period[i].amountInHuman);
          // Remove month name from the formatted date before adding to label
          const dateWithoutMonth = formateDate(period[i].timestamp).replace(/^[A-Za-z]{3}\s/, '');

          periodRewardsLabel.push(dateWithoutMonth);
        } else {
          // Fill missing days with zeros
          periodRewardsAmount.push('0');

          // Calculate the missing date
          const lastAvailableIndex = period.length - 1;

          if (lastAvailableIndex >= 0) {
            const baseDate = new Date(period[lastAvailableIndex].timestamp * 1000);
            const missingDate = new Date(baseDate.setDate(baseDate.getDate() + (i - lastAvailableIndex)));
            // Format the missing date without month name
            // Remove month name from the formatted date before adding to label
            const dateWithoutMonth = formateDate(missingDate.getTime() / 1000).replace(/^[A-Za-z]{3}\s/, '');

            periodRewardsLabel.push(dateWithoutMonth);
          } else {
            periodRewardsLabel.push('');
          }
        }
      }

      sliced.push([periodRewardsAmount, periodRewardsLabel]);
    });

    setDataToShow(sliced);
    setWeekRewards(rewardPeriods);
  }, [aggregatedRewards, formateDate]);

  const dateInterval = useMemo(() => {
    if (!dataToShow?.length || !weeksRewards?.length) {
      return undefined;
    }

    const currentPeriodData = weeksRewards[pageIndex];

    if (!currentPeriodData?.length) {
      return undefined;
    }

    // Get the first and last dates of the current week
    const firstDate = new Date(currentPeriodData[0].timestamp * 1000);
    const lastDate = new Date(currentPeriodData[currentPeriodData.length - 1].timestamp * 1000);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const firstMonth = monthNames[firstDate.getMonth()];
    const lastMonth = monthNames[lastDate.getMonth()];
    const firstDay = firstDate.getDate();
    const lastDay = lastDate.getDate();

    // If same month, show like "Dec 1 - 10"
    if (firstMonth === lastMonth) {
      return `${firstMonth} ${firstDay} - ${lastDay}`;
    }

    // If different months, show like "Dec 25 - Jan 5"
    return `${firstMonth} ${firstDay} - ${lastMonth} ${lastDay}`;
  }, [dataToShow, weeksRewards, pageIndex]);

  const chartOptions = {
    aspectRatio: 1.4,
    onHover: (_: ChartEvent, activeElements: ActiveElement[], chart: Chart) => {
      if (activeElements.length > 0) {
        // A bar is being hovered
        const hoveredIndex = activeElements[0].index;
        const dataset = chart.data.datasets[0];

        // Get the date label for the hovered bar (this is the date without month)
        const hoveredDateLabel = chart.data.labels?.[hoveredIndex] as string;

        // Find corresponding item(s) in descSortedRewards
        const correspondingRewards = descSortedRewards?.filter((reward) => {
        // Remove month from reward.date to match the chart label
          const rewardDateWithoutMonth = reward.date?.replace(/^[A-Za-z]{3}\s/, '');

          return rewardDateWithoutMonth === hoveredDateLabel;
        });

        const matchingReward = correspondingRewards?.[0];

        expand(matchingReward ? JSON.stringify(matchingReward) : undefined);

        // Set colors: hovered bar gets hover color, others get semi-transparent
        dataset.backgroundColor = dataset.data.map((_, index: number) =>
          index === hoveredIndex ? '#809ACB' : '#596AFF80'
        );
      } else {
        // No bar is being hovered - reset all bars to normal color
        const dataset = chart.data.datasets[0];

        expand(undefined); // Reset detail when no bar is hovered
        dataset.backgroundColor = '#596AFF'; // Normal color for all bars
      }

      // Update the chart without animation for smooth effect
      chart.update('none');
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    responsive: true,
    scales: {
      topAxis: {
        grid: {
          color: 'transparent',
          drawOnChartArea: false,
          drawTicks: true,
          tickColor: 'transparent'
        },
        labels: dataToShow?.[pageIndex][0] || [],
        position: 'top',
        ticks: {
          color: theme.palette.text.highlight,
          font: { family: 'Inter', size: 12, weight: 'bold' }
        }
      },
      x: {
        grid: {
          borderColor: 'transparent',
          color: 'transparent',
          tickColor: 'transparent'
        },
        ticks: { color: theme.palette.text.highlight, font: { family: 'Inter', size: 12, weight: 'bold' } }
      },
      y: {
        display: false, // Hide y-axis completely
        grid: {
          drawBorder: false // Remove y-axis border
        },
        ticks: {
          display: false
        }
      }
    }
  } as unknown as PluginChartOptions<'bar'>;

  const chartData: ChartData<'bar', string[] | undefined, string> = {
    datasets: [
      {
        backgroundColor: '#596AFF',
        barThickness: 28,
        borderRadius: 12,
        borderSkipped: false,
        data: dataToShow?.[pageIndex][0],
        hoverBackgroundColor: '#809ACB',
        label: token
      }
    ],
    labels: dataToShow?.[pageIndex][1]
  };

  const onNextPeriod = useCallback(() => {
    pageIndex && setPageIndex(pageIndex - 1);
  }, [pageIndex]);

  const onPreviousPeriod = useCallback(() => {
    dataToShow && pageIndex !== (dataToShow.length - 1) && setPageIndex(pageIndex + 1);
  }, [dataToShow, pageIndex]);

  return {
    chartData,
    chartOptions,
    dateInterval,
    descSortedRewards,
    detail,
    expand,
    onNextPeriod,
    onPreviousPeriod,
    totalClaimedReward
  };
}
