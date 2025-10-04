// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseStakingRewards } from '../../hooks/useStakingRewardsChart';
import type { ClaimedRewardInfo } from '../../util/types';

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Collapse, Container, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import { AssetLogo, DisplayBalance, Identity2, Motion, Progress } from '../../components';
import { useChainInfo, useTranslation } from '../../hooks';
import getLogo2 from '../../util/getLogo2';
import RewardConfigureButton from './new-solo/components/RewardConfigureButton';
import { type PopupOpener, StakingPopUps } from './util/utils';

interface WindowChangerProps {
  onNextPeriod: () => void;
  onPreviousPeriod: () => void;
  dateInterval: string | undefined;
}

const formatDateInterval = (interval: string) => {
  // Match patterns like "Jun 23 - Jul 7" or "Jun 23 - 29"
  const crossMonthPattern = /^(\w{3}) (\d{1,2}) - (\w{3}) (\d{1,2})$/;
  const sameMonthPattern = /^(\w{3}) (\d{1,2}) - (\d{1,2})$/;

  const crossMonthMatch = interval.match(crossMonthPattern);

  if (crossMonthMatch) {
    const [, month1, day1, month2, day2] = crossMonthMatch;

    return (
      <>
        <Typography color='#AA83DC' component='span' variant='H-2'>{month1}</Typography>
        <Typography color='text.primary' component='span' variant='H-2'>{` ${day1} - `}</Typography>
        <Typography color='#AA83DC' component='span' variant='H-2'>{month2}</Typography>
        <Typography color='text.primary' component='span' variant='H-2'>{` ${day2}`}</Typography>
      </>
    );
  }

  const sameMonthMatch = interval.match(sameMonthPattern);

  if (sameMonthMatch) {
    const [, month, day1, day2] = sameMonthMatch;

    return (
      <>
        <Typography color='#AA83DC' component='span' variant='H-2'>{month}</Typography>
        <Typography color='text.primary' component='span' variant='H-2'>{` ${day1} - ${day2}`}</Typography>
      </>
    );
  }

  // Fallback for unexpected formats
  return (
    <Typography color='text.primary' component='span' variant='H-2'>
      {interval}
    </Typography>
  );
};

const WindowChanger = ({ dateInterval, onNextPeriod, onPreviousPeriod }: WindowChangerProps) => {
  const chevronStyle = {
    ':hover': { color: '#EAEBF1' },
    backdropFilter: 'blur(20px)',
    borderRadius: '10px',
    boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
    color: '#AA83DC',
    cursor: 'pointer',
    fontSize: '30px'
  };

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', justifyContent: 'space-between', m: 0, minWidth: '190px', width: 'fit-content' }}>
      <ChevronLeft onClick={onPreviousPeriod} sx={chevronStyle} />
      {dateInterval
        ? formatDateInterval(dateInterval)
        : (
          <Skeleton
            animation='wave'
            height='30px'
            sx={{ borderRadius: '50px', fontWeight: 'bold', transform: 'none', width: '90px' }}
            variant='text'
          />
        )
      }
      <ChevronRight onClick={onNextPeriod} sx={chevronStyle} />
    </Container>
  );
};

interface RewardSettingProps {
  genesisHash: string | undefined;
  token: string | undefined;
  popupOpener: PopupOpener;
  type: 'solo' | 'pool';
}

const RewardSetting = ({ genesisHash, popupOpener, token, type }: RewardSettingProps) => {
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', m: 0, width: 'fit-content' }}>
      <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '10px', display: 'flex', flexDirection: 'row', gap: '6px', p: '6px', pr: '10px', width: 'fit-content' }}>
        <AssetLogo assetSize='24px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
        <Typography color='text.primary' textTransform='uppercase' variant='B-2'>
          {token}
        </Typography>
      </Container>
      {type === 'solo' &&
       <RewardConfigureButton onClick={popupOpener(StakingPopUps.REWARD_DESTINATION_CONFIG)} />
      }
    </Container>
  );
};

interface ChartHeaderProps extends RewardSettingProps {
  rewardInfo: UseStakingRewards;
}

const ChartHeader = ({ genesisHash, popupOpener, rewardInfo, token, type }: ChartHeaderProps) => {
  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'space-between', mb: '20px' }}>
      <WindowChanger
        dateInterval={rewardInfo.dateInterval}
        onNextPeriod={rewardInfo.onNextPeriod}
        onPreviousPeriod={rewardInfo.onPreviousPeriod}
      />
      <RewardSetting
        genesisHash={genesisHash}
        popupOpener={popupOpener}
        token={token}
        type={type}
      />
    </Container>
  );
};

interface RewardChartProps {
  rewardInfo: UseStakingRewards;
}

const RewardChart = ({ rewardInfo }: RewardChartProps) => {
  return (
    <Box sx={{ height: '253px', width: '533px' }}>
      <Bar
        data={rewardInfo.chartData}
        id='myCanvas'
        options={{ ...rewardInfo.chartOptions, maintainAspectRatio: false }}
        style={{ backgroundColor: '#05091C', borderRadius: '14px', padding: '4px' }}
      />
    </Box>
  );
};

