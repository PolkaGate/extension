// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BackWithLabel, Motion } from '../../../../components';
import { useBackground, useChainInfo, useCreatePool, useFormatted, useIsExtensionPopup, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import { PROXY_TYPE } from '../../../../util/constants';
import Search from '../../components/Search';
import StakeAmountInput from '../../partial/StakeAmountInput';
import StakingActionButton from '../../partial/StakingActionButton';
import UpdateRoles from './UpdateRoles';

interface PoolNameBoxProp {
  onInputChange: (input: string) => void;
  initName: string;
  enteredValue: string | undefined;
}

export const PoolNameBox = ({ enteredValue, initName, onInputChange }: PoolNameBoxProp) => {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  return useMemo(() =>
    <Stack direction='column' sx={{ bgcolor: isExtension ? '#110F2A' : 'transparent', borderRadius: '14px', gap: '12px', p: isExtension ? '15px' : 0 }}>
      <Typography color='text.primary' textAlign='left' variant='B-1'>
        {t('Pool Name')}
      </Typography>
      <Search
        defaultValue={enteredValue}
        inputColor='#BEAAD8'
        noSearchIcon
        onSearch={onInputChange}
        placeholder={initName}
        style={{ '> div': { backgroundColor: '#2224424D', border: '1px solid #2E2B52', borderRadius: '12px', height: 'fit-content', p: '6px' }, width: '100%' }}
      />
    </Stack>
    , [enteredValue, initName, isExtension, onInputChange, t]);
};

export default function CreatePool() {
  useBackground('staking');

  const { t } = useTranslation();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const navigate = useNavigate();
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const { bondAmount,
    errorMessage,
    initName,
    onInputAmountChange,
    onMaxValue,
    onMetadataInputChange,
    onMinValue,
    poolId,
    poolMetadata,
    poolToCreate,
    roles,
    setBondAmount,
    setRoles,
    transactionInformation,
    tx } = useCreatePool(address, genesisHash);

  const [review, setReview] = useState<boolean>(false);

  const onBack = useCallback(() => navigate('/pool/' + genesisHash + '/stake') as void, [genesisHash, navigate]);
  const openReview = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview((onReview) => !onReview);
    setBondAmount(undefined);
  }, [setBondAmount]);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: t('Creating Pool'),
    closeReview,
    genesisHash: genesisHash ?? '',
    pool: poolToCreate,
    proxyTypeFilter: PROXY_TYPE.NOMINATION_POOLS,
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
      <UserDashboardHeader fullscreenURL={'/fullscreen-stake/pool/' + address + '/' + genesisHash} homeType='default' />
      <Motion style={{ height: 'calc(100% - 55px)' }} variant='slide'>
        <BackWithLabel
          onClick={onBack}
          stepCounter={{ currentStep: 1, totalSteps: 2 }}
          style={{ pb: 0 }}
          text={t('Create pool')}
        />
        <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', position: 'relative', px: '15px' }}>
          <PoolNameBox
            enteredValue={poolMetadata}
            initName={initName}
            onInputChange={onMetadataInputChange}
          />
          <StakeAmountInput
            buttonsArray={[{
              buttonName: t('Max'),
              value: onMaxValue
            },
            {
              buttonName: t('Min'),
              value: onMinValue
            }]}
            decimal={decimal}
            errorMessage={errorMessage}
            numberOnly
            onInputChange={onInputAmountChange}
            style={{ mb: '18px', mt: '8px' }}
            title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
            titleInColor={` (${token?.toUpperCase() ?? '--'})`}
          />
          <UpdateRoles
            address={formatted ?? address ?? ''}
            roles={roles}
            setRoles={setRoles}
          />
        </Stack>
        <StakingActionButton
          disabled={!bondAmount || bondAmount.isZero() || !!errorMessage || !api || !poolId}
          onClick={openReview}
          style={{ bottom: '18px', left: '15px', position: 'absolute', width: '345px' }}
          text={t('Next')}
        />
      </Motion>
    </Grid>
  );
}
