// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import usePendingRewardsProgress from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/pendingReward/usePendingRewardsProgress';

import { Badge } from '../../../../assets/gif';
import { BackWithLabel, DecisionButtons, DisplayBalance, GradientDivider, Motion } from '../../../../components';
import { useBackground, useChainInfo, usePendingRewardsSolo, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import { PROXY_TYPE } from '../../../../util/constants';
import { RewardsTable, TableHeader } from './RewardsTable';

export default function PendingReward () {
  useBackground('staking');

  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const address = useSelectedAccount()?.address;
  const progress = usePendingRewardsProgress();

  const { api, decimal, token } = useChainInfo(genesisHash);

  const { eraToDate,
    expandedRewards,
    onSelect,
    onSelectAll,
    selectedToPayout,
    totalSelectedPending,
    transactionInformation,
    tx } = usePendingRewardsSolo(address, genesisHash);

  const [review, setReview] = useState<boolean>(false);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const openReview = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: t('Payout rewards'),
    closeReview,
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: PROXY_TYPE.STAKING,
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + address + '/' + genesisHash} homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            stepCounter={{ currentStep: 1, totalSteps: 2 }}
            style={{ pb: 0 }}
            text={t('Pending Rewards')}
          />
          <Stack direction='column' sx={{ gap: '8px', height: 'fit-content', maxHeight: '515px', overflow: 'hidden', overflowY: 'auto', p: '15px', width: '100%' }}>
            <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', pr: '10px' }}>
              <Box
                component='img'
                src={Badge as string}
                style={{
                  height: '64px',
                  width: '64px'
                }}
              />
              <Typography color='text.highlight' textAlign='justify' variant='B-4'>
                {t('Validators usually pay rewards regularly. If not received within the set period, rewards expire. You can manually initiate the payout if desired.')}
              </Typography>
            </Container>
            <GradientDivider isBlueish />
            <TableHeader
              checked={!!expandedRewards?.length && selectedToPayout?.length === expandedRewards?.length}
              onSelectAll={onSelectAll}
            />
            <RewardsTable
              eraToDate={eraToDate}
              expandedRewards={expandedRewards}
              genesisHash={genesisHash}
              onSelect={onSelect}
              selectedToPayout={selectedToPayout}
            />
            <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', position: 'relative', width: '100%' }}>
              <LinearProgress
                color='info'
                sx={{
                  borderRadius: '14px',
                  height: '2px',
                  position: 'absolute',
                  top: '-10px',
                  transition: 'visibility 250ms ease-out',
                  visibility: progress === 100 ? 'hidden' : 'initial',
                  width: '100%'
                }}
                value={progress}
                variant='determinate'
              />
              <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '4px', m: 0, width: '100px' }}>
                <Typography color='text.highlight' variant='B-4'>
                  {t('Selected')}:
                </Typography>
                <Typography color='text.primary' variant='B-4'>
                  {selectedToPayout.length ?? 0}
                </Typography>
              </Container>
              <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, maxWidth: '225px', width: '100%' }}>
                <Typography color='text.highlight' variant='B-4'>
                  {t('Total')}:
                </Typography>
                <DisplayBalance
                  balance={totalSelectedPending}
                  decimal={decimal}
                  style={{
                    color: theme.palette.text.primary,
                    ...theme.typography['B-2'],
                    textAlign: 'right',
                    width: 'max-content'
                  }}
                  token={token}
                  useAdaptiveDecimalPoint
                />
              </Container>
            </Container>
            <DecisionButtons
              direction='horizontal'
              disabled={!selectedToPayout.length || !api}
              divider
              flexibleWidth
              onPrimaryClick={openReview}
              onSecondaryClick={onBack}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Cancel')}
              secondaryButtonProps={{ style: { width: '94px' } }}
              style={{ height: '44px' }}
            />
          </Stack>
        </Motion>
      </Grid>
    </>
  );
}
