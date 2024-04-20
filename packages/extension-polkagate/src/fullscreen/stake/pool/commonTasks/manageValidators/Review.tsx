// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import SelectProxyModal2 from '@polkadot/extension-polkagate/src/fullscreen/governance/components/SelectProxyModal2';
import DisplayValue from '@polkadot/extension-polkagate/src/fullscreen/governance/post/castVote/partial/DisplayValue';
import { Balance } from '@polkadot/types/interfaces';
import { BN, BN_ZERO } from '@polkadot/util';

import { ShowBalance, SignArea2, WrongPasswordAlert } from '../../../../../components';
import { useTranslation } from '../../../../../components/translate';
import { useInfo, useProxies } from '../../../../../hooks';
import { Proxy, ProxyItem, StakingConsts, TxInfo } from '../../../../../util/types';
import { Inputs } from '../../../Entry';
import ValidatorsTable from '../../../solo/partials/ValidatorsTable';
import { STEPS } from '.';

interface Props {
  address: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  inputs: Inputs;
  step: number;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  staked: BN | undefined;
  stakingConsts: StakingConsts | null | undefined;
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined;
}

export default function Review ({ address, allValidatorsIdentities, inputs, setStep, setTxInfo, staked, stakingConsts, step }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { api, formatted, token } = useInfo(address);
  const proxies = useProxies(api, formatted);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();

  const { call, params, selectedValidators } = inputs;

  const extraInfo = useMemo(() => ({
    action: 'Pool Staking',
    fee: String(estimatedFee || 0),
    subAction: 'Select Validator',
    validatorsCount: selectedValidators?.length
  }), [estimatedFee, selectedValidators?.length]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  useEffect(() => {
    if (call && params && formatted) {
      call(...params)
        .paymentInfo(formatted)
        .then((i) => setEstimatedFee(i?.partialFee))
        .catch(console.error);
    }
  }, [formatted, params, call]);

  const handleCancel = useCallback(() => setStep(STEPS.INDEX), [setStep]);
  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), [setStep]);

  return (
    <>
      {step === STEPS.REVIEW &&
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
                proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
                secondaryBtnText={t('Back')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
                setTxInfo={setTxInfo}
                step={step}
                steps={STEPS}
                token={token}
              />
            </Grid>
          </Grid>
        </Grid>
      }
      {step === STEPS.PROXY &&
        <SelectProxyModal2
          address={address}
          closeSelectProxy={closeProxy}
          height={500}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
        />
      }
    </>
  );
}
