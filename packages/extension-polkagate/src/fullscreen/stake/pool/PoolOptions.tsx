// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faRightToBracket, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { useTranslation } from '../../../components/translate';
import { useInfo, usePoolConsts } from '../../../hooks';
import StakingPoolOptionFS from '../partials/StakingPoolOptionFS';
import { STEPS } from '..';

interface Props {
  address: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function PoolOptions ({ address, setStep}: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api } = useInfo(address);

  const poolConsts = usePoolConsts(address);

  const onJoinPool = useCallback(() => {
    setStep(STEPS.JOIN_POOL);
  }, [setStep]);

  const onCreatePool = useCallback(() => {
    setStep(STEPS.CREATE_POOL);
  }, [setStep]);

  return (
    <Grid container justifyContent='flex-end'>
      <StakingPoolOptionFS
        api={api}
        balance={poolConsts?.minJoinBond}
        balanceText={t('Minimum to join')}
        logo={
          <FontAwesomeIcon
            color={`${theme.palette.secondary.light}`}
            fontSize='38px'
            icon={faRightToBracket}
          />
        }
        onClick={onJoinPool}
        style={{
          my: '5px',
          pr: '6%',
          width: '87%'
        }}
        title={t('Join a Pool')}
      />
      <StakingPoolOptionFS
        api={api}
        balance={poolConsts?.minCreationBond}
        balanceText={t('Minimum to create')}
        logo={
          <FontAwesomeIcon
            color={`${theme.palette.secondary.light}`}
            fontSize='38px'
            icon={faSquarePlus}
          />
        }
        onClick={onCreatePool}
        style={{
          my: '5px',
          pr: '6%',
          width: '87%'
        }}
        title={t('Create a Pool')}
      />
    </Grid>
  );
}
