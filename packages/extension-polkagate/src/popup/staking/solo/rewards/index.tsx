// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description to show rewards chart
 * */
import { ExpandMore as ExpandMoreIcon, KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
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

const MAX_REWARDS_INFO_TO_SHOW = 20;
const MAX_CHUNK_LENGTH = 4;

function sliceIntoChunks(arr: string[]) {
  const res = [];

  const reveresedArr = [...arr].reverse();

  for (let i = 0; i < reveresedArr.length; i += MAX_CHUNK_LENGTH) {
    const chunk = reveresedArr.slice(i, i + MAX_CHUNK_LENGTH);

    res.push(chunk.reverse());
  }

  return res;
}

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

  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');
  const decimal = api && api.registry.chainDecimals[0];
  const token = api && api.registry.chainTokens[0];
  const [expanded, setExpanded] = useState<number>(-1);

  const formateDate = (date: number) => {
    const options = { day: 'numeric', month: 'short' };

    return new Date(date * 1000).toLocaleDateString('en-GB', options);
  };

  const descSortedRewards = useMemo(() => {
    const sorted = rewardsInfo && [...rewardsInfo];

    sorted?.sort((a, b) => b.era - a.era);

    return sorted;
  }, [rewardsInfo]);

  const ascSortedRewards = useMemo(() => {
    const sorted = rewardsInfo && [...rewardsInfo];

    sorted?.sort((a, b) => a.era - b.era);

    const newSorted = sorted?.map((reward) => {
      reward['date'] = formateDate(reward.timeStamp);

      return reward;
    });

    return newSorted;
  }, [rewardsInfo]);

  const ascSortedLabels = useMemo(() => {
    const uDate = new Set();

    ascSortedRewards?.forEach((item) => {
      uDate.add(item.date);
    });

    return Array.from(uDate) as string[];
  }, [ascSortedRewards]);

  const labelsToShow = useMemo(() => {
    if (!ascSortedLabels?.length) {
      return;
    }

    return sliceIntoChunks(ascSortedLabels);
  }, [ascSortedLabels]);

  const aggregatedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !ascSortedLabels?.length) {
      return;
    }

    const tempToHuman: string[] = [];
    const temp = new Array(ascSortedLabels.length).fill(BN_ZERO) as BN[];
    let index = 0;

    ascSortedRewards.forEach((item) => {
      if (item.date === ascSortedLabels[index]) {
        temp[index] = temp[index].add(item.amount);
        tempToHuman[index] = amountToHuman(temp[index], decimal);
      } else {
        index++;
        temp[index] = temp[index].add(item.amount);
        tempToHuman[index] = amountToHuman(temp[index], decimal);
      }
    });

    return sliceIntoChunks(tempToHuman);
    // return temp;
  }, [ascSortedLabels, ascSortedRewards, decimal]);

  const handleAccordionChange = useCallback((panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : -1);
  }, []);

  const backToStakingHome = useCallback(() => {
    history.push({
      pathname: `/solo/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const onPrevious = useCallback(() => {
    pageIndex && setPageIndex(pageIndex - 1);
  }, [pageIndex]);

  const onNext = useCallback(() => {
    aggregatedRewards && pageIndex !== (aggregatedRewards.length - 1) && setPageIndex(pageIndex + 1);
  }, [aggregatedRewards, pageIndex]);

  const dateRatio = (next?: boolean): string | undefined => {
    return labelsToShow && labelsToShow[(next ? pageIndex + 1 : pageIndex - 1)] && `${labelsToShow[(next ? pageIndex + 1 : pageIndex - 1)][0]} - ${labelsToShow[(next ? pageIndex + 1 : pageIndex - 1)].at(-1)}`;
  };

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
          size: 14,
          weight: 'bold'
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
        ticks: { color: theme.palette.text.primary }
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
        data: aggregatedRewards && aggregatedRewards[pageIndex],
        label: token
      }
    ],
    labels: labelsToShow && labelsToShow[pageIndex]
  };

  const Arrows = ({ onNext, onPrevious }: ArrowsProps) => (
    <Grid container m='auto' width='92%'>
      <Grid alignItems='center' container item justifyContent='flex-start' xs={6}>
        <IconButton onClick={onNext} size='medium' sx={{ p: 0 }}>
          <KeyboardDoubleArrowLeftIcon sx={{ color: 'secondary.light', fontSize: '25px' }} />
        </IconButton>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '28px', ml: '3px', mr: '7px', my: 'auto', width: '1px' }} />
        <Grid container direction='column' item xs={7}>
          <Typography color='secondary.light' fontSize='14px' fontWeight={400}>{t<string>('Previous')}</Typography>
          <Typography fontSize='12px' fontWeight={300}>{dateRatio(true)}</Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' xs={6}>
        <Grid container direction='column' item textAlign='right' xs={7}>
          <Typography color='secondary.light' fontSize='14px' fontWeight={400}>{t<string>('Next')}</Typography>
          <Typography fontSize='12px' fontWeight={300}>{dateRatio(false)}</Typography>
        </Grid>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '28px', ml: '7px', mr: '3px', my: 'auto', width: '1px' }} />
        <IconButton onClick={onPrevious} size='medium' sx={{ p: 0 }}>
          <KeyboardDoubleArrowRightIcon sx={{ color: 'secondary.light', fontSize: '25px' }} />
        </IconButton>
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
      {descSortedRewards && decimal
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
              {descSortedRewards?.slice(0, MAX_REWARDS_INFO_TO_SHOW).map((d, index: number) =>
                <>
                  <Accordion disableGutters expanded={expanded === index} key={index} onChange={handleAccordionChange(index)} sx={{ bgcolor: 'transparent', flexGrow: 1, fontSize: 12 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'background.paper', height: '35px', m: 'auto', minHeight: '35px', width: '92%' }}>
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
                        <Typography fontSize='14px' fontWeight={400} pr='15px' width='35%'>
                          {t('Received from')}:
                        </Typography>
                        <Grid item width='65%'>
                          <Identity address={d.validator} api={api} chain={chain} formatted={d.validator} identiconSize={35} showSocial style={{ fontSize: '14px' }} withShortAddress />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                  <Divider sx={{ bgcolor: 'secondary.light', height: '1.5px', m: 'auto', width: '92%' }} />
                </>
              )}
            </Grid>
            <PButton _onClick={backToStakingHome} text={t<string>('Back')} />
          </>)
        : <Progress pt='120px' size={125} title={t<string>('Loading rewards...')} />
      }
    </>
  );
}
