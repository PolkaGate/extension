// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActiveElement, BubbleDataPoint, Chart, ChartData, ChartEvent, ChartTypeRegistry, PluginChartOptions, Point } from 'chart.js';
import type { ClaimedRewardInfo, SubscanClaimedRewardInfo } from '../util/types';

import { useTheme } from '@mui/material';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { getNominationPoolsClaimedRewards } from '../util/api';
import getRewardsSlashes from '../util/api/getRewardsSlashes';
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

interface GradientObject {
  x: number;
  width: number;
}

type ChartType = Chart<keyof ChartTypeRegistry, (number | [number, number] | Point | BubbleDataPoint | null)[], unknown>;

const createGradient = (ctx: CanvasRenderingContext2D, element: GradientObject, isHover: boolean) => {
  // Check if element and required properties exist
  if (!element || typeof element.x !== 'number' || typeof element.width !== 'number') {
    return '#DC45A0'; // Fallback solid color
  }

  const { width, x } = element;

  // Ensure values are finite numbers
  if (!isFinite(x) || !isFinite(width) || width <= 0) {
    return '#DC45A0'; // Fallback solid color
  }

  const gradient = ctx.createLinearGradient(x - width + 6, 1, x + width - 14, 0);

  const blueColor = isHover ? '#8A1AC7' : '#6E00B1';
  const redColor = isHover ? '#C849A8' : '#DC45A0';

  gradient.addColorStop(0, blueColor); // Bright pink at left
  gradient.addColorStop(0.5, redColor); // Mid pink-purple
  gradient.addColorStop(1, blueColor); // Deep purple at right

  return gradient;
};

export interface UseStakingRewards {
  chartData: ChartData<'bar', string[] | undefined, string>;
  dateInterval: string | undefined;
  descSortedRewards: ClaimedRewardInfo[] | undefined;
  onNextPeriod: () => void;
  onPreviousPeriod: () => void;
  chartOptions: PluginChartOptions<'bar'>;
  totalClaimedReward: BN | undefined;
  detail: string | undefined;
  expand: Dispatch<SetStateAction<string | undefined>>;
  status: 'loading' | 'error' | 'ready';
}

