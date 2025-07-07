// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Proxy } from '../../../../util/types';

import { Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { GradientButton, SelectedProxy } from '../../../../components/index';
import { useChainInfo, useTranslation } from '../../../../hooks';
import FeeValue from '../../../../popup/staking/partial/FeeValue';
import StakeAmountInput from '../../../../popup/staking/partial/StakeAmountInput';
import TokenStakeStatus from '../../../../popup/staking/partial/TokenStakeStatus';
import { useRestakeSolo } from '../../../../util/api/staking';
import { DraggableModal } from '../../../components/DraggableModal';
import TransactionFlow from '../../partials/TransactionFlow';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow, getCloseBehavior } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

function Restake ({ address, genesisHash, onClose }: Props) {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const { errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    rebondValue,
    setRebondValue,
    transactionInformation,
    tx,
    unlockingAmount } = useRestakeSolo(address, genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const onNext = useCallback(() => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.REVIEW), []);
  const closeReview = useCallback(() => {
    setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE);
    setRebondValue(undefined);
  }, [setRebondValue]);
  const handleClosePopup = useCallback(() => {
    onClose();
    closeReview();
  }, [closeReview, onClose]);

  const { onClose: handler, showCloseIcon } = getCloseBehavior(flowStep, handleClosePopup, setFlowStep);

  return (
    <DraggableModal
      RightItem={
        selectedProxy && genesisHash &&
        <SelectedProxy
          genesisHash={genesisHash}
          signerInformation={{
            onClick: () => setShowProxySelection(true),
            selectedProxyAddress
          }}
        />
      }
      maxHeight={605}
      minHeight={605}
      noCloseButton={showCloseIcon === undefined}
      onClose={handler}
      open
      showBackIconAsClose={!showCloseIcon}
      title={t('Unstaking')}
    >
      {flowStep === FULLSCREEN_STAKING_TX_FLOW.NONE
        ? (
          <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', position: 'relative', px: '15px', zIndex: 1 }}>
            <TokenStakeStatus
              amount={unlockingAmount}
              decimal={decimal}
              genesisHash={genesisHash}
              style={{ mt: '8px' }}
              text={t('Unstaking')}
              token={token}
            />
            <StakeAmountInput
              buttonsArray={[{
                buttonName: t('Max'),
                value: onMaxValue
              }]}
              decimal={decimal}
              errorMessage={errorMessage}
              focused
              onInputChange={onInputChange}
              style={{ mb: '18px', mt: '18px' }}
              title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
              titleInColor={` (${token?.toUpperCase() ?? '--'})`}
            />
            <FeeValue
              decimal={decimal}
              feeValue={estimatedFee}
              token={token}
            />
            <GradientButton
              disabled={!rebondValue || rebondValue.isZero() || !!errorMessage || !api}
              onClick={onNext}
              style={{ marginTop: '215px' }}
              text={t('Next')}
            />
          </Stack>)
        : tx && genesisHash
          ? (
            <TransactionFlow
              address={address}
              closeReview={closeReview}
              flowStep={flowStep}
              genesisHash={genesisHash}
              proxyTypeFilter={[]}
              selectedProxy={selectedProxy}
              setFlowStep={setFlowStep}
              setSelectedProxy={setSelectedProxy}
              setShowProxySelection={setShowProxySelection}
              showProxySelection={showProxySelection}
              transaction={tx}
              transactionInformation={transactionInformation}
            />)
          : <></>
      }
    </DraggableModal>
  );
}

export default React.memo(Restake);
