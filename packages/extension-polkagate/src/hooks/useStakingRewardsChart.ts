// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActiveElement, BubbleDataPoint, Chart, ChartData, ChartEvent, ChartTypeRegistry, PluginChartOptions, Point } from 'chart.js';
import type { ClaimedRewardInfo, SubscanClaimedRewardInfo } from '../util/types';

import { useTheme } from '@mui/material';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { amountToHuman } from '../util';
import { getNominationPoolsClaimedRewards } from '../util/api';
import getRewardsSlashes from '../util/api/getRewardsSlashes';
import { MAX_HISTORY_RECORD_TO_SHOW } from '../util/constants';
import useChainInfo from './useChainInfo';

// Register Chart.js components for bar charts
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

/**
 * Creates a linear gradient for chart bars
 * @param ctx - Canvas rendering context
 * @param element - Element with position and size properties
 * @param isHover - Whether this is for hover state (changes colors)
 * @returns Gradient or fallback color string
 */
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

type RewardStatus = 'loading' | 'error' | 'ready';
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
  status: RewardStatus;
}

/**
 * Custom hook for managing staking rewards data and chart configuration
 * @param address - The address to fetch rewards for
 * @param genesisHash - The chain genesis hash identifier
 * @param type - Type of staking: 'solo' or 'pool'
 * @param isFullScreen - Whether the chart is displayed in full screen mode
 * @returns Object containing chart data, options, and control functions
 */