interface RewardChartItemProps {
  reward: ClaimedRewardInfo;
  genesisHash: string | undefined;
  onExpand: React.Dispatch<React.SetStateAction<string | undefined>>;
  isExpanded: boolean;
}

const RewardChartItem = ({ genesisHash, isExpanded, onExpand, reward }: RewardChartItemProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const handleExpand = useCallback(() => {
    onExpand((alreadyExpanded) => alreadyExpanded === JSON.stringify(reward) ? undefined : JSON.stringify(reward));
  }, [onExpand, reward]);

  return (
    <Collapse collapsedSize='48px' in={isExpanded} sx={{ bgcolor: '#060518', borderRadius: '14px', display: 'block' }}>
      <Container disableGutters onClick={handleExpand} sx={{ alignItems: 'center', bgcolor: '#060518', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '6px', pl: '18px', transition: 'all 150ms ease-out', width: '100%' }}>
        <Typography color='text.primary' textAlign='left' variant='B-2' width='40%'>
          {new Date(reward.timeStamp * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short', year: 'numeric' })}
        </Typography>
        <Typography color='text.secondary' textAlign='left' variant='B-2' width='15%'>
          {reward.era}
        </Typography>
        <DisplayBalance
          balance={reward.amount}
          decimal={decimal}
          decimalPoint={2}
          style={{
            color: theme.palette.text.primary,
            ...theme.typography['B-2'],
            textAlign: 'left',
            width: 'max-content'
          }}
          token={token}
        />
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#2D1E4A', borderRadius: '8px', height: '36px', width: '36px' }}>
          <ArrowDown2 color='#AA83DC' size='14' style={{ rotate: isExpanded ? '180deg' : 'none', transition: 'all 150ms ease-out' }} variant='Bold' />
        </Grid>
      </Container>
      <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#222540A6', borderRadius: '10px', display: 'flex', flexDirection: 'row', gap: '8px', m: '6px', p: '8px 12px', position: 'relative', width: 'calc(100% - 12px)' }}>
        <Typography color='#AA83DC' textAlign='left' variant='B-1' width='fit-content'>
          {t('Reward source')}
        </Typography>
        {reward.poolId
          ? <Typography color={theme.palette.text.primary} sx={{ pl: '15px' }} variant='H-4' width='fit-content'>
            {t('Pool #{{poolId}}', { poolId: reward.poolId })}
          </Typography>
          : <Identity2
            address={reward.address}
            charsCount={10}
            genesisHash={genesisHash ?? ''}
            identiconSize={24}
            style={{
              color: theme.palette.text.primary,
              variant: 'B-1',
              width: '330px'
            }}
            withShortAddress
            />}
      </Container>
    </Collapse>
  );
};

interface RewardTableProps {
  descSortedRewards: ClaimedRewardInfo[];
  genesisHash: string | undefined;
  expanded: string | undefined;
  onExpand: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const RewardTable = ({ descSortedRewards, expanded, genesisHash, onExpand }: RewardTableProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ gap: '10px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb: '8px', px: '12px', width: '100%' }}>
        <Typography color='text.secondary' textAlign='left' variant='B-1' width='48%'>
          {t('Date')}
        </Typography>
        <Typography color='text.secondary' textAlign='left' variant='B-1' width='22%'>
          {t('Era')}
        </Typography>
        <Typography color='text.secondary' textAlign='left' variant='B-1' width='30%'>
          {t('Reward')}
        </Typography>
      </Container>
      {descSortedRewards.map((reward, index) => {
        const isExpanded = expanded ? JSON.stringify(reward) === expanded : false;

        return (
          <RewardChartItem
            genesisHash={genesisHash}
            isExpanded={isExpanded}
            key={index}
            onExpand={onExpand}
            reward={reward}
          />
        );
      })}
    </Stack>
  );
};

export default function Rewards ({ genesisHash, popupOpener, rewardInfo, token, type }: ChartHeaderProps) {
  const { t } = useTranslation();

  return (
    <Motion variant='slide'>
      {
        !rewardInfo?.descSortedRewards
          ? (
            <Progress
              style={{ height: '310px' }}
              title={t('Loading rewards details')}
              withEllipsis
            />)
          : (
            <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '18px', p: '18px', pr: 0 }}>
              <Stack direction='column' sx={{ bgcolor: '#1B133C', borderRadius: '18px', width: '533px' }}>
                <ChartHeader
                  genesisHash={genesisHash}
                  popupOpener={popupOpener}
                  rewardInfo={rewardInfo}
                  token={token}
                  type={type}
                />
                <RewardChart rewardInfo={rewardInfo} />
              </Stack>
              <Grid container item sx={{ maxHeight: '324px', overflow: 'hidden', overflowY: 'auto', width: '482px' }}>
                <RewardTable
                  descSortedRewards={rewardInfo.descSortedRewards ?? []}
                  expanded={rewardInfo.detail}
                  genesisHash={genesisHash}
                  onExpand={rewardInfo.expand}
                />
              </Grid>
            </Container>)
      }
    </Motion>
  );
}
