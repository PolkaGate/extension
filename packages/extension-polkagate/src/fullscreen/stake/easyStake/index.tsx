// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { PositionInfo } from '../../../util/types';

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { GradientButton } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import StakeAmountInput from '../../../popup/staking/partial/StakeAmountInput';
import { useEasyStake } from '../../../util/api';
import getLogo2 from '../../../util/getLogo2';
import StakingPopup from '../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../util/utils';
import { Stack } from '@mui/material';

interface Props {
  address: string | undefined;
  onClose: () => void;
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
  selectedPosition: PositionInfo | undefined;
}

function EasyStake ({ address, onClose, selectedPosition, setSelectedPosition }: Props) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(selectedPosition?.genesisHash, true);

  const { 
    // amount,
    // amountAsBN,
    availableBalanceToStake,
    buttonDisable,
    errorMessage,
    onChangeAmount,
    onThresholdAmount,
    setAmount } = useEasyStake(address, selectedPosition?.genesisHash);

  console.log('selectedPosition:', selectedPosition);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);
  const [BNamount, setBNamount] = useState<BN | null | undefined>(BN_ZERO);
  // const [isNextClicked, setNextIsClicked] = useState<boolean>(false);

  useEffect(() => {
    if (BNamount === BN_ZERO) {
      return;
    }

    setAmount(undefined);
    setBNamount(BN_ZERO);
  }, [BNamount, setAmount]);

  const logoInfo = useMemo(() => getLogo2(selectedPosition?.genesisHash, token), [selectedPosition?.genesisHash, token]);
  const onNext = useCallback(() => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.REVIEW), []);
  const handleClose = useCallback(() => {
    onClose();
    setSelectedPosition(undefined);
  }, [onClose, setSelectedPosition]);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={selectedPosition?.genesisHash}
      onClose={handleClose}
      setFlowStep={setFlowStep}
      setValue={setBNamount}
      title={t('Stake {{token}}', { replace: { token } })}
      transaction={undefined}
      transactionInformation={[]}
    >
      <Stack direction='column' sx={{ p: '18px', pt: 0 }}>
        <StakeAmountInput
          buttonsArray={[{
            buttonName: t('Max'),
            value: onThresholdAmount('max') ?? '0'
          },
          {
            buttonName: t('Min'),
            value: onThresholdAmount('min') ?? '0'
          }]}
          decimal={decimal}
          errorMessage={errorMessage}
          focused
          onInputChange={onChangeAmount}
          style={{ mb: '18px', mt: '18px' }}
          subAmount={{
            amount: availableBalanceToStake,
            decimal,
            genesisHash: selectedPosition?.genesisHash,
            logoInfo,
            title: t('Available'),
            token
          }}
          title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
          titleInColor={` (${token?.toUpperCase() ?? '--'})`}
        />
        <GradientButton
          disabled={buttonDisable}
          isBusy={false}
          onClick={onNext}
          style={{ marginTop: '265px' }}
          text={t('Next')}
        />
      </Stack>
    </StakingPopup>
  );
}

export default memo(EasyStake);
