// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { Content } from '@polkadot/extension-polkagate/partials/Review';
import type { Balance } from '@polkadot/types/interfaces';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';

import { Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { DecisionButtons } from '@polkadot/extension-polkagate/src/components';

import { useChainInfo, useTranslation } from '../../../../hooks';
import FeeValue from '../../../../popup/staking/partial/FeeValue';
import StakeAmountInput from '../../../../popup/staking/partial/StakeAmountInput';
import TokenStakeStatus from '../../../../popup/staking/partial/TokenStakeStatus';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
  errorMessage: string | undefined;
  estimatedFee: Balance | undefined | null;
  onInputChange: (value: string | null | undefined) => void;
  onMaxValue: string;
  tx: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  transactionInformation: Content[];
  setValue: React.Dispatch<React.SetStateAction<BN | null | undefined>>;
  balance: BN | undefined;
  value: BN | null | undefined;
  amountLabel: string;
  title: string;
}

function StakeUnstake({ address, amountLabel, balance, errorMessage, estimatedFee, genesisHash, onClose, onInputChange, onMaxValue, setValue, title, transactionInformation, tx, value }: Props) {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);

  const onNext = useCallback(() => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.REVIEW), []);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      minHeight={520}
      onClose={onClose}
      proxyTypeFilter={PROXY_TYPE.STAKING}
      setFlowStep={setFlowStep}
      setValue={setValue}
      showBack
      title={title}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <Stack direction='column' justifyContent='space-between' sx={{ mt: '22px', position: 'relative', px: '15px', zIndex: 1 }}>
        <TokenStakeStatus
          amount={balance}
          decimal={decimal}
          genesisHash={genesisHash}
          style={{ mt: '8px', p: '16px' }}
          text={amountLabel}
          token={token}
        />
        <StakeAmountInput
          buttonsArray={[{
            buttonName: t('Max'),
            value: onMaxValue
          }]}
          decimal={decimal}
          dividerStyle={{ margin: '19px 0px' }}
          errorMessage={errorMessage}
          focused
          onInputChange={onInputChange}
          style={{ m: '8px 0 15px' }}
          title={t('Amount') + ` ${token?.toUpperCase() ?? '--'}`}
          titleInColor={`${token?.toUpperCase() ?? '--'}`}
        />
        <FeeValue
          decimal={decimal}
          feeValue={estimatedFee}
          token={token}
        />
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={!value || value.isZero() || !!errorMessage || !api || !balance}
          onPrimaryClick={onNext}
          onSecondaryClick={onClose}
          primaryBtnText={t('Next')}
          secondaryBtnText={t('Cancel')}
          style={{ marginTop: '55px', width: '100%' }}
        />
      </Stack>
    </StakingPopup>
  );
}

export default React.memo(StakeUnstake);
