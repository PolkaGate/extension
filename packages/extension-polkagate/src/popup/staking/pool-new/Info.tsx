// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { isBn } from '@polkadot/util';

import { info } from '../../../assets/gif';
import { BackWithLabel, Motion, ShowValue } from '../../../components';
import { useBackground, useChainInfo, usePoolStakingInfo, useSelectedAccount, useStakingInfoPool, useTranslation } from '../../../hooks';
import UserDashboardHeader from '../../../partials/UserDashboardHeader';
import { amountToHuman } from '../../../util';
import StakingMenu from '../partial/StakingMenu';

interface InfoBoxProps {
  value: number | string | BN | undefined;
  label: string;
  decimal: number | undefined;
}

const InfoBox = ({ decimal, label, value }: InfoBoxProps) => (
  <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '100px', rowGap: '10px', width: 'fit-content' }}>
    <Typography color='text.primary' variant='B-3'>
      {isBn(value)
        ? decimal && <>{amountToHuman(value, decimal)}</>
        : <ShowValue value={value} width='50px' />
      }
    </Typography>
    <Typography color='text.highlight' variant='B-4'>
      {label}
    </Typography>
  </Box>
);

export default function Info(): React.ReactElement {
  useBackground('staking');

  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const { decimal } = useChainInfo(genesisHash, true);

  const stakingStats = useStakingInfoPool(stakingInfo, genesisHash);
  const onBack = useCallback(() => navigate('/pool/' + genesisHash) as void, [genesisHash, navigate]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/pool/' + address + '/' + genesisHash} homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            style={{ pb: 0 }}
            text={t('info')}
          />
          <Grid alignItems='center' container item justifyContent='center'>
            <Box
              component='img'
              src={info as string}
              sx={{ height: '100px', width: '100px' }}
            />
          </Grid>
          <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '25px 16px', justifyContent: 'center', mt: '15px' }}>
            {stakingStats.map(({ label, value }, index) => (
              <InfoBox
                decimal={decimal}
                key={index}
                label={label}
                value={value}
              />
            ))}
          </Container>
          <Stack direction='column' sx={{ alignItems: 'flex-start', gap: '6px', ml: '15px', mt: '15px' }}>
            <Typography color={theme.palette.text.highlight} variant='B-4' width='fit-content'>
              {t('To leave a pool as a member')}:
            </Typography>
            <Typography color={theme.palette.text.primary} pl='10px' variant='B-4'>
              {t('Unstake, wait for unstaking, then redeem')}.
            </Typography>
          </Stack>
          <Stack direction='column' sx={{ alignItems: 'flex-start', gap: '6px', ml: '15px', mt: '10px' }}>
            <Typography color={theme.palette.text.highlight} variant='B-4' width='fit-content'>
              {t('To leave a pool as an owner')}:
            </Typography>
            <Typography color={theme.palette.text.primary} pl='10px' variant='B-4'>
              {t('Destroy pool, remove all, then leave as member')}.
            </Typography>
          </Stack>
        </Motion>
      </Grid>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        pool={stakingInfo.pool}
        type='pool'
      />
    </>
  );
}
