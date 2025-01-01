// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { BN } from '@polkadot/util';
import type { Proxy, StakingConsts, TxInfo } from '../../../../../util/types';
import type { StakingInputs } from '../../../type';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import DisplayValue from '@polkadot/extension-polkagate/src/fullscreen/governance/post/castVote/partial/DisplayValue';
import { PROXY_TYPE } from '@polkadot/extension-polkagate/src/util/constants';
import { BN_ZERO } from '@polkadot/util';

import { ShowBalance, SignArea2, WrongPasswordAlert } from '../../../../../components';
import { useTranslation } from '../../../../../components/translate';
import { useEstimatedFee, useInfo } from '../../../../../hooks';
import ValidatorsTableFS from '../../../solo/partials/ValidatorsTableFS';
import { STEPS } from '../../stake';

interface Props {
  address: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  inputs: StakingInputs;
  step: number;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  staked: BN | undefined;
  stakingConsts: StakingConsts | null | undefined;
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined;
}

export default function Review({ address, allValidatorsIdentities, inputs, setStep, setTxInfo, staked, stakingConsts, step }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { api, formatted, token } = useInfo(address);

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const { call, params, selectedValidators } = inputs;
  const estimatedFee = useEstimatedFee(address, call, params);

  const extraInfo = useMemo(() => ({
    action: 'Pool Staking',
    fee: String(estimatedFee || 0),
    subAction: 'Select Validator',
    validatorsCount: selectedValidators?.length
  }), [estimatedFee, selectedValidators?.length]);


  const handleCancel = useCallback(() => setStep(STEPS.INDEX), [setStep]);

  return (
    <Grid alignItems='center' container item justifyContent='flex-start'>
      <Typography fontSize='14px' pb='15px' width='100%'>
        {t('Review the newly selected validators')}
      </Typography>
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      <Grid item mt='10px' xs={12}>
        <ValidatorsTableFS
          address={address}
          allValidatorsIdentities={allValidatorsIdentities}
          formatted={formatted}
          height={window.innerHeight - 444}
          staked={staked ?? BN_ZERO}
          stakingConsts={stakingConsts}
          validatorsToList={selectedValidators}
        />
        <DisplayValue dividerHeight='1px' title={t('Fee')}>
          <Grid alignItems='center' container item sx={{ height: '42px' }}>
            <ShowBalance
              api={api}
              balance={estimatedFee}
              decimalPoint={4}
            />
          </Grid>
        </DisplayValue>
        <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
          <SignArea2
            address={address}
            call={call}
            extraInfo={extraInfo}
            isPasswordError={isPasswordError}
            onSecondaryClick={handleCancel}
            params={params}
            primaryBtnText={t('Confirm')}
            proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
            secondaryBtnText={t('Back')}
            selectedProxy={selectedProxy}
            setIsPasswordError={setIsPasswordError}
            setSelectedProxy={setSelectedProxy}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
            steps={STEPS}
            token={token}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
