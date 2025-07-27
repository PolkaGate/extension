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
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../util/utils';

const StakingTypeOptionBox = ({ open }: { open: boolean; }) => {
  const { t } = useTranslation();

  return (
    <Collapse in={open}>
      <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, mt: '8px', p: '24px 18px' }}>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, width: 'fit-content' }}>
          <People color='#AA83DC' size='24' style={{ marginRight: '6px' }} variant='Bulk' />
          <Typography color='text.primary' variant='B-3'>
            {t('Pool Staking')}
          </Typography>
          <ArrowRight2 color='#AA83DC' size='18' />
        </Container>
        <Typography color='#82FFA5' sx={{ bgcolor: '#82FFA526', borderRadius: '9px', p: '2px 6px' }} variant='B-2'>
          {t('Recommended')}
        </Typography>
      </Container>
    </Collapse>
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
  const { decimal, token } = useChainInfo(selectedPosition?.genesisHash, true);

  // amountAsBN,
  const { amount,
    availableBalanceToStake,
    buttonDisable,
    errorMessage,
    onChangeAmount,
    onMaxAmount,
    onMinAmount,
    setAmount } = useEasyStake(address, selectedPosition?.genesisHash);

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
            genesisHash: selectedPosition?.genesisHash,
            logoInfo,
            title: t('Available'),
            token
          }}
          title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
          titleInColor={` (${token?.toUpperCase() ?? '--'})`}
        />
        <StakingTypeOptionBox open={!!amount} />
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
