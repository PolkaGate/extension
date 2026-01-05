// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { Content } from '@polkadot/extension-polkagate/src/partials/Review';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Proxy } from '../../../util/types';
import type { UnlockType } from '../useTokenInfoDetails';

import React, { useCallback, useMemo, useState } from 'react';

import { SelectedProxy } from '@polkadot/extension-polkagate/src/components';
import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/components/DraggableModal';
import { RewardHeaderAmount } from '@polkadot/extension-polkagate/src/fullscreen/stake/new-pool/claimReward/partials/Review';
import TransactionFlow from '@polkadot/extension-polkagate/src/fullscreen/stake/partials/TransactionFlow';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '@polkadot/extension-polkagate/src/fullscreen/stake/util/utils';
import { useChainInfo, useEstimatedFee, useIsExtensionPopup, useTransactionFlow, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { PROXY_TYPE } from '@polkadot/extension-polkagate/src/util/constants';
import { isBn } from '@polkadot/util';

const UnlockEx = ({ address, amount, closeModal, genesisHash, transaction, transactionInformation }: UnlockFsProps) => {
  const { t } = useTranslation();
  const { token } = useChainInfo(genesisHash, true);

  return useTransactionFlow({
    address,
    backPathTitle: t('Unlock Amount'),
    closeReview: closeModal,
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: PROXY_TYPE.GOVERNANCE,
    review: true,
    reviewHeader:
    <RewardHeaderAmount
    amount={amount}
    genesisHash={genesisHash}
    style={{ bgcolor: '#110F2A', borderRadius: '14px', p: '34px 24px' }}
    title={t('Unlocking Amount')}
    token={token}
    />,
    showAccountBox: false,
    showStakingHome: false,
    stepCounter: { currentStep: 1, totalSteps: 1 },
    transactionInformation,
    tx: transaction
  });
};

interface UnlockFsProps {
  closeModal: () => void;
  genesisHash: string;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  transactionInformation: Content[];
  amount: string | undefined;
  address: string | undefined;
}

const UnlockFs = ({ address, amount, closeModal, genesisHash, transaction, transactionInformation }: UnlockFsProps) => {
  const { t } = useTranslation();
  const { token } = useChainInfo(genesisHash, true);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.REVIEW);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  return (
    <DraggableModal
      RightItem={
        selectedProxy && genesisHash &&
        <SelectedProxy
          genesisHash={genesisHash}
          signerInformation={{
            onClick: () => setShowProxySelection(true),
            selectedProxyAddress
          }}
        />
      }
      maxHeight={550}
      minHeight={475}
      onClose={closeModal}
      open
      showBackIconAsClose
      title={t('Unlock Amount')}
    >
      <TransactionFlow
        address={address}
        closeReview={closeModal}
        extraDetailConfirmationPage={{ amount }}
        flowStep={flowStep}
        genesisHash={genesisHash}
        proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
        reviewHeader={
          <RewardHeaderAmount
            amount={amount}
            genesisHash={genesisHash}
            style={{ py: '10px' }}
            title={t('Unlocking Amount')}
            token={token}
          />}
        reviewStyle={{ height: '460px' }}
        selectedProxy={selectedProxy}
        setFlowStep={setFlowStep}
        setSelectedProxy={setSelectedProxy}
        setShowProxySelection={setShowProxySelection}
        showAccountBox={false}
        showProxySelection={showProxySelection}
        transaction={transaction}
        transactionInformation={transactionInformation}
      />
    </DraggableModal>
  );
};

interface Props {
  unlockTracks: UnlockType;
  setOpenUnlockReview: React.Dispatch<React.SetStateAction<boolean>>;
  genesisHash: string | undefined;
  address: string | undefined;
}

export default function UnlockTrack ({ address, genesisHash, setOpenUnlockReview, unlockTracks }: Props) {
  const isExtension = useIsExtensionPopup();
  const { t } = useTranslation();
  const { api } = useChainInfo(genesisHash);

  const remove = api?.tx['convictionVoting']['removeVote']; // (class, index)
  const unlockClass = api?.tx['convictionVoting']['unlock']; // (class)
  const batchAll = api?.tx['utility']['batchAll'];

  const tx = useMemo(() => {
    if (!api || !address || !unlockTracks.classToUnlock || !remove || !unlockClass || !batchAll) {
      return undefined;
    }

    const removes = unlockTracks.classToUnlock.map((r) => isBn(r.refId) ? remove(r.classId, r.refId) : undefined).filter((i) => !!i);
    const uniqueSet = new Set<string>();

    unlockTracks.classToUnlock.forEach(({ classId }) => {
      const id = classId.toString();

      uniqueSet.add(id);
    });

    const unlocks = [...uniqueSet].map((id) => unlockClass(id, address));

    const params = [...removes, ...unlocks];

    return batchAll(params);
  }, [address, api, batchAll, unlockTracks.classToUnlock, remove, unlockClass]);

  const estimatedFee = useEstimatedFee(genesisHash, address, tx);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: address,
      title: t('Account')
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [address, estimatedFee, t]);

  const closeModal = useCallback(() => setOpenUnlockReview(false), [setOpenUnlockReview]);

  return useMemo(() => {
    if (!tx || !genesisHash) {
      return <></>;
    }

    if (isExtension) {
      return (
        <UnlockEx
          address={address}
          amount={unlockTracks.unlockableAmount?.toString()}
          closeModal={closeModal}
          genesisHash={genesisHash}
          transaction={tx}
          transactionInformation={transactionInformation}
        />);
    }

    return (
      <UnlockFs
        address={address}
        amount={unlockTracks.unlockableAmount?.toString()}
        closeModal={closeModal}
        genesisHash={genesisHash}
        transaction={tx}
        transactionInformation={transactionInformation}
      />);
  }, [address, closeModal, genesisHash, isExtension, transactionInformation, tx, unlockTracks.unlockableAmount]);
}
