// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
// @ts-nocheck
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description to show rewards chart
 * */
import { faChartSimple } from '@fortawesome/free-solid-svg-icons';
import { ExpandMore as ExpandMoreIcon, KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Typography, useTheme } from '@mui/material';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import { ModalTitle } from '@polkadot/extension-polkagate/src/fullscreen/stake/solo/commonTasks/configurePayee';
import { BN, BN_ZERO } from '@polkadot/util';

import { ChainLogo, Identity, PButton, Popup, Progress } from '../../../../components';
import { useApi, useChain, useChainName, useDecimal, useIsExtensionPopup, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand } from '../../../../partials';
import getRewardsSlashes from '../../../../util/api/getRewardsSlashes';
import { MAX_REWARDS_TO_SHOW } from '../../../../util/constants';
import type { RewardInfo, SubscanRewardInfo } from '../../../../util/types';
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
  pageIndex: number;
  dataToShow: [string[], string[]][] | undefined;
  nextPrevWeek: (next: boolean) => string | undefined;
}

interface ChartBodyProps extends ArrowsProps {
  data: {
    datasets: {
      backgroundColor: string;
      barThickness: number;
      borderColor: string;
      borderRadius: number;
      borderWidth: number;
      data: string[] | undefined;
      label: string | undefined;
    }[];
    labels: string[] | undefined;
  };
  options: {
    aspectRatio: number;
    plugins: {
      legend: {
        display: boolean;
      };
      tooltip: {
        backgroundColor: string;
        bodyColor: string;
        bodyFont: {
          displayColors: boolean;
          family: string;
          size: number;
          weight: string;
        };

        displayColors: boolean;
        titleColor: string;
      };
    };
    responsive: boolean;
  };
  descSortedRewards: RewardInfo[] | undefined;
  handleAccordionChange: (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  expanded: number;
  api: ApiPromise | undefined;
  decimal: number | undefined;
  chain: Chain | null | undefined;
  token: string | undefined;
}
interface Props {
  api?: ApiPromise | undefined;
  chain?: Chain;
  chainName?: string | undefined;
  address?: string;
  decimal?: number | undefined
  rewardDestinationAddress: string | undefined;
  token?: string
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
}

const Arrows = ({ dataToShow, nextPrevWeek, onNext, onPrevious, pageIndex }: ArrowsProps) => {
  const { t } = useTranslation();

  return (
    <Grid container justifyContent='space-between' m='auto' width='96%'>
      <Grid alignItems='center' container item justifyContent='flex-start' maxWidth='48%' onClick={onPrevious} sx={{ cursor: pageIndex === dataToShow?.length - 1 ? 'default' : 'pointer' }} width='fit_content'>
        <KeyboardDoubleArrowLeftIcon sx={{ color: pageIndex === dataToShow?.length - 1 ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '28px', ml: '3px', mr: '7px', my: 'auto', width: '1px' }} />
        <Grid container direction='column' textAlign='left' item xs={7}>
          <Typography color={pageIndex === dataToShow?.length - 1 ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400}>{t('Previous')}</Typography>
          <Typography color={pageIndex === dataToShow?.length - 1 ? 'secondary.contrastText' : 'text.primary'} fontSize='12px' fontWeight={300}>{nextPrevWeek(false)}</Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' maxWidth='48%' onClick={onNext} sx={{ cursor: pageIndex === 0 ? 'default' : 'pointer' }} width='fit_content'>
        <Grid container direction='column' item textAlign='right' xs={7}>
          <Typography color={pageIndex === 0 ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400}>{t('Next')}</Typography>
          <Typography color={pageIndex === 0 ? 'secondary.contrastText' : 'text.primary'} fontSize='12px' fontWeight={300}>{nextPrevWeek(true)}</Typography>
        </Grid>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '28px', ml: '7px', mr: '3px', my: 'auto', width: '1px' }} />
        <KeyboardDoubleArrowRightIcon sx={{ color: pageIndex === 0 ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
      </Grid>
    </Grid>
  );
};

const ChartBody = ({ api, chain, data, dataToShow, decimal, descSortedRewards, expanded, handleAccordionChange, nextPrevWeek, onNext, onPrevious, options, pageIndex, token }: ChartBodyProps) => {
  const { t } = useTranslation();
  const isExtensionPopup = useIsExtensionPopup();

  return (
    <>
      <Arrows
        dataToShow={dataToShow}
        nextPrevWeek={nextPrevWeek}
        onNext={onNext}
        onPrevious={onPrevious}
        pageIndex={pageIndex}
      />
      <Grid item sx={{ p: '5px 10px 20px' }} xs={12}>
        <Bar data={data} options={options} />
      </Grid>
      <Grid container sx={{ borderBottom: '2px solid', borderBottomColor: 'secondary.light', m: 'auto', textAlign: 'left', width: '92%' }}>
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
      <Grid container sx={{ '> .MuiPaper-root': { backgroundImage: 'none', boxShadow: 'none' }, '> .MuiPaper-root::before': { bgcolor: 'transparent' }, maxHeight: parent.innerHeight - (isExtensionPopup ? 450 : 588), overflowX: 'hidden', overflowY: 'scroll' }}>
        {descSortedRewards?.length
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
                      {amountToHuman(d.amount, decimal, 4)} {` ${token || ''}`}
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Grid alignItems='center' container height='50px' m='auto' width='92%'>
                    <Typography fontSize='14px' fontWeight={400} textAlign='center' width='35%'>
                      {t('Received from')}:
                    </Typography>
                    <Grid item width='65%'>
                      {chain && <Identity
                        address={d.validator}
                        api={api}
                        chain={chain as any}
                        formatted={d.validator}
                        identiconSize={30}
                        showSocial={false}
                        style={{ fontSize: '14px' }}
                        withShortAddress
                      />}
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
    </>
  );
};

export default function RewardsDetail({ address, api, chain, chainName, decimal, rewardDestinationAddress, setShow, show, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtensionPopup = useIsExtensionPopup();

  const theme = useTheme();
  const _api = useApi(address, api);
  const _chain = useChain(address, chain);
  const _chainName = useChainName(address) || chainName;
  const _decimal = useDecimal(address) || decimal;
  const _token = useToken(address) || token;

  const [rewardsInfo, setRewardsInfo] = useState<RewardInfo[]>();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [mostPrize, setMostPrize] = useState<number>(0);
  const [dataToShow, setDataToShow] = useState<[string[], string[]][]>();
  const [weeksRewards, setWeekRewards] = useState<{ amount: BN, amountInHuman: string, date: string, timestamp: number, }[][]>();

  const [expanded, setExpanded] = useState<number>(-1);

  const dateOptions = useMemo(() => ({ day: 'numeric', month: 'short' }), []);
  const weekDaysShort = ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.', 'Sat.'];

  const formateDate = useCallback((date: number) => {
    return new Date(date * 1000).toLocaleDateString('en-US', dateOptions);
  }, [dateOptions]);

  const ascSortedRewards = useMemo(() => {
    const sorted = rewardsInfo && [...rewardsInfo];

    sorted?.sort((a, b) => a.timeStamp - b.timeStamp);

    const newSorted = sorted?.map((reward) => {
      reward.date = formateDate(reward.timeStamp);

      return reward;
    });

    return newSorted;
  }, [formateDate, rewardsInfo]);

  // sorted labels and rewards and removed duplicates dates and sum rewards on the same date
  const aggregatedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !_decimal) {
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
      temp[relatedDateIndex].amountInHuman = amountToHuman(temp[relatedDateIndex].amount, _decimal);
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

    setMostPrize(Number(amountToHuman(estimatedMostPrize, _decimal)));

    return temp;
  }, [ascSortedRewards, _decimal, formateDate]);

  const descSortedRewards = useMemo(() => {
    if (!ascSortedRewards?.length || !weeksRewards?.length) {
      return;
    }

    const availableDates = weeksRewards[pageIndex].map((item) => formateDate(item.timestamp));
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
      if (new Date(aggregatedRewards[i].timestamp * 1000).getDay() === 0) {
        aWeekRewards.push(aggregatedRewards.slice(i, i + 7));
        counter = i;
      }

      if (i === 0 && new Date(aggregatedRewards[i].timestamp * 1000).getDay() !== 0) {
        const cutIndex = counter > 0 ? counter : aggregatedRewards.length - 1;

        aWeekRewards.push(aggregatedRewards.slice(0, cutIndex || 1));
      }
    }

    aWeekRewards.length > 0 && aWeekRewards.forEach((week, index) => {
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
    rewardDestinationAddress && _chainName && getRewardsSlashes(_chainName, 0, MAX_REWARDS_TO_SHOW, String(rewardDestinationAddress)).then((r) => {
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

      if (rewardsFromSubscan?.length) {
        return setRewardsInfo(rewardsFromSubscan);
      }
    });
  }, [_chainName, rewardDestinationAddress]);

  const handleAccordionChange = useCallback((panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : -1);
  }, []);

  const nextPrevWeek = (next: boolean) => {
    if (!dataToShow?.length || !weeksRewards?.length) {
      return;
    }

    const start = dataToShow[next ? pageIndex - 1 : pageIndex + 1] && dataToShow[next ? pageIndex - 1 : pageIndex + 1][1][0];
    const end = dataToShow[next ? pageIndex - 1 : pageIndex + 1] && dataToShow[next ? pageIndex - 1 : pageIndex + 1][1][6];

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
          label: function (TooltipItem: string | { label: string }[] | undefined) {
            if (!dataToShow || !TooltipItem) {
              return;
            }

            return `${TooltipItem.formattedValue} ${_token}`;
          },
          title: function (TooltipItem: string | { label: string }[] | undefined) {
            if (!dataToShow || !TooltipItem || !_token) {
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
        label: _token
      }
    ],
    labels: dataToShow && dataToShow[pageIndex][1]
  };

  const backToStakingHome = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const onNext = useCallback(() => {
    pageIndex && setPageIndex(pageIndex - 1);
  }, [pageIndex]);

  const onPrevious = useCallback(() => {
    dataToShow && pageIndex !== (dataToShow.length - 1) && setPageIndex(pageIndex + 1);
  }, [dataToShow, pageIndex]);

  return (

    <>
      {isExtensionPopup
        ? <Popup show={show}>
          <HeaderBrand
            onBackClick={backToStakingHome}
            shortBorder
            showBackArrow
            showClose
            text={t('Received Rewards')}
          />
          {descSortedRewards && _decimal && mostPrize
            ? <>
              <Grid container justifyContent='center'>
                <Grid item>
                  <ChainLogo genesisHash={_chain?.genesisHash} size={31} />
                </Grid>
                <Typography fontSize='20px' fontWeight={400} lineHeight='35px' pl='8px'>
                  {_token}
                </Typography>
              </Grid>
              <ChartBody
                api={_api}
                chain={_chain}
                data={data}
                dataToShow={dataToShow}
                decimal={_decimal}
                descSortedRewards={descSortedRewards}
                expanded={expanded}
                handleAccordionChange={handleAccordionChange}
                nextPrevWeek={nextPrevWeek}
                onNext={onNext}
                onPrevious={onPrevious}
                options={options}
                pageIndex={pageIndex}
                token={_token}
              />
              <PButton _onClick={backToStakingHome} text={t('Back')} />
            </>
            : <Progress pt='120px' size={125} title={t('Loading rewards...')} type='grid' />
          }
        </Popup>
        : <DraggableModal minHeight={650} onClose={backToStakingHome} open={show}>
          {descSortedRewards && _decimal && mostPrize
            ? <>
              <ModalTitle
                icon={faChartSimple}
                onCancel={backToStakingHome}
                step={1}
                text={t('Pool Rewards')}
              />
              <div style={{ marginTop: '20px' }} />
              <ChartBody
                api={_api}
                chain={_chain}
                data={data}
                dataToShow={dataToShow}
                decimal={_decimal}
                descSortedRewards={descSortedRewards}
                expanded={expanded}
                handleAccordionChange={handleAccordionChange}
                nextPrevWeek={nextPrevWeek}
                onNext={onNext}
                onPrevious={onPrevious}
                options={options}
                pageIndex={pageIndex}
                token={_token}
              />
            </>
            : <Progress pt={'220px'} size={125} title={t('Loading rewards...')} type='grid' />
          }
        </DraggableModal>
      }
    </>

  );
}
