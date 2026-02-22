// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { GradientButton } from '../../../../components';
import { useChainInfo, useCreatePool, useFormatted, useTranslation } from '../../../../hooks';
import FeeValue from '../../../../popup/staking/partial/FeeValue';
import StakeAmountInput from '../../../../popup/staking/partial/StakeAmountInput';
import { PoolNameBox } from '../../../../popup/staking/pool-new/createPool';
import UpdateRoles from '../../../../popup/staking/pool-new/createPool/UpdateRoles';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function CreatePool({ address, genesisHash, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);

  const { bondAmount,
    errorMessage,
    estimatedFee,
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

  const onNext = useCallback(() => setFlowStep?.(FULLSCREEN_STAKING_TX_FLOW.REVIEW), [setFlowStep]);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={onClose}
      pool={poolToCreate}
      proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
      setFlowStep={setFlowStep}
      setValue={setBondAmount as React.Dispatch<React.SetStateAction<BN | null | undefined>>}
      title={t('Create Pool')}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', position: 'relative', px: '15px', zIndex: 1 }}>
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
          focused
          onInputChange={onInputAmountChange}
          style={{ '> div': { bgcolor: '#05091C' }, mb: '18px', mt: '18px' }}
          title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
          titleInColor={` (${token?.toUpperCase() ?? '--'})`}
        />
        <FeeValue
          decimal={decimal}
          feeValue={estimatedFee}
          token={token}
        />
        <UpdateRoles
          address={formatted ?? address ?? ''}
          roles={roles}
          setRoles={setRoles}
        />
        <GradientButton
          disabled={!bondAmount || bondAmount.isZero() || !!errorMessage || !api || !poolId}
          onClick={onNext}
          style={{ marginTop: '18px' }}
          text={t('Next')}
        />
      </Stack>
    </StakingPopup>
  );
}
