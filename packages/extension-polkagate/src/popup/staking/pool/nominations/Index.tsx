// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { AccountId } from '@polkadot/types/interfaces';
import type { MyPoolInfo, PoolStakingConsts, StakingConsts, ValidatorInfo } from '../../../../util/types';

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, SxProps, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { DeriveStakingQuery } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { Infotip, Motion, PButton, Progress, Warning } from '../../../../components';
import { useApi, useChain, useFormatted, usePool, useStakingConsts, useTranslation, useValidators, useValidatorsIdentities } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import SelectValidators from '../../partial/SelectValidators';
import Review from '../../partial/SelectValidatorsReview';
import ValidatorsTable from '../../partial/ValidatorsTable';
import RemoveValidators from './remove';

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
  const allValidatorsInfo = useValidators(address);
  const allValidatorsAccountIds = useMemo(() => allValidatorsInfo && allValidatorsInfo.current.concat(allValidatorsInfo.waiting)?.map((v) => v.accountId), [allValidatorsInfo]);
  const allValidatorsIdentities = useValidatorsIdentities(address, allValidatorsAccountIds);
  const [refresh, setRefresh] = useState<boolean | undefined>(false);
  const pool = usePool(address, undefined, refresh);
  const formatted = useFormatted(address);
  const [nominatedValidatorsIds, setNominatedValidatorsIds] = useState<AccountId[] | undefined | null>();
  const [showRemoveValidator, setShowRemoveValidator] = useState<boolean>(false);
  const [showSelectValidator, setShowSelectValidator] = useState<boolean>(false);

  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInfo[]>([]);
  const [showReview, setShowReview] = useState<boolean>(false);

  const canNominate = useMemo(() => pool && formatted && ([String(pool.bondedPool?.roles.root), String(pool.bondedPool?.roles.nominator)].includes(String(formatted))), [formatted, pool]);

  const selectedValidatorsInfo = useMemo(() =>
    allValidatorsInfo && nominatedValidatorsIds && allValidatorsInfo.current
      .concat(allValidatorsInfo.waiting)
      .filter((v: DeriveStakingQuery) => nominatedValidatorsIds.includes(v.accountId))
    , [allValidatorsInfo, nominatedValidatorsIds]);

  const activeValidators = useMemo(() => selectedValidatorsInfo?.filter((sv) => sv.exposure.others.find(({ who }) => who.toString() === pool?.accounts?.stashId)), [pool?.accounts?.stashId, selectedValidatorsInfo]);

  useEffect(() => {
    setNominatedValidatorsIds(pool === null || pool?.stashIdAccount?.nominators?.length === 0 ? null : pool?.stashIdAccount?.nominators);
    setRefresh(false);
  }, [pool]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? `/pool/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const goToSelectValidator = useCallback(() => {
    setShowSelectValidator(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefresh(true);
    setNominatedValidatorsIds(undefined);
  }, []);

  const onRemoveValidators = useCallback(() => {
    setShowRemoveValidator(true);
  }, []);

  const onChangeValidators = useCallback(() => {
    goToSelectValidator();
  }, [goToSelectValidator]);

  const Warn = ({ text, style = {} }: { text: string, style?: SxProps }) => (
    <Grid container justifyContent='center' sx={style}>
      <Warning
        fontWeight={400}
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

  const ValidatorsActions = () => (
    <Grid container justifyContent='center' pt='15px' spacing={1}>
      <Grid item>
        <Typography onClick={onChangeValidators} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
          {t('Change Validators')}
        </Typography>
      </Grid>
      <Grid item>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '19px', m: 'auto 2px', width: '2px' }} />
      </Grid>
      <Grid item>
        <Infotip text={t<string>('Use this to unselect validators. Note you will not get any rewards after.')}>
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
        label={t<string>('Selected validators') + (nominatedValidatorsIds?.length ? ` (${nominatedValidatorsIds?.length})` : '')}
      />
      {nominatedValidatorsIds === null
        ? <>
          <Warn style={{ py: '15px' }} text={t<string>('No validator found.')} />
          <Grid alignItems='center' container direction='column' pt='98px'>
            <Grid item sx={{ cursor: 'pointer' }}>
              <FontAwesomeIcon
                color={`${theme.palette.primary.light}`}
                icon={faRefresh}
                onClick={onRefresh}
                size='2x'
                spin={refresh}
              />
            </Grid>
            <Grid item onClick={onRefresh} sx={{ cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
              {t('Refresh')}
            </Grid>
          </Grid>
        </>
        : (nominatedValidatorsIds === undefined || allValidatorsInfo === undefined) &&
        <Progress
          pt='125px'
          size={125}
          title={t('Loading the validators\' list ...')}
        />
      }
      <Grid item sx={{ m: '20px 15px' }} xs={12}>
        {nominatedValidatorsIds && allValidatorsInfo &&
          <>
            <ValidatorsTable
              activeValidators={activeValidators}
              allValidatorsIdentities={allValidatorsIdentities}
              api={api}
              chain={chain}
              decimal={pool?.decimal}
              formatted={pool?.stashIdAccount?.accountId?.toString()}
              height={window.innerHeight - (canNominate ? 190 : 150)}
              staked={new BN(pool?.stashIdAccount?.stakingLedger?.active ?? 0)}
              stakingConsts={stakingConsts}
              token={pool?.token}
              validatorsToList={selectedValidatorsInfo}
            />
            {canNominate &&
              <ValidatorsActions />
            }
          </>
        }
      </Grid>
      {nominatedValidatorsIds === null &&
        <>
          {!canNominate &&
            <Warn style={{ pt: '100px' }} text={t<string>('Only pool owner can select validators.')} />
          }
          <PButton
            _isBusy={showSelectValidator && !allValidatorsInfo}
            _onClick={goToSelectValidator}
            disabled={!canNominate}
            text={t<string>('Select Validator')}
          />
        </>
      }
      {showRemoveValidator &&
        <RemoveValidators
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          poolId={pool?.poolId}
          setShow={setShowRemoveValidator}
          show={showRemoveValidator}
          title={t('Remove Selected Validators')}
        />
      }
      {showSelectValidator && pool && allValidatorsInfo && formatted &&
        <SelectValidators
          address={address}
          api={api}
          chain={chain}
          newSelectedValidators={newSelectedValidators}
          nominatedValidatorsIds={nominatedValidatorsIds}
          poolId={pool.poolId}
          setNewSelectedValidators={setNewSelectedValidators}
          setShow={setShowSelectValidator}
          setShowReview={setShowReview}
          show={showSelectValidator}
          staked={new BN(pool?.stashIdAccount?.stakingLedger?.active ?? 0)}
          stakingConsts={stakingConsts}
          stashId={formatted}
          title={t('Select Validators')}
          validatorsIdentities={allValidatorsIdentities}
          validatorsInfo={allValidatorsInfo}
        />
      }
      {showReview && newSelectedValidators &&
        <Review
          address={address}
          allValidators={allValidatorsInfo}
          allValidatorsIdentities={allValidatorsIdentities}
          api={api}
          newSelectedValidators={newSelectedValidators}
          poolId={pool?.poolId}
          setShow={setShowReview}
          show={showReview}
          staked={new BN(pool?.stashIdAccount?.stakingLedger?.active ?? 0)}
          stakingConsts={stakingConsts}
        />
      }
    </Motion>
  );
}
