// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountId } from '@polkadot/types/interfaces';
import type { MyPoolInfo, PoolStakingConsts, StakingConsts } from '../../../../util/types';

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import Accounts from '@polkadot/extension-base/page/Accounts';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Infotip, Motion, PButton, Progress, Warning } from '../../../../components';
import { useApi, useChain, useFormatted, usePool, usePoolConsts, useStakingConsts, useTranslation, useValidators } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { DATE_OPTIONS, DEFAULT_TOKEN_DECIMALS, FLOATING_POINT_DIGIT, MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import Asset from '../../../send/partial/Asset';
import ValidatorsTable from './partials/ValidatorsTable';
import RemoveValidators from './RemoveValidators';
import Review from './Review';

interface State {
  api: ApiPromise | undefined;
  pathname: string;
  poolConsts: PoolStakingConsts | undefined;
  stakingConsts: StakingConsts | undefined
  pool: MyPoolInfo | undefined;
}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation<State>();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const history = useHistory();
  const api = useApi(address, state?.api);
  const chain = useChain(address);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const [refresh, setRefresh] = useState<boolean | undefined>(false);
  const [selectedValidatorsId, setSelectedValidatorsId] = useState<AccountId[] | undefined | null>();
  const [showRemoveReview, setShowRemoveReview] = useState<boolean | undefined>(false);
  const allValidatorsInfo = useValidators(address);

  const pool = usePool(address, undefined, state?.pool, refresh);
  const formatted = useFormatted(address);
  const [showReview, setShowReview] = useState<boolean>(false);

  const staked = pool === undefined ? undefined : new BN(pool?.member?.points ?? 0);

  const decimals = api?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const token = api?.registry?.chainTokens[0] ?? '...';

  useEffect(() => {
    setSelectedValidatorsId(pool === null || pool?.stashIdAccount?.nominators?.length === 0 ? null : pool?.stashIdAccount?.nominators);
    setRefresh(false);
  }, [pool]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? '/',
      state: { ...state }
    });
  }, [history, state]);

  const goToSelectValidator = useCallback(() => {
    setShowReview(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefresh(true);
    setSelectedValidatorsId(undefined);
  }, []);

  const onRemoveValidators = useCallback(() => {
    setShowRemoveReview(true);
  }, []);

  const Warn = ({ text }: { text: string }) => (
    <Grid
      container
      justifyContent='center'
      py='15px'
    >
      <Warning
        fontWeight={400}
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

  const ValidatorsActions = () => (
    <Grid container justifyContent='center' spacing={1} pt='15px'>
      <Grid item>
        <Typography sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
          {t('Change Validators')}
        </Typography>
      </Grid>
      <Grid item>
        <Divider
          orientation='vertical'
          sx={{
            bgcolor: 'text.primary',
            height: '19px',
            m: 'auto 2px',
            width: '2px'
          }}
        />
      </Grid>
      <Grid item>
        <Infotip text={t<string>('To unselect validators, you will not get any rewards after.')}>
          <Typography onClick={onRemoveValidators} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
            {t('Remove Validators')}
          </Typography>
        </Infotip>
      </Grid>
    </Grid>
  );

  return (
    <Motion>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle
        label={t<string>('Selected validators') + (selectedValidatorsId?.length ? ` (${selectedValidatorsId?.length})` : '')}
      />
      {(selectedValidatorsId === null || allValidatorsInfo === null) &&
        <>
          <Warn text={t<string>('No validator found.')} />
          <Grid alignItems='center' container direction='column' pt='98px'>
            <Grid item>
              <FontAwesomeIcon
                color={`${theme.palette.primary.light}`}
                icon={faRefresh}
                onClick={onRefresh}
                size='2x'
                spin={refresh}
              />
            </Grid>
            <Grid item sx={{ fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
              {t('Refresh')}
            </Grid>
          </Grid>
        </>
      }
      {(selectedValidatorsId === undefined || allValidatorsInfo === undefined) &&
        <Progress
          pt='125px'
          size={125}
          title={t('Loading the validators\' list ...')}
        />
      }
      <Grid item xs={12} sx={{ m: '20px 15px' }}>
        {selectedValidatorsId && allValidatorsInfo &&
          <>
            <ValidatorsTable
              allValidatorsInfo={allValidatorsInfo}
              api={api}
              chain={chain}
              selectedValidatorsId={selectedValidatorsId}
              staked={staked}
              stakingConsts={stakingConsts}
              stashId={pool?.accounts?.stashId}
            />
            <ValidatorsActions />
          </>
        }
      </Grid>
      {selectedValidatorsId === null &&
        <PButton
          _onClick={goToSelectValidator}
          text={t<string>('Select Validator')}
        />
      }
      {showRemoveReview &&
        <RemoveValidators
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          poolId={pool?.poolId}
          setShow={setShowReview}
          show={setShowRemoveReview}
          title={t('Remove Selected Validators')}
        />
      }
    </Motion>
  );
}
