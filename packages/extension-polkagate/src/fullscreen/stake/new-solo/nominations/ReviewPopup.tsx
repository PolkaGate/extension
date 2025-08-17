// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '@polkadot/extension-polkagate/partials/Review';
import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';
import type { StakingConsts } from '../../../../util/types';

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
  stakingConsts: StakingConsts | null | undefined;
}

export default function ReviewPopup ({ address, genesisHash, newSelectedValidators, onClose, stakingConsts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const nominate = api?.tx['staking']['nominate'];

  const params = newSelectedValidators.map((v) => v.accountId.toString());

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, nominate, [params]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: `${newSelectedValidators.length} / ${stakingConsts?.maxNominations ?? 16}`,
      title: t('Validators')
    },
    {
      content: estimatedFee2,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [estimatedFee2, newSelectedValidators.length, stakingConsts?.maxNominations, t]);
  const tx = useMemo(() => nominate?.(params), [params, nominate]);
  const extraDetailConfirmationPage = useMemo(() => {
    const nominators = newSelectedValidators.map(({ accountId }) => accountId.toString());

    return { nominators };
  }, [newSelectedValidators]);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.REVIEW);

  return (
    <StakingPopup
      address={address}
      extraDetailConfirmationPage={extraDetailConfirmationPage}
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
