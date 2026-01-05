// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { isBn } from '@polkadot/util';

import { info } from '../../../assets/gif';
import { BackWithLabel, Motion, ShowValue } from '../../../components';
import { useBackground, useChainInfo, useSelectedAccount, useSoloStakingInfo, useTranslation } from '../../../hooks';
import UserDashboardHeader from '../../../partials/UserDashboardHeader';
import { amountToHuman } from '../../../util';
import StakingMenu from '../partial/StakingMenu';

interface InfoBoxProps {
  value: number | BN | undefined;
  label: string;
  decimal: number | undefined;
}

const InfoBox = ({ decimal, label, value }: InfoBoxProps) => (
  <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '100px', rowGap: '8px', width: 'fit-content' }}>
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

  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const stakingStats = useMemo(() => ([
    { label: t('Max Validators you can select'), value: stakingInfo.stakingConsts?.maxNominations },
    { label: t('Min {{token}} to be staker', { replace: { token: token ?? '' } }), value: stakingInfo.stakingConsts?.minNominatorBond },
    { label: t('Min {{token}} to receive rewards', { replace: { token: token ?? '' } }), value: 250 },
    { label: t('Max nominators of a validator, who may receive rewards'), value: stakingInfo.stakingConsts?.maxNominatorRewardedPerValidator },
    { label: t('Days it takes to receive your funds back after unstaking'), value: stakingInfo.stakingConsts?.unbondingDuration },
    { label: t('Min {{token}} that must remain in your account (ED)', { replace: { token: token ?? '' } }), value: 1 }
  ]), [stakingInfo.stakingConsts?.maxNominations, stakingInfo.stakingConsts?.maxNominatorRewardedPerValidator, stakingInfo.stakingConsts?.minNominatorBond, stakingInfo.stakingConsts?.unbondingDuration, t, token]);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + address + '/' + genesisHash} homeType='default' />
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
        </Motion>
      </Grid>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        type='solo'
      />
    </>
  );
}
