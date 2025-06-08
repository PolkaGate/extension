// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ClaimedRewardInfo } from '../../util/types';

import { Collapse, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { ArrowDown2, ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { useNavigate, useParams } from 'react-router';

import { AssetLogo, BackWithLabel, FadeOnScroll, FormatBalance2, Identity2, Motion } from '../../components';
import { useBackground, useChainInfo, usePoolStakingInfo, useSelectedAccount, useStakingRewards3, useTranslation } from '../../hooks';
import { UserDashboardHeader } from '../../partials';
import getLogo2 from '../../util/getLogo2';
import Progress from './partial/Progress';
import StakingMenu from './partial/StakingMenu';

interface RewardChartHeaderProps {
  genesisHash: string | undefined;
  onNextPeriod: () => void;
  onPreviousPeriod: () => void;
  dateInterval: string | undefined;
}

const RewardChartHeader = ({ dateInterval, genesisHash, onNextPeriod, onPreviousPeriod }: RewardChartHeaderProps) => {
  const theme = useTheme();
  const { token } = useChainInfo(genesisHash, true);
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', my: '6px', px: '10px', width: '100%' }}>
      <Grid alignItems='center' container item sx={{ alignItems: 'center', columnGap: '4px', width: 'fit-content' }}>
        <AssetLogo assetSize='24px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
        <Typography color='text.primary' textTransform='uppercase' variant='B-3'>
          {token}
        </Typography>
      </Grid>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, width: '140px' }}>
        <ArrowLeft2 color={theme.palette.text.primary} onClick={onPreviousPeriod} size='18' style={{ cursor: 'pointer' }} />
        <Typography color='text.highlight' variant='B-2'>
          {dateInterval}
        </Typography>
        <ArrowRight2 color={theme.palette.text.primary} onClick={onNextPeriod} size='18' style={{ cursor: 'pointer' }} />
      </Container>
    </Container>
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
    <Collapse collapsedSize='44px' in={isExpanded} sx={{ bgcolor: '#060518', borderRadius: '14px', display: 'block', p: '4px' }}>
      <Container disableGutters onClick={handleExpand} sx={{ alignItems: 'center', bgcolor: '#060518', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '12px', pt: isExpanded ? '12px' : '8px', transition: 'all 150ms ease-out', width: '100%' }}>
        <Typography color='text.primary' textAlign='left' variant='B-2' width='40%'>
          {new Date(reward.timeStamp * 1000).toDateString()}
        </Typography>
        <Typography color='text.primary' textAlign='left' variant='B-2' width='15%'>
          {reward.era}
        </Typography>
        <FormatBalance2
          decimalPoint={2}
          decimals={[decimal ?? 0]}
          style={{
            color: theme.palette.text.primary,
            ...theme.typography['B-2'],
            textAlign: 'left',
            width: 'max-content'
          }}
          tokenColor={theme.palette.text.highlight}
          tokens={[token ?? '']}
          value={reward.amount}
        />
        <ArrowDown2 color={theme.palette.text.highlight} size='14' style={{ rotate: isExpanded ? '180deg' : 'none', transition: 'all 150ms ease-out' }} />
      </Container>
      <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#222540A6', borderRadius: '10px', display: 'flex', flexDirection: 'row', gap: '8px', p: '8px 12px', position: 'relative', width: '100%' }}>
        <Typography color='text.highlight' variant='B-1' width='fit-content'>
          {t('Received from')}:
        </Typography>
        <Identity2
          address={reward.address}
          genesisHash={genesisHash ?? ''}
          identiconSize={24}
          style={{
            color: theme.palette.text.primary,
            variant: 'B-1',
            width: '200px'
          }}
          withShortAddress
        />
      </Container>
    </Collapse>
  );
};

interface RewardChartTableProps {
  descSortedRewards: ClaimedRewardInfo[];
  genesisHash: string | undefined;
  expanded: string | undefined;
  onExpand: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const RewardChartTable = ({ descSortedRewards, expanded, genesisHash, onExpand }: RewardChartTableProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ gap: '4px', pb: '60px', pt: '10px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb: '8px', px: '12px', width: '100%' }}>
        <Typography color='text.highlight' textAlign='left' textTransform='uppercase' variant='S-1' width='45%'>
          {t('Date')}
        </Typography>
        <Typography color='text.highlight' textAlign='left' textTransform='uppercase' variant='S-1' width='20%'>
          {t('Era')}
        </Typography>
        <Typography color='text.highlight' textAlign='left' textTransform='uppercase' variant='S-1' width='35%'>
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

export default function StakingReward () {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedAccount = useSelectedAccount();
  const { genesisHash, type } = useParams<{ genesisHash: string; type: string }>();

  const poolStakingInfo = usePoolStakingInfo(selectedAccount?.address, type === 'pool' ? genesisHash : undefined);
  const rewardInfo = useStakingRewards3(selectedAccount?.address, genesisHash, type as 'solo' | 'pool');

  const onBack = useCallback(() => navigate('/' + type + '/' + genesisHash) as void, [genesisHash, navigate, type]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            style={{ pb: 0 }}
            text={t('Received Rewards')}
          />
          <Stack direction='column' ref={containerRef} sx={{ height: 'fit-content', maxHeight: '515px', overflow: 'hidden', overflowY: 'auto', p: '15px', width: '100%' }}>
            {rewardInfo.status === 'loading' &&
              <Progress text={t('Loading rewards')} />
            }
            {rewardInfo.status === 'ready' && rewardInfo.descSortedRewards &&
              <>
                <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', p: '10px 5px', pb: '5px', width: '100%' }}>
                  <RewardChartHeader
                    dateInterval={rewardInfo.dateInterval}
                    genesisHash={genesisHash}
                    onNextPeriod={rewardInfo.onNextPeriod}
                    onPreviousPeriod={rewardInfo.onPreviousPeriod}
                  />
                  <Grid container item>
                    <Bar data={rewardInfo.chartData} options={rewardInfo.chartOptions} />
                  </Grid>
                </Stack>
                <RewardChartTable
                  descSortedRewards={rewardInfo.descSortedRewards}
                  expanded={rewardInfo.detail}
                  genesisHash={genesisHash}
                  onExpand={rewardInfo.expand}
                />
              </>
            }
            {rewardInfo.status === 'error' &&
              <Typography color='text.primary' pt='40px' variant='B-2'>
                {t('No rewards found')}
              </Typography>
            }
            <FadeOnScroll containerRef={containerRef} height='75px' ratio={0.8} />
          </Stack>
        </Motion>
      </Grid>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        pool={poolStakingInfo.pool}
        type={type as 'solo' | 'pool'}
      />
    </>
  );
}