export default function useStakingRewards3 (address: string | undefined, genesisHash: string | undefined, type: 'solo' | 'pool', isFullScreen?: boolean): UseStakingRewards {
  const theme = useTheme();
  const { chainName, decimal, token } = useChainInfo(genesisHash, true);

  const INTERVAL_PERIOD = useMemo(() => isFullScreen ? 15 : DAYS_TO_SHOW, [isFullScreen]);

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

    (type === 'solo'
      ? getRewardsSlashes(chainName, String(address), 'claimed')
      : getNominationPoolsClaimedRewards(chainName, String(address), MAX_HISTORY_RECORD_TO_SHOW))
      .then((r) => {
        const list = r?.data.list as SubscanClaimedRewardInfo[];
        let totalClaimedRewardAmount = BN_ZERO;

        const claimedRewardsFromSubscan: ClaimedRewardInfo[] | undefined = list?.map((i: SubscanClaimedRewardInfo): ClaimedRewardInfo => {
          const amount = new BN(i.amount);
          const address = (type === 'solo' ? i.validator_stash : i.account_display.address) ?? '';

          totalClaimedRewardAmount = totalClaimedRewardAmount.add(amount);

          return {
            address,
            amount,
            era: i.era,
            event: i.event_id,
            poolId: i.pool_id,
            timeStamp: i.block_timestamp
          } as ClaimedRewardInfo;
        });

        if (claimedRewardsFromSubscan?.length) {
          setTotalClaimedReward(totalClaimedRewardAmount);

          return setClaimedRewardsInfo(claimedRewardsFromSubscan);
        } else {
          return setClaimedRewardsInfo(null);
        }
      }).catch(console.error);
  }, [chainName, address, type]);

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

      const adaptiveDecimalPoint = temp[relatedDateIndex].amount && decimal && (String(temp[relatedDateIndex].amount).length >= decimal - 1 ? 2 : 4);

      temp[relatedDateIndex].amountInHuman = amountToHuman(temp[relatedDateIndex].amount, decimal, adaptiveDecimalPoint);
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
    const thresholdDate = biggestDate - (ONE_DAY_IN_SECONDS * (INTERVAL_PERIOD + 2)); // +2 for buffer
    const filteredRewardsDetail = rewardsDetailInAWeek.filter(({ timeStamp }) => timeStamp >= thresholdDate);

    return filteredRewardsDetail.reverse();
  }, [INTERVAL_PERIOD, ascSortedRewards, formateDate, pageIndex, weeksRewards]);

  useEffect(() => {
    if (!aggregatedRewards?.length) {
      return;
    }

    const rewardPeriods = [];
    const sliced: [string[], string[]][] = [];

    // Group data into INTERVAL_PERIOD periods starting from the most recent date
    for (let i = aggregatedRewards.length - 1; i >= 0; i -= INTERVAL_PERIOD) {
      const startIndex = Math.max(0, i - INTERVAL_PERIOD + 1);
      const endIndex = i + 1;

      rewardPeriods.push(aggregatedRewards.slice(startIndex, endIndex));
    }

    rewardPeriods.length > 0 && rewardPeriods.forEach((period) => {
      const periodRewardsAmount: string[] = [];
      const periodRewardsLabel: string[] = [];

      // Fill in the INTERVAL_PERIOD period
      for (let i = 0; i < INTERVAL_PERIOD; i++) {
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
  }, [INTERVAL_PERIOD, aggregatedRewards, formateDate]);

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

  const chartOptions = useMemo(() => ({
    aspectRatio: 1.4,
    onHover: (_: ChartEvent, activeElements: ActiveElement[], chart: Chart) => {
      const meta = chart.getDatasetMeta(0);
      const ctx = chart.ctx;

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
        dataset.backgroundColor = dataset.data.map((_, index: number) => {
          const element = meta.data[index] as unknown as GradientObject;

          if (isFullScreen) {
            return index === hoveredIndex ? createGradient(ctx, element, true) : createGradient(ctx, element, false);
          }

          return index === hoveredIndex ? '#809ACB' : '#596AFF80';
        });
      } else {
        // No bar is being hovered - reset all bars to normal color
        const dataset = chart.data.datasets[0];

        expand(undefined); // Reset detail when no bar is hovered
        dataset.backgroundColor = dataset.data.map((_, index: number) => {
          const element = meta.data[index] as unknown as GradientObject;

          if (isFullScreen) {
            return createGradient(ctx, element, false);
          }

          return '#596AFF';
        });
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
        border: {
          dash: [2, 1],
          display: false
        },
        grid: {
          color: 'transparent',
          drawOnChartArea: false,
          drawTicks: true,
          tickColor: 'transparent'
        },
        labels: dataToShow?.[pageIndex][0] || [],
        position: 'top',
        ticks: {
          color: isFullScreen ? '#AA83DC' : theme.palette.text.highlight,
          font: { family: 'Inter', size: 12, weight: 'bold' }
        }
      },
      x: {
        border: {
          dash: [2, 1],
          display: false
        },
        grid: {
          color: isFullScreen ? '#2D1E4A59' : 'transparent'
        },
        ticks: {
          color: isFullScreen ? '#AA83DC' : theme.palette.text.highlight,
          font: { family: 'Inter', size: 12, weight: 'bold' }
        }
      },
      y: {
        border: {
          dash: [2, 1],
          display: false
        },
        display: !!isFullScreen, // Hide y-axis completely on extension mode
        grid: {
          color: isFullScreen ? '#2D1E4A59' : 'transparent'
        },
        ticks: {
          display: false
        }
      }
    }
  }), [dataToShow, descSortedRewards, isFullScreen, pageIndex, theme.palette.text.highlight]) as unknown as PluginChartOptions<'bar'>;

  const chartData: ChartData<'bar', string[] | undefined, string> = useMemo(() => ({
    datasets: [
      {
        backgroundColor: (context: { chart: ChartType, dataIndex: number }) => {
          const chart = context.chart;
          const { ctx } = chart;
          const meta = chart.getDatasetMeta(0);
          const element = meta.data[context.dataIndex] as unknown as GradientObject;

          if (!element || !isFullScreen) {
            return '#596AFF'; // Fallback color
          }

          return createGradient(ctx, element, false);
        },
        barThickness: 28,
        borderRadius: 12,
        borderSkipped: false,
        data: dataToShow?.[pageIndex][0],
        hoverBackgroundColor: (context: { chart: ChartType, dataIndex: number }) => {
          const chart = context.chart;
          const { ctx } = chart;
          const meta = chart.getDatasetMeta(0);
          const element = meta.data[context.dataIndex] as unknown as GradientObject;

          if (!element || !isFullScreen) {
            return '#809ACB'; // Fallback color
          }

          return createGradient(ctx, element, true);
        },
        label: token
      }
    ],
    labels: dataToShow?.[pageIndex][1]
  }), [dataToShow, isFullScreen, pageIndex, token]);

  const onNextPeriod = useCallback(() => {
    pageIndex && setPageIndex(pageIndex - 1);
  }, [pageIndex]);

  const onPreviousPeriod = useCallback(() => {
    dataToShow && pageIndex !== (dataToShow.length - 1) && setPageIndex(pageIndex + 1);
  }, [dataToShow, pageIndex]);

  const status = useMemo((): 'loading' | 'error' | 'ready' => {
    if (claimedRewardsInfo === undefined) {
      return 'loading';
    } else if (claimedRewardsInfo === null) {
      return 'error';
    } else {
      return 'ready';
    }
  }, [claimedRewardsInfo]);

  return {
    chartData,
    chartOptions,
    dateInterval,
    descSortedRewards,
    detail,
    expand,
    onNextPeriod,
    onPreviousPeriod,
    status,
    totalClaimedReward
  };
}
