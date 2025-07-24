// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { faRightToBracket, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { PButton } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useInfo, usePoolConsts } from '../../../hooks';
import { openOrFocusTab } from '../../accountDetails/components/CommonTasks';
import { STEPS } from '..';
import StakingMode from './StakingMode';

interface Props {
  address: string | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function PoolOptionsBig ({ address, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chainName } = useInfo(address);

  const poolConsts = usePoolConsts(address);

  const onJoin = useCallback(() => {
    setStep(STEPS.JOIN_POOL);
  }, [setStep]);

  const onCreate = useCallback(() => {
    setStep(STEPS.CREATE_POOL);
  }, [setStep]);

  const onBack = useCallback(
    () => openOrFocusTab(`/poolfs/${address}`, true)
    , [address]);

  return (
    <Grid container item>
      <Typography fontSize='16px' fontWeight={500} pb='15px' width='100%'>
        {t('Options are available to commence pool staking in {{chainName}}. Please select your preference, taking into consideration the minimum requirements for receiving rewards per era.', { replace: { chainName } })}
      </Typography>
      <Grid alignItems='center' container item justifyContent='flex-start' pt='40px'>
        <StakingMode
          api={api}
          balance={poolConsts?.minJoinBond}
          balanceText={t('Minimum to receive rewards')}
          logo={
            <FontAwesomeIcon
              color={`${theme.palette.secondary.light}`}
              fontSize='40px'
              icon={faRightToBracket}
            />}
          onClick={onJoin}
          style={{
            m: '5px auto',
            width: '100%'
          }}
          text={t('You can join existing pools, which will be shown to you in a list,')}
          title={t('Join a Pool')}
        />
        <StakingMode
          api={api}
          balance={poolConsts?.minCreationBond}
          balanceText={t('Minimum to receive rewards')}
          logo={
            <FontAwesomeIcon
              color={`${theme.palette.secondary.light}`}
              fontSize='40px'
              icon={faSquarePlus}
            />
          }
          onClick={onCreate}
          style={{
            mt: '15px',
            width: '100%'
          }}
          text={t('You can create a pool yourself and should manage pool and nominate validators for the pool yourself.')}
          tipPlace='bottom'
          title={t('Create a pool')}
        />
        <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
          <PButton
            _mt='10px'
            _onClick={onBack}
            _variant='outlined'
            _width={40}
            text={t('Back')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
