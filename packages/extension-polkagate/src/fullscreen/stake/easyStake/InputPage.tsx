// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { StakingConsts } from '../../../util/types';

import { ChevronRightRounded } from '@mui/icons-material';
import { Collapse, Container, Stack, Typography } from '@mui/material';
import { People } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';

import SnowFlake from '@polkadot/extension-polkagate/src/components/SVG/SnowFlake';

import { useChainInfo, useTranslation } from '../../../hooks';
import StakeAmountInput from '../../../popup/staking/partial/StakeAmountInput';
import { EXTENSION_NAME } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import { EasyStakeSide, type SelectedEasyStakingType } from '../util/utils';

interface StakingTypeOptionBoxProps {
  open: boolean;
  onClick: () => void;
  selectedStakingType: SelectedEasyStakingType | undefined;
  stakingConsts: StakingConsts | null | undefined;
}

const StakingTypeOptionBox = ({ onClick, open, selectedStakingType, stakingConsts }: StakingTypeOptionBoxProps) => {
  const { t } = useTranslation();

  const isRecommended = useMemo(() => selectedStakingType?.type === 'pool' && selectedStakingType.pool?.metadata?.toLowerCase().includes(EXTENSION_NAME.toLowerCase()), [selectedStakingType?.pool?.metadata, selectedStakingType?.type]);

  return (
    <Collapse in={open}>
      <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, mt: '8px', p: '24px 18px' }}>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, width: 'fit-content' }}>
          {selectedStakingType?.type === 'pool'
            ? <People color='#AA83DC' size='24' variant='Bulk' />
            : <SnowFlake color='#AA83DC' size='24' />
          }
          <Stack direction='column' sx={{ gap: '4px', ml: '12px', width: 'fit-content' }}>
            <Typography color='text.primary' textAlign='left' variant='B-3'>
              {selectedStakingType?.type === 'pool'
                ? t('Pool Staking')
                : t('Solo Staking')}
            </Typography>
            {!isRecommended &&
              <Typography color='#AA83DC' textAlign='left' variant='B-1'>
                {selectedStakingType?.pool?.metadata}
                {selectedStakingType?.validators && t('Validators: {{selected}} of {{threshold}}', {
                  replace: {
                    selected: selectedStakingType.validators.length,
                    threshold: stakingConsts?.maxNominations || 16
                  }
                })}
              </Typography>}
          </Stack>
          {isRecommended &&
            <ChevronRightRounded sx={{ color: '#FFFFFF', fontSize: '25px' }} />
          }
        </Container>
        {isRecommended &&
          <Typography color='#82FFA5' sx={{ bgcolor: '#82FFA526', borderRadius: '9px', p: '2px 6px' }} variant='B-2'>
            {t('Recommended')}
          </Typography>}
        {!isRecommended &&
          <ChevronRightRounded sx={{ color: '#FFFFFF', fontSize: '25px' }} />
        }
      </Container>
    </Collapse>
  );
};

const EstimatedRate = ({ rate, show }: { show: boolean, rate: number | undefined }) => {
  const { t } = useTranslation();

  return (
    <Stack direction='row' sx={{ display: show ? 'flex' : 'none', justifyContent: 'space-between', m: '17px 0 3px', px: '5px', width: '100%' }}>
      <Typography color='primary.main' variant='B-1'>
        {t('Estimated rewards')}
      </Typography>
      <Stack direction='row' sx={{ columnGap: '5px', justifyContent: 'end', width: 'fit-content' }}>
        <Typography color='#82FFA5' variant='B-1'>
          {rate}%
        </Typography>
        <Typography color='#674394' variant='B-1'>
          / {t('year')}
        </Typography>
      </Stack>
    </Stack>
  );
};

interface InputPageProp {
  genesisHash: string | undefined;
  rate: number | undefined;
  onMaxMinAmount: (val: 'max' | 'min') => string | undefined;
  errorMessage: string | undefined;
  onChangeAmount: (value: string) => void;
  availableBalanceToStake: BN | undefined;
  amount: string | undefined;
  selectedStakingType: SelectedEasyStakingType | undefined;
  setSide: React.Dispatch<React.SetStateAction<EasyStakeSide>>;
  loading: boolean;
  stakingConsts: StakingConsts | null | undefined;
}

const InputPage = ({ amount, availableBalanceToStake, errorMessage, genesisHash, loading, onChangeAmount, onMaxMinAmount, rate, selectedStakingType, setSide, stakingConsts }: InputPageProp) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const onTypeOption = useCallback(() => setSide(EasyStakeSide.STAKING_TYPE), [setSide]);

  return (
    <Stack direction='column' sx={{ mt: '5px', p: '18px' }}>
      <StakeAmountInput
        bodyStyle={{ padding: '18px' }}
        buttonsArray={[{
          buttonName: t('Max'),
          value: onMaxMinAmount('max') ?? '0'
        },
        {
          buttonName: t('Min'),
          value: onMaxMinAmount('min') ?? '0'
        }]}
        decimal={decimal}
        dividerStyle={{ margin: '17px 0 17px' }}
        enteredValue={amount}
        errorMessage={errorMessage}
        focused
        onInputChange={onChangeAmount}
        subAmount={{
          amount: availableBalanceToStake,
          decimal,
          dividerStyle: { margin: '15px 0 5px' },
          genesisHash,
          logoInfo,
          title: t('Available'),
          token
        }}
        title={t('Enter amount')}
      />
      {!loading &&
        <StakingTypeOptionBox
          onClick={onTypeOption}
          open={!!amount && parseFloat(amount) !== 0}
          selectedStakingType={selectedStakingType}
          stakingConsts={stakingConsts}
        />}
      <EstimatedRate
        rate={rate}
        show={!!amount && parseFloat(amount) !== 0}
      />
    </Stack>
  );
};

export default memo(InputPage);
