// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { noop } from '@polkadot/util';

import { BackWithLabel, Motion } from '../../../components';
import { useChainInfo, useEstimatedFee2, useFormatted3, useSelectedAccount, useSoloStakingInfo, useTranslation } from '../../../hooks';
import UserDashboardHeader from '../../../partials/UserDashboardHeader';
import { amountToHuman, amountToMachine } from '../../../util/utils';
import FeeValue from '../partial/FeeValue';
import StakeAmountInput from '../partial/StakeAmountInput';
import StakingActionButton from '../partial/StakingActionButton';
import TokenStakeStatus from '../partial/TokenStakeStatus';

export default function BondExtra (): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  const rebond = api?.tx['staking']['rebond'];

  const [rebondValue, setRebondValue] = useState<BN | null | undefined>();

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, rebond, [rebondValue]);

  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setRebondValue(valueAsBN);
  }, [decimal]);
  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onMaxValue = useMemo(() => {
    if (!unlockingAmount || !decimal) {
      return '0';
    }

    return amountToHuman(unlockingAmount, decimal);
  }, [decimal, unlockingAmount]);
  const onNext = useCallback(() => noop, []);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' noAccountSelected />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            style={{ pb: 0 }}
            text={t('Restake')}
          />
          <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', mx: '15px' }}>
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
              onInputChange={onInputChange}
              style={{ mb: '18px', mt: '8px' }}
              title={t('Amount')}
              titleInColor={token?.toUpperCase()}
            />
            <FeeValue
              decimal={decimal}
              feeValue={estimatedFee2}
              token={token}
            />
            <StakingActionButton
              disabled={!rebondValue || rebondValue.isZero()}
              onClick={onNext}
              style={{ mt: '24px' }}
              text={t('Next')}
            />
          </Stack>
        </Motion>
      </Grid>
    </>
  );
}
