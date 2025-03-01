// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BalancesInfo, Proxy, TxInfo } from '../../../util/types';
import type { StakingInputs } from '../type';

import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import ShowValidators from '@polkadot/extension-polkagate/src/popup/staking/solo/stake/partials/ShowValidators';

import { Identity, Infotip, ShowBalance, SignArea2, WrongPasswordAlert } from '../../../components';
import { useEstimatedFee, useInfo } from '../../../hooks';
import useTranslation from '../../../hooks/useTranslation';
import { ThroughProxy } from '../../../partials';
import ShowPool from '../../../popup/staking/partial/ShowPool';
import RewardsDestination from '../../../popup/staking/solo/stake/partials/RewardDestination';
import { PROXY_TYPE, SYSTEM_SUGGESTION_TEXT } from '../../../util/constants';
import { amountToMachine, pgBoxShadow } from '../../../util/utils';
import DisplayValue from '../../governance/post/castVote/partial/DisplayValue';
import { STEPS } from '..';

interface Props {
  address: string;
  balances: BalancesInfo | undefined;
  inputs: StakingInputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>
}

export default function Review({ address, balances, inputs, setRefresh, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api, chain } = useInfo(address);
  const theme = useTheme();

  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);

  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [showSelectedValidators, setShowSelectedValidators] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const _extraInfo = useMemo(() => {
    if (inputs?.extraInfo && estimatedFee) {
      return {
        fee: estimatedFee,
        ...inputs.extraInfo
      };
    }

    return undefined;
  }, [estimatedFee, inputs]);

  const staked = useMemo(() =>
    inputs?.extraInfo?.['amount'] && balances?.decimal
      ? amountToMachine((inputs.extraInfo)['amount'] as string, balances.decimal)
      : undefined
    , [inputs, balances]);

  const handleCancel = useCallback(() => {
    setStep(inputs?.mode || STEPS.INDEX);
  }, [inputs?.mode, setStep]);

  const openValidatorsTable = useCallback(() => setShowSelectedValidators(true), []);

  return (
    <>
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), mb: '20px', p: '1% 3%' }}>
        <DisplayValue title={t('Account')} topDivider={false}>
          <Grid alignItems='center' container item justifyContent='center' sx={{ height: '42px', width: '600px' }}>
            <Identity
              address={address}
              api={api}
              chain={chain}
              direction='row'
              identiconSize={31}
              showSocial={false}
              style={{ maxWidth: '100%', width: 'fit-content' }}
              withShortAddress
            />
          </Grid>
        </DisplayValue>
        {selectedProxyAddress &&
          <Grid container m='auto' maxWidth='92%'>
            <ThroughProxy address={selectedProxyAddress} chain={chain} />
          </Grid>
        }
        <DisplayValue dividerHeight='1px' title={t('Amount')}>
          <Grid alignItems='center' container item sx={{ height: '42px' }}>
            <ShowBalance
              api={api}
              balance={staked}
              decimalPoint={4}
            />
          </Grid>
        </DisplayValue>
        {inputs?.pool &&
          <>
            <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mx: 'auto', my: '5px', width: '170px' }} />
            <ShowPool
              api={api}
              chain={chain}
              label={t('Pool')}
              labelPosition='center'
              mode={inputs.pool.bondedPool?.state.toString() === 'Creating' ? 'Creating' : 'Joining'}
              pool={inputs?.pool}
              showInfo
              style={{
                m: '8px auto 0',
                width: '92%'
              }}
            />
          </>
        }
        {inputs?.selectedValidators &&
          <Grid alignContent='center' container item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '1px', width: '240px' }} />
            <Grid alignContent='center' container item justifyContent='center'>
              <Grid item sx={{ alignSelf: 'center', mr: '20px', width: 'fit=content' }}>
                <Infotip fontSize='13px' iconTop={5} showQuestionMark text={t(SYSTEM_SUGGESTION_TEXT)}>
                  <Typography sx={{ fontWeight: 300 }}>
                    {t('Selected Validators ({{count}})', { replace: { count: inputs.selectedValidators?.length } })}
                  </Typography>
                </Infotip>
              </Grid>
              <Grid item onClick={openValidatorsTable} sx={{ cursor: 'pointer', mt: '5px' }}>
                <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '27px' }} />
              </Grid>
            </Grid>
            <Divider sx={{ bgcolor: 'secondary.main', height: '1px', width: '240px' }} />
            <RewardsDestination settings={{ payee: inputs?.payee || 'Staked', stashId: address }} />
          </Grid>
        }
        <DisplayValue dividerHeight='1px' title={t('Fee')}>
          <Grid alignItems='center' container item sx={{ height: '42px' }}>
            <ShowBalance
              api={api}
              balance={estimatedFee}
              decimalPoint={4}
            />
          </Grid>
        </DisplayValue>
      </Grid>
      <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
        <SignArea2
          address={address}
          call={inputs?.call}
          extraInfo={_extraInfo}
          isPasswordError={isPasswordError}
          onSecondaryClick={handleCancel}
          params={inputs?.params}
          primaryBtnText={t('Confirm')}
          proxyTypeFilter={inputs?.pool ? PROXY_TYPE.NOMINATION_POOLS : PROXY_TYPE.STAKING}
          secondaryBtnText={t('Cancel')}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setRefresh={setRefresh}
          setSelectedProxy={setSelectedProxy}
          setStep={setStep}
          setTxInfo={setTxInfo}
          step={step}
          steps={STEPS}
          token={balances?.token}
        />
      </Grid>
      {showSelectedValidators && !!inputs?.selectedValidators?.length &&
        <ShowValidators
          address={address}
          api={api}
          chain={chain}
          selectedValidators={inputs.selectedValidators}
          setShowSelectedValidators={setShowSelectedValidators}
          showSelectedValidators={showSelectedValidators}
          staked={staked}
        />
      }
    </>
  );
}
