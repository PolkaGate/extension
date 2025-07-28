// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { PositionInfo } from '../../../util/types';

import { Collapse, Container, Stack, Typography } from '@mui/material';
import { ArrowRight2, People } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { GradientButton } from '../../../components';
import { useChainInfo, useEasyStake, useTranslation } from '../../../hooks';
import StakeAmountInput from '../../../popup/staking/partial/StakeAmountInput';
import getLogo2 from '../../../util/getLogo2';
import StakingPopup from '../partials/StakingPopup';
import { EasyStakeSide, FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow, type SelectedEasyStakingType } from '../util/utils';
// import SelectPool from './SelectPool';
import StakingTypeSelection from './StakingTypeSelection';

const StakingTypeOptionBox = ({ onClick, open, selectedStakingType }: { open: boolean; onClick: () => void; selectedStakingType: SelectedEasyStakingType | undefined; }) => {
  const { t } = useTranslation();

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
        {selectedStakingType?.type === 'pool' &&
          <Typography color='#82FFA5' sx={{ bgcolor: '#82FFA526', borderRadius: '9px', p: '2px 6px' }} variant='B-2'>
            {t('Recommended')}
          </Typography>}
      </Container>
    </Collapse>
  );
};

interface InputPageProp {
  genesisHash: string | undefined;
  onMaxAmount: string | undefined;
  onMinAmount: string | undefined;
  errorMessage: string | undefined;
  onChangeAmount: (value: string) => void;
  availableBalanceToStake: BN | undefined;
  amount: string | undefined;
  onNext: () => void;
  buttonDisable: boolean;
  selectedStakingType: SelectedEasyStakingType | undefined;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
}

const InputPage = ({ amount, availableBalanceToStake, buttonDisable, errorMessage, genesisHash, onChangeAmount, onMaxAmount, onMinAmount, onNext, selectedStakingType, setSide }: InputPageProp) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const onTypeOption = useCallback(() => setSide(EasyStakeSide.STAKING_TYPE), [setSide]);

  return (
    <Stack direction='column' sx={{ p: '18px' }}>
      <StakeAmountInput
        buttonsArray={[{
          buttonName: t('Max'),
          value: onMaxAmount ?? '0'
        },
        {
          buttonName: t('Min'),
          value: onMinAmount ?? '0'
        }]}
        decimal={decimal}
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
      <StakingTypeOptionBox onClick={onTypeOption} open={!!amount} selectedStakingType={selectedStakingType} />
      <GradientButton
        disabled={buttonDisable}
        isBusy={false}
        onClick={onNext}
        style={{ marginTop: '265px' }}
        text={t('Next')}
      />
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
  const { token } = useChainInfo(selectedPosition?.genesisHash, true);

  // amountAsBN,
  const { amount,
    availableBalanceToStake,
    buttonDisable,
    errorMessage,
    initialPool,
    onChangeAmount,
    onMaxAmount,
    onMinAmount,
    setAmount } = useEasyStake(address, selectedPosition?.genesisHash);

  const [side, setSide] = useState<EasyStakeSide>(EasyStakeSide.INPUT);
  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);
  const [BNamount, setBNamount] = useState<BN | null | undefined>(BN_ZERO);
  const [selectedStakingType, setSelectedStakingType] = useState<SelectedEasyStakingType | undefined>(undefined);
  // const [isNextClicked, setNextIsClicked] = useState<boolean>(false);

  useEffect(() => {
    if (selectedStakingType || !initialPool) {
      return;
    }

    setSelectedStakingType({
      pool: initialPool,
      type: 'pool'
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
      <>
        {side === EasyStakeSide.INPUT &&
          <InputPage
            amount={amount}
            availableBalanceToStake={availableBalanceToStake}
            buttonDisable={buttonDisable}
            errorMessage={errorMessage}
            genesisHash={selectedPosition?.genesisHash}
            onChangeAmount={onChangeAmount}
            onMaxAmount={onMaxAmount}
            onMinAmount={onMinAmount}
            onNext={onNext}
            selectedStakingType={selectedStakingType}
            setSide={setSide}
          />
        }
        {side === EasyStakeSide.STAKING_TYPE &&
          <StakingTypeSelection
            address={address}
            genesisHash={selectedPosition?.genesisHash}
            selectedStakingType={selectedStakingType}
            setSelectedStakingType={setSelectedStakingType}
            setSide={setSide}
          />
        }
        {/* {side === EasyStakeSide.SELECT_POOL &&
          <SelectPool
            genesisHash={selectedPosition?.genesisHash}
            setSelectedStakingType={setSelectedStakingType}
          />
        } */}
      </>
    </StakingPopup>
  );
}

export default memo(EasyStake);