export default function useStakingRewardsChart (address: string | undefined, genesisHash: string | undefined, type: 'solo' | 'pool', isFullScreen?: boolean): UseStakingRewards {
  const theme = useTheme();
  const { chainName, decimal, token } = useChainInfo(genesisHash, true);

  // Determine how many days to show based on display mode
  const INTERVAL_PERIOD = useMemo(() => isFullScreen ? 15 : DAYS_TO_SHOW, [isFullScreen]);

  // State for storing raw claimed rewards data from API
  const [claimedRewardsInfo, setClaimedRewardsInfo] = useState<ClaimedRewardInfo[] | null | undefined>();
  // State for storing rewards grouped by time periods (weeks/intervals)
  const [weeksRewards, setWeekRewards] = useState<{ amount: BN, amountInHuman: string, date: string, timestamp: number, }[][]>();
  // Current page/period index for pagination
  const [pageIndex, setPageIndex] = useState<number>(0);
  // Processed data ready for chart display: [amounts[], labels[]][]
  const [dataToShow, setDataToShow] = useState<[string[], string[]][]>();
  const [totalClaimedReward, setTotalClaimedReward] = useState<BN | undefined>(undefined);
  // Currently selected/hovered reward detail
  const [detail, expand] = useState<string | undefined>(undefined);

  // Date formatting options for consistent display
  const dateOptions = useMemo((): Intl.DateTimeFormatOptions => ({ day: 'numeric', month: 'short' }), []);

  /**
   * Effect: Fetch rewards data from Subscan API when address or chain changes
   * Handles both solo staking and nomination pool rewards
   */
  useEffect((): void => {
    if (!address || !chainName) {
      return;
    }

    // Choose Subscan API endpoint based on staking type
    (type === 'solo'
      ? getRewardsSlashes(chainName, String(address), 'claimed')
      : getNominationPoolsClaimedRewards(chainName, String(address), MAX_HISTORY_RECORD_TO_SHOW))
      .then((r) => {
        const list = r?.data.list as SubscanClaimedRewardInfo[];
        let totalClaimedRewardAmount = BN_ZERO;

        // Transform Subscan API data into internal format and calculate total
        const claimedRewardsFromSubscan: ClaimedRewardInfo[] | undefined = list?.map((i: SubscanClaimedRewardInfo): ClaimedRewardInfo => {
          const amount = new BN(i.amount);
          // Extract address based on staking type (solo uses validator, pool uses account)
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
        }

        // No rewards found - set to null (different from undefined/loading)
        return setClaimedRewardsInfo(null);
      }).catch(console.error);
  }, [chainName, address, type]);

  // Helper function to format timestamps as readable dates
  const formateDate = useCallback((date: number) => new Date(date * 1000).toLocaleDateString('en-US', dateOptions), [dateOptions]);

  /**
   * Memoized computation: Sort rewards by date (ascending) and add formatted dates
   * This creates the base sorted list for all further processing
   */
  const ascSortedRewards = useMemo(() => {
    if (!claimedRewardsInfo) {
      return undefined;
    }

    const sorted = [...claimedRewardsInfo];

    // Sort by timestamp ascending (oldest first)
    sorted.sort((a, b) => a.timeStamp - b.timeStamp);

    // Add formatted date string to each reward entry
    return sorted.map((reward) => {
      reward.date = formateDate(reward.timeStamp);

      return reward;
    });
  }, [formateDate, claimedRewardsInfo]);

  /**
   * Memoized computation: Aggregate rewards by date and fill gaps
   * This processes the sorted rewards to:
   * 1. Sum rewards that occurred on the same date
   * 2. Fill gaps between dates with zero amounts
   * 3. Convert amounts to human-readable format
   */
  const aggregatedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !decimal) {
      return;
    }

    // Get unique dates using Set to remove duplicates
    const uDate = new Set();

    ascSortedRewards.forEach((item) => uDate.add(item.date));

    const ascSortedLabels = Array.from(uDate) as string[];

    // Create template array with zero amounts for each unique date
    const temp = ascSortedLabels.map((uniqueDate) => ({
      amount: BN_ZERO,
      amountInHuman: undefined as unknown as string,
      date: uniqueDate,
      timestamp: undefined as unknown as number
    }));

    // Aggregate rewards by date
    ascSortedRewards.forEach((item) => {
      const relatedDateIndex = temp.findIndex((dateItem) => dateItem.date === item.date);

      // Sum amounts for the same date
      temp[relatedDateIndex].amount = temp[relatedDateIndex].amount.add(item.amount);
      temp[relatedDateIndex].timestamp = temp[relatedDateIndex].timestamp ?? new Date(item.timeStamp).getTime();

      // Determine decimal places based on amount size (larger amounts use fewer decimals)
      const adaptiveDecimalPoint = temp[relatedDateIndex].amount && decimal && (String(temp[relatedDateIndex].amount).length >= decimal - 1 ? 2 : 4);

      temp[relatedDateIndex].amountInHuman = amountToHuman(temp[relatedDateIndex].amount, decimal, adaptiveDecimalPoint);
    });

    // Fill gaps between dates with zero amounts to create continuous timeline
    for (let j = 0; j < temp.length; j++) {
      if (j + 1 === temp.length) {
        continue; // Skip last element
      }

      const firstRewardDate = new Date(temp[j].timestamp * 1000);
      const nextRewardDate = temp[j + 1].timestamp;
      const pnd = new Date(firstRewardDate.setDate(firstRewardDate.getDate() + 1));

      // If there's a gap between consecutive dates, insert a zero entry
      if (formateDate(pnd.getTime() / 1000) !== formateDate(nextRewardDate)) {
        temp.splice(j + 1, 0, { amount: BN_ZERO, amountInHuman: '0', date: formateDate(pnd.getTime() / 1000), timestamp: (pnd.getTime() / 1000) });
      }
    }

    return temp;
  }, [ascSortedRewards, decimal, formateDate]);

  /**
   * Memoized computation: Get rewards for current page/period in descending order
   * This filters the rewards to show only those in the currently selected time period
   */
  const descSortedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !weeksRewards?.length) {
      return;
    }

    // Get dates available in the current period
    const availableDates = weeksRewards[pageIndex].map((item) => formateDate(item.timestamp));
    const rewardsDetailInAWeek = ascSortedRewards.filter(({ date }) => availableDates.includes(date ?? ''));

    // Get the expected date range for this period from weeksRewards
    // This gives us the actual intended time range, not just the dates that happen to have rewards
    const currentPeriodData = weeksRewards[pageIndex];

    if (!currentPeriodData?.length) {
      return [];
    }

    // Calculate threshold based on the period's actual time range, not just the available rewards
    const periodStartTimestamp = Math.min(...currentPeriodData.map(({ timestamp }) => timestamp));
    const periodEndTimestamp = Math.max(...currentPeriodData.map(({ timestamp }) => timestamp));

    // Add buffer to account for timezone differences and ensure we don't miss edge cases
    const thresholdStartDate = periodStartTimestamp - (ONE_DAY_IN_SECONDS * 1); // 1 day buffer before period start
    const thresholdEndDate = periodEndTimestamp + (ONE_DAY_IN_SECONDS * 1); // 1 day buffer after period end

    // Filter rewards to only include those within the actual period time range
    // This prevents showing rewards from previous years that happen to match day/month
    const filteredRewardsDetail = rewardsDetailInAWeek.filter(({ timeStamp }) =>
      timeStamp >= thresholdStartDate && timeStamp <= thresholdEndDate
    );

    // Return in descending order (newest first) for display
    return filteredRewardsDetail.reverse();
  }, [ascSortedRewards, formateDate, pageIndex, weeksRewards]);

  /**
   * Effect: Process aggregated rewards into paginated periods for chart display
   * This creates the final data structure used by the chart component
   */
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

  /**
   * Memoized computation: Generate human-readable date range for current period
   * Creates strings like "Dec 1 - 10" or "Dec 25 - Jan 5"
   */
  const dateInterval = useMemo(() => {
    if (!dataToShow?.length || !weeksRewards?.length) {
      return undefined;
    }

    const currentPeriodData = weeksRewards[pageIndex];

    if (!currentPeriodData?.length) {
      return undefined;
    }

    // Get the first and last dates of the current period
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

  /**
   * Memoized chart configuration with interactive features
   * Handles hover effects, styling, and responsive behavior
   */
  const chartOptions = useMemo(() => ({
    aspectRatio: 1.4,
    /**
     * Custom hover handler that:
     * 1. Changes bar colors on hover
     * 2. Shows reward details for hovered date
     * 3. Resets colors when not hovering
     */
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
        display: false // Hide legend as it's not needed for single dataset
      },
      tooltip: {
        enabled: false // Disable default tooltips (using custom hover handler instead)
      }
    },
    responsive: true,
    scales: {
      // Top axis shows reward amounts above the bars
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
        labels: dataToShow?.[pageIndex][0], // Reward amounts
        position: 'top',
        ticks: {
          color: isFullScreen ? '#AA83DC' : theme.palette.text.highlight,
          font: { family: 'Inter', size: 12, weight: 'bold' }
        }
      },
      // X-axis shows date labels
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
      // Y-axis (hidden in extension mode, shown in fullscreen)
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

  /**
   * Memoized chart data configuration
   * Defines the dataset with styling and data for Chart.js
   */
  const chartData: ChartData<'bar', string[] | undefined, string> = useMemo(() => ({
    datasets: [
      {
        // Dynamic background color function that creates gradients for fullscreen mode
        backgroundColor: (context: { chart: ChartType, dataIndex: number }) => {
          const chart = context.chart;
          const { ctx } = chart;
          const meta = chart.getDatasetMeta(0);
          const element = meta.data[context.dataIndex] as unknown as GradientObject;

          if (!element || !isFullScreen) {
            return '#596AFF'; // Fallback color for extension mode
          }

          return createGradient(ctx, element, false);
        },
        barThickness: 28,
        borderRadius: 12,
        borderSkipped: false,
        data: dataToShow?.[pageIndex][0], // Reward amounts for current period
        // Hover color function (similar to backgroundColor but for hover state)
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
        label: token // Dataset label (token name)
      }
    ],
    labels: dataToShow?.[pageIndex][1] // Date labels for current period
  }), [dataToShow, isFullScreen, pageIndex, token]);

  // Navigation function: Move to next (more recent) period
  const onNextPeriod = useCallback(() => {
    pageIndex && setPageIndex(pageIndex - 1);
  }, [pageIndex]);

  // Navigation function: Move to previous (older) period
  const onPreviousPeriod = useCallback(() => {
    dataToShow && pageIndex !== (dataToShow.length - 1) && setPageIndex(pageIndex + 1);
  }, [dataToShow, pageIndex]);

  // Compute loading/error/ready status based on data state
  const status = useMemo((): RewardStatus => {
    if (claimedRewardsInfo === undefined) {
      return 'loading'; // Still fetching data
    }

    if (claimedRewardsInfo === null) {
      return 'error'; // No data found or API error
    }

    return 'ready'; // Data successfully loaded
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
