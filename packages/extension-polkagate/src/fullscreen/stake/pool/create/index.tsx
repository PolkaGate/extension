// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN, BN_ZERO } from '@polkadot/util';

import { AddressInput, AmountWithOptions, InputWithLabel, ShowBalance, TwoButtons } from '../../../../components';
import { useEstimatedFee, useInfo, usePoolConsts, useTranslation, useUnSupportedNetwork } from '../../../../hooks';
import { MAX_AMOUNT_LENGTH, STAKING_CHAINS } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import { STEPS } from '../..';
import { Inputs } from '../../Entry';
import UpdateRoles from './UpdateRoles';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
  inputs: Inputs | undefined;
}

export default function CreatePool ({ inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const { api, chain, decimal, formatted, token } = useInfo(address);

  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const poolStakingConsts = usePoolConsts(address);

  const [poolName, setPoolName] = useState<string | undefined>();
  const [createAmount, setCreateAmount] = useState<string | undefined>();
  const [availableBalance, setAvailableBalance] = useState<Balance | undefined>();
  const [showRoles, setShowRoles] = useState<boolean>(false);
  const [toReviewDisabled, setToReviewDisabled] = useState<boolean>(true);
  const [nominatorId, setNominatorId] = useState<string>();
  const [bouncerId, setBouncerId] = useState<string>();

  const ED = api && api.consts.balances.existentialDeposit as unknown as BN;
  const nextPoolId = poolStakingConsts && poolStakingConsts.lastPoolId.toNumber() + 1;
  const DEFAULT_POOLNAME = `Polkagate 💜${nextPoolId ? ` - ${nextPoolId}` : ''}`;
  const amountAsBN = useMemo(() => amountToMachine(createAmount, decimal), [createAmount, decimal]);

  const stakeAmountChange = useCallback((value: string) => {
    if (decimal && value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setCreateAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onMaxAmount = useCallback(() => {
    if (!api || !availableBalance || !estimatedFee || !ED) {
      return;
    }

    const max = new BN(availableBalance.toString()).sub(ED.muln(3)).sub(new BN(estimatedFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setCreateAmount(maxToHuman);
  }, [ED, api, availableBalance, decimal, estimatedFee]);

  const onMinAmount = useCallback(() => {
    poolStakingConsts?.minCreationBond && setCreateAmount(amountToHuman(poolStakingConsts.minCreationBond.toString(), decimal));
  }, [decimal, poolStakingConsts?.minCreationBond]);

  const _onPoolNameChange = useCallback((name: string) => {
    setPoolName(name);
  }, []);

  const onUpdateRoles = useCallback(() => {
    setShowRoles(!showRoles);
  }, [showRoles]);

  const toReview = useCallback(() => {
    setStep(STEPS.CREATE_REVIEW);
  }, [setStep]);

  const onBackClick = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const pool = {
      bondedPool: {
        memberCounter: 1,
        points: amountAsBN,
        roles: {
          depositor: formatted,
          nominator: nominatorId,
          root: formatted,
          bouncer: bouncerId
        },
        state: 'Creating'
      },
      metadata: poolName ?? DEFAULT_POOLNAME,
      poolId: poolStakingConsts?.lastPoolId?.addn(1),
      rewardPool: null
    };

    const create = api.tx.nominationPools.create;
    const createParams = [amountAsBN, formatted, nominatorId, bouncerId];

    const setMetadata = api.tx.nominationPools.setMetadata;
    const setMetaDataParams = [poolStakingConsts?.lastPoolId?.addn(1), pool.metadata];

    const call = api.tx.utility.batch;
    const params = [[create(...createParams), setMetadata(...setMetaDataParams)]];

    const extraInfo = {
      action: 'Pool Staking',
      amount: createAmount,
      fee: String(estimatedFee || 0),
      poolName: pool.metadata,
      subAction: 'Create Pool'
    };

    setInputs({
      call,
      estimatedFee, // TODO: needs to include setMetadata
      extraInfo,
      mode: STEPS.CREATE_POOL,
      params,
      pool
    });
  }, [DEFAULT_POOLNAME, amountAsBN, api, bouncerId, createAmount, estimatedFee, formatted, nominatorId, poolName, poolStakingConsts?.lastPoolId, setInputs]);

  useEffect(() => {
    !nominatorId && formatted && setNominatorId(String(formatted));
    !bouncerId && formatted && setBouncerId(String(formatted));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted]);

  useEffect(() => {
    !nominatorId && formatted && setNominatorId(String(formatted));
    !bouncerId && formatted && setBouncerId(String(formatted));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted]);

  useEffect(() => {
    if (!poolStakingConsts?.minCreateBond) {
      return;
    }

    const goTo = !(formatted && nominatorId && bouncerId && createAmount);
    const isAmountInRange = amountAsBN?.gt(availableBalance?.sub(estimatedFee ?? BN_ZERO) ?? BN_ZERO) || !amountAsBN?.gte(poolStakingConsts.minCreateBond);

    setToReviewDisabled(goTo || isAmountInRange);
  }, [amountAsBN, availableBalance, createAmount, estimatedFee, formatted, nominatorId, poolStakingConsts?.minCreateBond, bouncerId]);

  useEffect(() => {
    api && formatted && api.derive.balances?.all(formatted)
      .then((b) => {
        setAvailableBalance(b.availableBalance);
      })
      .catch(console.error);
  }, [formatted, api]);

  return (
    <>
      <Grid container mt='20px' width='73%'>
        <InputWithLabel
          height={50}
          label={t('Pool name')}
          onChange={_onPoolNameChange}
          placeholder={DEFAULT_POOLNAME}
          value={poolName}
        />
      </Grid>
      <AmountWithOptions
        label={t('Amount ({{token}})', { replace: { token: token || '...' } })}
        onChangeAmount={stakeAmountChange}
        onPrimary={onMinAmount}
        onSecondary={onMaxAmount}
        primaryBtnText={t('Min amount')}
        secondaryBtnText={t('Max amount')}
        style={{
          fontSize: '16px',
          mt: '25px',
          width: '73%'
        }}
        textSpace='15px'
        value={createAmount}
      />
      <Grid alignItems='end' container sx={{ mt: '10px', width: '73%' }}>
        <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
          {t('Fee:')}
        </Typography>
        <Grid fontSize='14px' fontWeight={400} item lineHeight='22px' pl='5px'>
          <ShowBalance api={api} balance={estimatedFee} decimalPoint={4} height={22} />
        </Grid>
      </Grid>
      <Grid alignItems='end' container item justifyContent='flex-start'>
        <Divider sx={{ fontSize: '16px', fontWeight: 500, mt: '30px', mb: '20px', width: '100%' }}>
          {t('Roles')}
        </Divider>
        <Typography fontSize='14px' fontWeight={300} sx={{ mt: 'auto', width: '90%' }} textAlign='left'>
          {t('All the roles (Depositor, Root, Nominator, and Bouncer) are set to the following ID by default although you can update the Nominator and Bouncer by clicking on “Update roles”.')}
        </Typography>
        <AddressInput address={formatted} chain={chain} disabled label={''} setAddress={() => null} showIdenticon style={{ mt: '15px', width: '92%' }} />
        <Grid onClick={onUpdateRoles} width='fit-content'>
          <Typography fontSize='16px' fontWeight={400} lineHeight='36px' sx={{ cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>
            {t('Update roles')}
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent='flex-start' mt='10px' xs={12}>
        <Grid item xs={12}>
          <Divider
            sx={{
              bgcolor: 'transparent',
              border: `0.5px solid ${theme.palette.divider}`,
              mt: '40px',
              width: '100%'
            }}
          />
        </Grid>
        <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
          <TwoButtons
            disabled={toReviewDisabled}
            mt='20px'
            onPrimaryClick={toReview}
            onSecondaryClick={onBackClick}
            primaryBtnText={t('Next')}
            secondaryBtnText={t('Back')}
          />
        </Grid>
      </Grid>
      {showRoles &&
        <UpdateRoles
          address={address}
          bouncerId={bouncerId}
          chain={chain}
          formatted={formatted}
          nominatorId={nominatorId}
          setBouncerId={setBouncerId}
          setNominatorId={setNominatorId}
          setShow={setShowRoles}
          show={showRoles}
        />
      }
    </>
  );
}
