// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import DisplayValue from '@polkadot/extension-polkagate/src/fullscreen/governance/post/castVote/partial/DisplayValue';
import { Balance } from '@polkadot/types/interfaces';
import { BN_ZERO } from '@polkadot/util';

import { ShowBalance, SignArea2, WrongPasswordAlert } from '../../../../../components';
import { useTranslation } from '../../../../../components/translate';
import { useInfo, useStakingAccount, useStakingConsts, useValidators, useValidatorsIdentities } from '../../../../../hooks';
import { Proxy, TxInfo } from '../../../../../util/types';
import { Inputs } from '../../../Entry';
import { STEPS } from '../../../pool/stake';
import ValidatorsTable from '../../partials/ValidatorsTable';

interface Props {
  address: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  inputs: Inputs;
  step: number;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>
}

export default function Review ({ address, inputs, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();

  const stakingConsts = useStakingConsts(address);
  const stakingAccount = useStakingAccount(address);
  const allValidatorsInfo = useValidators(address);
  const allValidatorsAccountIds = useMemo(() => allValidatorsInfo && allValidatorsInfo.current.concat(allValidatorsInfo.waiting)?.map((v) => v.accountId), [allValidatorsInfo]);
  const allValidatorsIdentities = useValidatorsIdentities(address, allValidatorsAccountIds);

  const { api, formatted, token } = useInfo(address);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const { call, params, selectedValidators } = inputs;

  const extraInfo = useMemo(() => ({
    action: 'Solo Staking',
    fee: String(estimatedFee || 0),
    subAction: 'Select Validator',
    validatorsCount: selectedValidators?.length
  }), [estimatedFee, selectedValidators?.length]);

  useEffect(() => {
    if (call && params && formatted) {
      call(...params)
        .paymentInfo(formatted)
        .then((i) => setEstimatedFee(i?.partialFee))
        .catch(console.error);
    }
  }, [formatted, params, call]);

  const handleCancel = useCallback(
    () => setStep(STEPS.INDEX)
    , [setStep]);

  return (
    <Grid alignItems='center' container item justifyContent='flex-start'>
      <Typography fontSize='14px' pb='15px' width='100%'>
        {t('Review the newly selected validators')}
      </Typography>
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      <Grid item mt='10px' xs={12}>
        <ValidatorsTable
          address={address}
          allValidatorsIdentities={allValidatorsIdentities}
          formatted={formatted}
          height={window.innerHeight - 444}
          staked={stakingAccount?.stakingLedger?.active ?? BN_ZERO}
          stakingConsts={stakingConsts}
          token={token}
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
            proxyTypeFilter={['Any', 'NonTransfer', 'Staking']}
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
