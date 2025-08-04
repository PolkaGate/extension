// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import React, { useMemo, useState } from 'react';

import { useChainInfo, useEstimatedFee2, useFormatted3, useTranslation } from '../../../../hooks';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
  newSelectedValidators: ValidatorInformation[];
}

export default function ReviewPopup ({ address, genesisHash, newSelectedValidators, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const nominate = api?.tx['staking']['nominate'];

  const params = newSelectedValidators.map((v) => v.accountId.toString());

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, nominate, [params]);

  const transactionInformation = useMemo(() => {
    return [{
      content: newSelectedValidators.length.toString(),
      title: t('Validators')
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    }];
  }, [estimatedFee2, newSelectedValidators.length, t]);
  const tx = useMemo(() => nominate?.(params), [params, nominate]);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.REVIEW);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={onClose}
      proxyTypeFilter={PROXY_TYPE.STAKING}
      setFlowStep={setFlowStep}
      title={t('Manage Validators')}
      transaction={tx}
      transactionInformation={transactionInformation}
    />
  );
}
