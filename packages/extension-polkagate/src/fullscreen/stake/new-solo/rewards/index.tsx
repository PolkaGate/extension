// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseStakingRewards } from '../../../../hooks/useStakingRewards3';

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Container, Skeleton, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import { AssetLogo } from '../../../../components';
import getLogo2 from '../../../../util/getLogo2';
import { type PopupOpener, StakingPopUps } from '../../util/utils';
import RewardConfigureButton from '../components/RewardConfigureButton';

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
}

const RewardSetting = ({ genesisHash, popupOpener, token }: RewardSettingProps) => {
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', m: 0, width: 'fit-content' }}>
      <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '10px', display: 'flex', flexDirection: 'row', gap: '6px', p: '6px', pr: '10px', width: 'fit-content' }}>
        <AssetLogo assetSize='24px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
        <Typography color='text.primary' textTransform='uppercase' variant='B-2'>
          {token}
        </Typography>
      </Container>
      <RewardConfigureButton onClick={popupOpener(StakingPopUps.REWARD_DESTINATION_CONFIG)} />
    </Container>
  );
};

interface ChartHeaderProps extends RewardSettingProps {
  rewardInfo: UseStakingRewards;
}

const ChartHeader = ({ genesisHash, popupOpener, rewardInfo, token }: ChartHeaderProps) => {
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
      <Bar data={rewardInfo.chartData} id='myCanvas' options={{ ...rewardInfo.chartOptions, maintainAspectRatio: false }} style={{ backgroundColor: '#05091C', borderRadius: '14px', padding: '4px' }} />
    </Box>
  );
};

export default function Rewards ({ genesisHash, popupOpener, rewardInfo, token }: ChartHeaderProps) {
  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '18px', p: '18px', pr: 0 }}>
      <Stack direction='column' sx={{ bgcolor: '#1B133C', borderRadius: '18px', width: '533px' }}>
        <ChartHeader
          genesisHash={genesisHash}
          popupOpener={popupOpener}
          rewardInfo={rewardInfo}
          token={token}
        />
        <RewardChart rewardInfo={rewardInfo} />
      </Stack>
    </Container>
  );
}
