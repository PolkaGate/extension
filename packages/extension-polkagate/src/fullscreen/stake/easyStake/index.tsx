// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { PositionInfo } from '../../../util/types';

import React, { memo, useCallback, useEffect, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { DecisionButtons } from '../../../components';
import { useChainInfo, useEasyStake, useTranslation } from '../../../hooks';
import StakingPopup from '../partials/StakingPopup';
import { EasyStakeSide, FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow, type SelectedEasyStakingType } from '../util/utils';
import InputPage from './InputPage';
import SelectPool from './SelectPool';
import SelectValidator from './SelectValidator';
import StakingTypeSelection from './StakingTypeSelection';

interface Props {
  address: string | undefined;
  onClose: () => void;
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
  selectedPosition: PositionInfo | undefined;
}

function EasyStake ({ address, onClose, selectedPosition, setSelectedPosition }: Props) {
  const { t } = useTranslation();
  const { token } = useChainInfo(selectedPosition?.genesisHash);

  const [selectedStakingType, setSelectedStakingType] = useState<SelectedEasyStakingType | undefined>(undefined);

  const { amount,
    availableBalanceToStake,
    buttonDisable,
    errorMessage,
    initialPool,
    onChangeAmount,
    onMaxMinAmount,
    setAmount,
    transactionInformation,
    tx } = useEasyStake(address, selectedPosition?.genesisHash, selectedStakingType);

  const [side, setSide] = useState<EasyStakeSide>(EasyStakeSide.INPUT);
  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);
  const [BNamount, setBNamount] = useState<BN | null | undefined>(BN_ZERO);
  // const [isNextClicked, setNextIsClicked] = useState<boolean>(false);

  useEffect(() => {
    if (selectedStakingType || !initialPool) {
      return;
    }

    setSelectedStakingType({
      pool: initialPool,
      type: 'pool',
      validators: undefined
    });
  }, [initialPool, selectedStakingType]);

  useEffect(() => {
    if (BNamount === BN_ZERO) {
      return;
    }

    setAmount(undefined);
    setBNamount(BN_ZERO);
  }, [BNamount, setAmount]);

  const onNext = useCallback(() => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.REVIEW), []);

  const handleClose = useCallback(() => {
    onClose();
    setSelectedPosition(undefined);
  }, [onClose, setSelectedPosition]);

  const handleBack = useCallback(() => {
    switch (side) {
      case EasyStakeSide.INPUT:
        handleClose();
        break;

      case EasyStakeSide.SELECT_VALIDATORS:
      case EasyStakeSide.SELECT_POOL:
        setSide(EasyStakeSide.STAKING_TYPE);
        break;

      case EasyStakeSide.STAKING_TYPE:
        setSide(EasyStakeSide.INPUT);
        break;

      default:
        break;
    }
  }, [handleClose, side]);

  const handleNext = useCallback(() => {
    if (side === EasyStakeSide.INPUT) {
      onNext();

      return;
    }

    setSide((pervSide) => pervSide - 1);
  }, [onNext, side]);

  return (
    <StakingPopup
      _onClose={side !== EasyStakeSide.INPUT ? handleBack : undefined}
      address={address}
      flowStep={flowStep}
      genesisHash={selectedPosition?.genesisHash}
      maxHeight={660}
      minHeight={415}
      noDivider
      onClose={handleClose}
      pool={selectedStakingType?.pool}
      setFlowStep={setFlowStep}
      setValue={setBNamount}
      showBack
      style={{ overflow: 'hidden', position: 'relative' }}
      title={t('Stake {{token}}', { replace: { token } })}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <>
        {side === EasyStakeSide.INPUT &&
          <InputPage
            amount={amount}
            availableBalanceToStake={availableBalanceToStake}
            errorMessage={errorMessage}
            genesisHash={selectedPosition?.genesisHash}
            onChangeAmount={onChangeAmount}
            onMaxMinAmount={onMaxMinAmount}
            rate={selectedPosition?.rate}
            selectedStakingType={selectedStakingType}
            setSide={setSide}
          />
        }
        {side === EasyStakeSide.STAKING_TYPE &&
          <StakingTypeSelection
            initialPool={initialPool}
            selectedPosition={selectedPosition}
            selectedStakingType={selectedStakingType}
            setSelectedStakingType={setSelectedStakingType}
            setSide={setSide}
          />
        }
        {side === EasyStakeSide.SELECT_POOL &&
          <SelectPool
            genesisHash={selectedPosition?.genesisHash}
            setSelectedStakingType={setSelectedStakingType}
            setSide={setSide}
          />
        }
        {side === EasyStakeSide.SELECT_VALIDATORS &&
          <SelectValidator
            genesisHash={selectedPosition?.genesisHash}
            selectedStakingType={selectedStakingType}
            setSelectedStakingType={setSelectedStakingType}
            setSide={setSide}
            suggestedValidators={selectedPosition?.suggestedValidators}
          />
        }
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={side === EasyStakeSide.INPUT ? !!buttonDisable : false}
          onPrimaryClick={handleNext}
          onSecondaryClick={handleBack}
          primaryBtnText={side === EasyStakeSide.INPUT ? t('Continue') : t('Apply')}
          secondaryBtnText={t('Back')}
          style={{ display: [EasyStakeSide.SELECT_POOL, EasyStakeSide.SELECT_VALIDATORS].includes(side) ? 'none' : 'flex', paddingInline: '18px' }}
        />
      </>
    </StakingPopup>
  );
}

export default memo(EasyStake);
