// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faHand, faRightToBracket, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { useTranslation } from '../../../components/translate';
import { useInfo, useMinToReceiveRewardsInSolo2, usePoolConsts } from '../../../hooks';
import { STEPS } from '..';
import StakingSubOption from './StakingSubOption';

interface Props {
  address: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function AdvancedOptions({ address, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api } = useInfo(address);

  const poolConsts = usePoolConsts(address);
  const minToReceiveRewardsInSolo = useMinToReceiveRewardsInSolo2(address);

  const onJoinPool = useCallback(() => {
    setStep(STEPS.JOIN_POOL);
  }, [setStep]);

  const onSoloStake = useCallback(() => {
    setStep(STEPS.STAKE_SOLO);
  }, [setStep]);

  const onCreatePool = useCallback(() => {
    setStep(STEPS.CREATE_POOL);
  }, [setStep]);

  return (
    <Grid container justifyContent='flex-end' pt='15px' rowGap='12px'>
      <StakingSubOption
        api={api}
        balance={minToReceiveRewardsInSolo}
        balanceText={t('Minimum for rewards')}
        logo={
          <FontAwesomeIcon
            color={`${theme.palette.secondary.light}`}
            fontSize='30px'
            icon={faHand}
          />
        }
        onClick={onSoloStake}
        style={{
          pr: '6%',
          width: '87%'
        }}
        title={t('Stake Solo')}
      />
      <StakingSubOption
        api={api}
        balance={poolConsts?.minJoinBond}
        balanceText={t('Minimum to join')}
        logo={
          <FontAwesomeIcon
            color={`${theme.palette.secondary.light}`}
            fontSize='30px'
            icon={faRightToBracket}
          />
        }
        onClick={onJoinPool}
        style={{
          pr: '6%',
          width: '87%'
        }}
        title={t('Join a Pool')}
      />
      <StakingSubOption
        api={api}
        balance={poolConsts?.minCreationBond}
        balanceText={t('Minimum to create')}
        logo={
          <FontAwesomeIcon
            color={`${theme.palette.secondary.light}`}
            fontSize='30px'
            icon={faSquarePlus}
          />
        }
        onClick={onCreatePool}
        style={{
          pr: '6%',
          width: '87%'
        }}
        title={t('Create a Pool')}
      />
    </Grid>
  );
}
