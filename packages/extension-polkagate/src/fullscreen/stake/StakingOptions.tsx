// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { Boy as BoyIcon } from '@mui/icons-material';
import { Collapse, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { PButton, PoolStakingIcon } from '../../components';
import { useTranslation } from '../../components/translate';
import { useInfo, useMinToReceiveRewardsInSolo2, usePoolConsts } from '../../hooks';
import { BalancesInfo } from '../../util/types';
import { Title } from '../sendFund/InputPage';
import StakingOptionFS from './partials/StakingOptionFS';
import PoolOptions from './pool/PoolOptions';
import { Inputs, STEPS } from '.';

interface Props {
  address: string
  balances: BalancesInfo | undefined;
  inputs: Inputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
}

export default function StakingOptions ({ address, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chainName } = useInfo(address);

  const poolConsts = usePoolConsts(address);
  const minToReceiveRewardsInSolo = useMinToReceiveRewardsInSolo2(address);

  const [showPoolOptions, setShowPoolOptions] = useState<boolean>(false);

  const OnPoolStaking = useCallback(
    () => setShowPoolOptions(!showPoolOptions)
    , [showPoolOptions]);

  const onSoloStaking = useCallback(() => {
    setStep(STEPS.STAKE_SOLO);
  }, [setStep]);

  const onBack = useCallback(
    () => setStep(STEPS.INDEX)
    , [setStep]);

  return (
    <Grid container item >
      <Typography fontSize='16px' fontWeight={500} pb='15px' width='100%'>
        {t('Options are available to commence staking in Westend. Please select your preference, taking into consideration the minimum requirements for receiving rewards per era.', { replace: { chainName } })}
      </Typography>
      <Grid alignItems='center' container item justifyContent='flex-start' pt='40px'>
        <StakingOptionFS
          api={api}
          balance={poolConsts?.minJoinBond}
          balanceText={t('Minimum to receive rewards')}
          helperText={t('All the members of a pool act as a single nominator and the earnings of the pool are split pro rata to a member\'s stake in the bonded pool.')}
          logo={
            <PoolStakingIcon color={theme.palette.secondary.light} height={60} width={60} />
          }
          onClick={OnPoolStaking}
          rotations={{ transform: showPoolOptions ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }}
          showQuestionMark
          style={{
            m: '5px auto',
            width: '100%'
          }}
          text={t('Stakers (members) with a small amount of tokens can pool their funds together.')}
          title={t('Pool Staking')}
        />
        <Collapse in={showPoolOptions} sx={{ width: '100%' }}>
          <PoolOptions address={address} setStep={setStep} />
        </Collapse>
        <StakingOptionFS
          api={api}
          balance={minToReceiveRewardsInSolo}
          balanceText={t('Minimum to receive rewards')}
          helperText={t('Each solo staker will be responsible to nominate validators and keep eyes on them to re-nominate if needed.')}
          logo={
            <BoyIcon
              sx={{
                color: 'secondary.light',
                fontSize: '62px'
              }}
            />
          }
          onClick={onSoloStaking}
          showQuestionMark
          style={{
            mt: '15px',
            width: '100%'
          }}
          text={t('Stakers (nominators) with a sufficient amount of tokens can choose solo staking.')}
          tipPlace='bottom'
          title={t('Solo Staking')}
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
