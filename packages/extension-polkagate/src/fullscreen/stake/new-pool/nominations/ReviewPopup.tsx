// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '@polkadot/extension-polkagate/partials/Review';
import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useChainInfo, useEstimatedFee, useFormatted, useTranslation } from '../../../../hooks';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  maximum: number;
  newSelectedValidators: ValidatorInformation[];
  onClose: () => void;
  poolId: number | undefined;
}

export default function ReviewPopup({ address, genesisHash, maximum, newSelectedValidators, onClose, poolId }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api } = useChainInfo(genesisHash);
  const navigate = useNavigate();
  const formatted = useFormatted(address, genesisHash);

  const nominate = api?.tx['nominationPools']?.['nominate'];
  const params = newSelectedValidators.map((v) => v.accountId.toString());
  const estimatedFee = useEstimatedFee(genesisHash, formatted, nominate, poolId === undefined ? undefined : [poolId, params]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: `${newSelectedValidators.length} / ${maximum}`,
      title: t('Validators')
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [estimatedFee, maximum, newSelectedValidators.length, t]);

  const tx = useMemo(() => poolId === undefined ? undefined : nominate?.(poolId, params), [nominate, params, poolId]);
  const extraDetailConfirmationPage = useMemo(() => {
    const nominators = newSelectedValidators.map(({ accountId }) => accountId.toString());

    return { nominators };
  }, [newSelectedValidators]);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.REVIEW);

  const handleClose = useCallback(() => {
    if (flowStep === FULLSCREEN_STAKING_TX_FLOW.REVIEW) {
      onClose();

      return;
    }

    navigate(-1) as void;
  }, [flowStep, navigate, onClose]);

  return (
    <StakingPopup
      _onClose={handleClose}
      address={address}
      extraDetailConfirmationPage={extraDetailConfirmationPage}
      flowStep={flowStep}
      genesisHash={genesisHash}
      onClose={handleClose}
      proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
      setFlowStep={setFlowStep}
      showBack
      title={t('Manage Nominations')}
      transaction={tx}
      transactionInformation={transactionInformation}
    />
  );
}
