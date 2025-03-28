// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveStakingQuery } from '@polkadot/api-derive/types';
import type { BN } from '@polkadot/util';
import type { AccountStakingInfo, StakingConsts, ValidatorInfo } from '../../../../util/types';

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN_ZERO } from '@polkadot/util';

import { Infotip, Motion, PButton, Progress, Warning } from '../../../../components';
import { useInfo, useStakingAccount, useStakingConsts, useTranslation, useUnSupportedNetwork, useValidators, useValidatorsIdentities } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { STAKING_CHAINS } from '../../../../util/constants';
import SelectValidators from '../../partial/SelectValidators';
import Review from '../../partial/SelectValidatorsReview';
import ValidatorsTable from '../../partial/ValidatorsTable';
import RemoveValidators from './remove';

interface State {
  api: ApiPromise | undefined;
  pathname: string;
  stakingConsts: StakingConsts | undefined
  stakingAccount: AccountStakingInfo | undefined
}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation<State>();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const history = useHistory();
  const { api, chain, formatted } = useInfo(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);

  const allValidatorsInfo = useValidators(address);
  const allValidatorsAccountIds = useMemo(() => allValidatorsInfo && allValidatorsInfo.current.concat(allValidatorsInfo.waiting)?.map((v) => v.accountId), [allValidatorsInfo]);
  const allValidatorsIdentities = useValidatorsIdentities(address, allValidatorsAccountIds);

  const [refresh, setRefresh] = useState<boolean>(false);
  const stakingAccount = useStakingAccount(address, state?.stakingAccount, refresh, setRefresh);
  const [nominatedValidatorsIds, setNominatedValidatorsIds] = useState<string[] | undefined | null>();
  const [showRemoveValidator, setShowRemoveValidator] = useState<boolean>(false);
  const [showSelectValidator, setShowSelectValidator] = useState<boolean>(false);

  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInfo[]>([]);
  const [showReview, setShowReview] = useState<boolean>(false);

  const selectedValidatorsInfo = useMemo(() =>
    allValidatorsInfo && nominatedValidatorsIds && allValidatorsInfo.current
      .concat(allValidatorsInfo.waiting)
      .filter((v: DeriveStakingQuery) => {
        const id = v.accountId as unknown as string;

        return nominatedValidatorsIds.includes(id)
      }
      )
    , [allValidatorsInfo, nominatedValidatorsIds]);

  const activeValidators = useMemo(() => selectedValidatorsInfo?.filter((sv) => sv?.exposure?.others?.find(({ who }: { who: any }) => who?.toString() === stakingAccount?.accountId?.toString())), [selectedValidatorsInfo, stakingAccount?.accountId]);

  useEffect(() => {
    setNominatedValidatorsIds(stakingAccount === null || stakingAccount?.nominators?.length === 0 ? null : stakingAccount?.nominators.map((item) => item.toString()));
  }, [stakingAccount]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/solo/${address}`,
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
    stakingAccount?.controllerId === formatted && setShowRemoveValidator(true);
  }, [formatted, stakingAccount?.controllerId]);

  const OnTuneUp = useCallback(() => {
    activeValidators?.length && history.push({
      pathname: `/tuneup/${address}`,
      state: { ...state }
    });
  }, [activeValidators?.length, address, history, state]);

  const onChangeValidators = useCallback(() => {
    stakingAccount?.controllerId === formatted && goToSelectValidator();
  }, [formatted, goToSelectValidator, stakingAccount?.controllerId]);

  const Warn = ({ text }: { text: string }) => (
    <Grid container justifyContent='center' py='15px'>
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
        <Typography onClick={onChangeValidators} sx={{ color: stakingAccount?.controllerId === formatted ? 'text.primary' : 'text.disabled', cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
          {t('Change Validators')}
        </Typography>
      </Grid>
      <Grid item>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '19px', m: 'auto 2px', width: '2px' }} />
      </Grid>
      <Grid item>
        <Infotip text={t('Use this to unselect validators. Note you will not get any rewards after.')}>
          <Typography onClick={onRemoveValidators} sx={{ color: stakingAccount?.controllerId === formatted ? 'text.primary' : 'text.disabled', cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
            {t('Remove Validators')}
          </Typography>
        </Infotip>
      </Grid>
      <Grid item>
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '19px', m: 'auto 2px', width: '2px' }} />
      </Grid>
      <Grid item>
        <Infotip text={t('If Tune UP is available, it will correct your account\'s position in voters\' list to be eligible for receiving rewards.')}>
          <Typography onClick={OnTuneUp} sx={{ color: activeValidators?.length ? 'text.primary' : 'text.disabled', cursor: 'pointer', fontSize: '14px', fontWeight: 400, textDecorationLine: 'underline' }}>
            {t('Tune Up')}
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
        text={t('Solo Staking')}
      />
      <SubTitle label={t('Selected validators') + (nominatedValidatorsIds?.length ? ` (${nominatedValidatorsIds?.length})` : '')} />
      {nominatedValidatorsIds === null
        ? <>
          <Warn text={t('No validator found.')} />
          <Grid alignItems='center' container direction='column' pt='98px'>
            <Grid item sx={{ cursor: 'pointer' }}>
              <FontAwesomeIcon
                color={`${theme.palette.secondary.light}`}
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
          type='grid'
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
              decimal={stakingAccount?.decimal}
              formatted={formatted}
              height={window.innerHeight - 190}
              staked={(stakingAccount?.stakingLedger?.active as unknown as BN) ?? BN_ZERO}
              stakingConsts={stakingConsts}
              token={stakingAccount?.token}
              validatorsToList={selectedValidatorsInfo}
            />
            <ValidatorsActions />
          </>
        }
      </Grid>
      {nominatedValidatorsIds === null && stakingAccount?.controllerId === formatted && stakingAccount?.stakingLedger?.active && !(stakingAccount?.stakingLedger?.active as unknown as BN)?.isZero() &&
        <PButton
          _onClick={goToSelectValidator}
          text={t('Select Validator')}
        />
      }
      {showRemoveValidator && formatted &&
        <RemoveValidators
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          setShow={setShowRemoveValidator}
          show={showRemoveValidator}
          title={t('Remove Validators')}
        />
      }
      {showSelectValidator && allValidatorsInfo && formatted &&
        <SelectValidators
          address={address}
          api={api}
          newSelectedValidators={newSelectedValidators}
          nominatedValidatorsIds={nominatedValidatorsIds}
          setNewSelectedValidators={setNewSelectedValidators}
          setShow={setShowSelectValidator}
          setShowReview={setShowReview}
          show={showSelectValidator}
          staked={(stakingAccount?.stakingLedger?.active as unknown as BN) ?? BN_ZERO}
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
          allValidatorsIdentities={allValidatorsIdentities}
          api={api}
          newSelectedValidators={newSelectedValidators}
          setShow={setShowReview}
          show={showReview}
          staked={stakingAccount?.stakingLedger?.active as unknown as BN ?? BN_ZERO}
          stakingConsts={stakingConsts}
        />
      }
    </Motion>
  );
}
