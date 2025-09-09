// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { PositionInfo } from '../../../util/types';

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { DecisionButtons } from '../../../components';
import { useChainInfo, useEasyStake, useTranslation } from '../../../hooks';
import { PROXY_TYPE } from '../../../util/constants';
import StakingPopup from '../partials/StakingPopup';
import { EasyStakeSide, FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../util/utils';
import EasyStakeReviewHeader from './partials/EasyStakeReviewHeader';
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
  const genesisHash = selectedPosition?.genesisHash;
  const { token } = useChainInfo(genesisHash);

  const { amount,
    amountAsBN,
    availableBalanceToStake,
    buttonDisable,
    errorMessage,
    initialPool,
    onChangeAmount,
    onMaxMinAmount,
    selectedStakingType,
    setAmount,
    setSelectedStakingType,
    setSide,
    side,
    stakingConsts,
    transactionInformation,
    tx } = useEasyStake(address, genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);
  const [BNamount, setBNamount] = useState<BN | null | undefined>(BN_ZERO);

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
  }, [handleClose, setSide, side]);

  const handleNext = useCallback(() => {
    if (side === EasyStakeSide.INPUT) {
      onNext();

      return;
    }

    setSide((pervSide) => pervSide - 1);
  }, [onNext, setSide, side]);

  const title = useMemo(() => {
    switch (side) {
      case EasyStakeSide.INPUT:
        return t('Stake {{token}}', { replace: { token } });

      case EasyStakeSide.SELECT_POOL:
        return t('List of pools');

      case EasyStakeSide.SELECT_VALIDATORS:
        return t('Validators');

      default:
        return t('Stake {{token}}', { replace: { token } });
    }
  }, [side, t, token]);

  return (
    <StakingPopup
      _onClose={side !== EasyStakeSide.INPUT ? handleBack : undefined}
      address={address}
      extraDetailConfirmationPage={{ amount: amountAsBN?.toString() }}
      flowStep={flowStep}
      genesisHash={genesisHash}
      maxHeight={700}
      minHeight={270}
      noDivider={side === EasyStakeSide.INPUT && flowStep === FULLSCREEN_STAKING_TX_FLOW.NONE}
      onClose={handleClose}
      proxyTypeFilter={
        selectedStakingType?.type === 'pool'
          ? PROXY_TYPE.NOMINATION_POOLS
          : PROXY_TYPE.STAKING
      }
      reviewHeader={
        <EasyStakeReviewHeader
          amount={amountAsBN?.toString()}
          genesisHash={genesisHash}
          token={token}
        />
      }
      setFlowStep={setFlowStep}
      setValue={setBNamount}
      showAccountBoxInReview={false}
      showBack
      style={{ overflow: 'hidden', position: 'relative' }}
      title={title}
      transaction={tx}
      transactionInformation={transactionInformation}
      width={[EasyStakeSide.SELECT_VALIDATORS, EasyStakeSide.SELECT_POOL].includes(side) ? 446 : undefined}
    >
      <>
        {side === EasyStakeSide.INPUT &&
          <InputPage
            amount={amount}
            availableBalanceToStake={availableBalanceToStake}
            errorMessage={errorMessage}
            genesisHash={genesisHash}
            loading={!initialPool}
            onChangeAmount={onChangeAmount}
            onMaxMinAmount={onMaxMinAmount}
            rate={selectedPosition?.rate}
            selectedStakingType={selectedStakingType}
            setSide={setSide}
            stakingConsts={stakingConsts}
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
            genesisHash={genesisHash}
            setSelectedStakingType={setSelectedStakingType}
            setSide={setSide}
          />
        }
        {side === EasyStakeSide.SELECT_VALIDATORS &&
          <SelectValidator
            genesisHash={genesisHash}
            selectedStakingType={selectedStakingType}
            setSelectedStakingType={setSelectedStakingType}
            setSide={setSide}
            suggestedValidators={selectedPosition?.suggestedValidators}
          />
        }
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={side === EasyStakeSide.INPUT ? !!buttonDisable || !initialPool : false}
          onPrimaryClick={handleNext}
          onSecondaryClick={handleBack}
          primaryBtnText={!initialPool ? t('Loading ...') : side === EasyStakeSide.INPUT ? t('Continue') : t('Apply')}
          secondaryBtnText={t('Back')}
          style={{ display: [EasyStakeSide.SELECT_POOL, EasyStakeSide.SELECT_VALIDATORS].includes(side) ? 'none' : 'flex', paddingInline: '18px' }}
        />
      </>
    </StakingPopup>
  );
}

export default memo(EasyStake);
