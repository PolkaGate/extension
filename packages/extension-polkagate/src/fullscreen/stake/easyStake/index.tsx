// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { PositionInfo } from '../../../util/types';

import { Collapse, Container, Stack, Typography } from '@mui/material';
import { ArrowRight2, People } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { DecisionButtons } from '../../../components';
import { useChainInfo, useEasyStake, useTranslation } from '../../../hooks';
import StakeAmountInput from '../../../popup/staking/partial/StakeAmountInput';
import { EXTENSION_NAME } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import StakingPopup from '../partials/StakingPopup';
import { EasyStakeSide, FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow, type SelectedEasyStakingType } from '../util/utils';
import SelectPool from './SelectPool';
import SelectValidator from './SelectValidator';
import StakingTypeSelection from './StakingTypeSelection';

const StakingTypeOptionBox = ({ onClick, open, selectedStakingType }: { open: boolean; onClick: () => void; selectedStakingType: SelectedEasyStakingType | undefined; }) => {
  const { t } = useTranslation();

  const isRecommended = useMemo(() => selectedStakingType?.type === 'pool' && selectedStakingType.pool?.metadata?.toLowerCase().includes(EXTENSION_NAME.toLowerCase()), [selectedStakingType?.pool?.metadata, selectedStakingType?.type]);

  return (
    <Collapse in={open}>
      <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, mt: '8px', p: '24px 18px' }}>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, width: 'fit-content' }}>
          <People color='#AA83DC' size='24' style={{ marginRight: '6px' }} variant='Bulk' />
          <Typography color='text.primary' variant='B-3'>
            {t('Pool Staking')}
          </Typography>
          <ArrowRight2 color='#AA83DC' size='18' />
        </Container>
        {isRecommended &&
          <Typography color='#82FFA5' sx={{ bgcolor: '#82FFA526', borderRadius: '9px', p: '2px 6px' }} variant='B-2'>
            {t('Recommended')}
          </Typography>}
      </Container>
    </Collapse>
  );
};

interface InputPageProp {
  genesisHash: string | undefined;
  onMaxMinAmount: (val: 'max' | 'min') => string | undefined;
  errorMessage: string | undefined;
  onChangeAmount: (value: string) => void;
  availableBalanceToStake: BN | undefined;
  amount: string | undefined;
  selectedStakingType: SelectedEasyStakingType | undefined;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
}

const InputPage = ({ amount, availableBalanceToStake, errorMessage, genesisHash, onChangeAmount, onMaxMinAmount, selectedStakingType, setSide }: InputPageProp) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const onTypeOption = useCallback(() => setSide(EasyStakeSide.STAKING_TYPE), [setSide]);

  return (
    <Stack direction='column' sx={{ p: '18px' }}>
      <StakeAmountInput
        buttonsArray={[{
          buttonName: t('Max'),
          value: onMaxMinAmount('max') ?? '0'
        },
        {
          buttonName: t('Min'),
          value: onMaxMinAmount('min') ?? '0'
        }]}
        decimal={decimal}
        enteredValue={amount}
        errorMessage={errorMessage}
        focused
        onInputChange={onChangeAmount}
        subAmount={{
          amount: availableBalanceToStake,
          decimal,
          genesisHash,
          logoInfo,
          title: t('Available'),
          token
        }}
        title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
        titleInColor={` (${token?.toUpperCase() ?? '--'})`}
      />
      <StakingTypeOptionBox onClick={onTypeOption} open={!!amount && parseFloat(amount) !== 0} selectedStakingType={selectedStakingType} />
    </Stack>
  );
};

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
      onClose={handleClose}
      pool={selectedStakingType?.pool}
      setFlowStep={setFlowStep}
      setValue={setBNamount}
      showBack={!(side === EasyStakeSide.INPUT && flowStep === FULLSCREEN_STAKING_TX_FLOW.NONE)}
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
            setSelectedStakingType={setSelectedStakingType}
            setSide={setSide}
            suggestedValidators={selectedPosition?.suggestedValidators}
          />
        }
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={side === EasyStakeSide.INPUT ? buttonDisable : false}
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
