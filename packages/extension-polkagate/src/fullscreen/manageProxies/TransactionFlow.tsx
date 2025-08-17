// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, TransactionDetail, TxInfo } from '../../util/types';

import React, { useCallback, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { SelectedProxy } from '../../components';
import { useEstimatedFee2, useTranslation } from '../../hooks';
import { WaitScreen2 } from '../../partials';
import { DraggableModal } from '../components/DraggableModal';
import Confirmation from './Confirmation';
import { STEPS } from './consts';
import Review from './Review';
import { type ProxyFlowStep } from './types';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<ProxyFlowStep>>;
  proxyItems: ProxyItem[] | null | undefined;
  chain: Chain | null | undefined;
  depositedValue: BN | null | undefined;
  step: string;
  newDepositValue: BN | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

function TransactionFlow ({ address, api, chain, depositedValue, proxyItems, setRefresh, setStep, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const genesisHash = chain?.genesisHash;

  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const proxyDepositBase = api ? api.consts['proxy']['proxyDepositBase'] as unknown as BN : BN_ZERO;
  const proxyDepositFactor = api ? api.consts['proxy']['proxyDepositFactor'] as unknown as BN : BN_ZERO;
  const confirmDisabled = useMemo(() =>
    !proxyItems || proxyItems.length === 0 || proxyItems.every(({ status }) => status === 'current')
  ,
  [proxyItems]);

  const newDepositValue = useMemo(() => {
    if (!proxyItems || proxyItems.length === 0 || confirmDisabled) {
      return undefined;
    }

    const toAdds = proxyItems.filter(({ status }) => status === 'new').length;
    const olds = proxyItems.filter(({ status }) => status === 'current').length;

    if (olds) {
      return proxyDepositFactor.muln(olds + toAdds).add(proxyDepositBase);
    }

    if (toAdds) {
      return proxyDepositFactor.muln(toAdds).add(proxyDepositBase);
    }

    return BN_ZERO;
  }, [confirmDisabled, proxyDepositBase, proxyDepositFactor, proxyItems]);

  const depositToPay = useMemo(() => {
    if (depositedValue === undefined || newDepositValue === undefined) {
      return undefined;
    }

    if (depositedValue === null) {
      return newDepositValue;
    }

    if (depositedValue.gte(newDepositValue)) {
      return BN_ZERO;
    }

    return newDepositValue.sub(depositedValue);
  }, [depositedValue, newDepositValue]);

  const call = useMemo(() => {
    const removeProxy = api?.tx['proxy']['removeProxy']; /** (delegate, proxyType, delay) **/
    const addProxy = api?.tx['proxy']['addProxy']; /** (delegate, proxyType, delay) **/
    const batchAll = api?.tx['utility']['batchAll'];

    if (!removeProxy || !addProxy || !batchAll) {
      return undefined;
    }

    const temp: SubmittableExtrinsic<'promise'>[] = [];

    proxyItems?.forEach(({ proxy, status }) => {
      const { delay, delegate, proxyType } = proxy;

      // NOTE: we add one proxy but delete in batch

      status === 'remove' && temp.push(removeProxy(delegate, proxyType, delay));
      status === 'new' && temp.push(addProxy(delegate, proxyType, delay));
    });

    return temp.length > 1
      ? batchAll(temp)
      : temp[0];
  }, [api?.tx, proxyItems]);

  const fee = useEstimatedFee2(genesisHash, address, call);

  const handleClose = useCallback(() => {
    setRefresh(true);
    setStep(STEPS.INIT);
  }, [setRefresh, setStep]);

  const transactionDetail = useMemo(() => {
    if (!proxyItems?.length) {
      return;
    }

    const newProxy = proxyItems.find((item) => item.status === 'new');
    const removingProxy = proxyItems.filter((item) => item.status === 'remove');

    if (newProxy) {
      const { delegate, proxyType } = newProxy.proxy;

      return {
        accounts: [delegate],
        deposit: depositToPay,
        description: t('Proxy added'),
        extra:
        {
          type: proxyType
        },
        fee,
        proxyItems,
        ...txInfo
      } as TransactionDetail;
    }

    if (removingProxy?.length) {
      const delegates = removingProxy.map(({ proxy: { delegate } }) => delegate);

      return {
        accounts: delegates,
        deposit: depositToPay,
        description: t('Prox{{iesOrY}} removed', { replace: { iesOrY: removingProxy.length > 1 ? 'ies' : 'y' } }),
        extra:
        {
          removed: t('{{count}} prox{{iesOrY}}', { replace: { count: removingProxy.length, iesOrY: removingProxy.length > 1 ? 'ies' : 'y' } })
        },
        fee,
        proxyItems,
        ...txInfo
      } as TransactionDetail;
    }

    return undefined;
  }, [proxyItems, depositToPay, t, fee, txInfo]);

  const extraHeight = useMemo(() => {
    const basedHeight = 75;
    const newProxies = proxyItems?.filter(({ status }) => status === 'new');

    if (newProxies?.length) {
      return 0;
    }

    const removingProxies = proxyItems?.filter(({ status }) => status === 'remove');

    if (removingProxies?.length) {
      return removingProxies.length > 2 ? 2 * basedHeight : removingProxies.length === 2 ? basedHeight : 0;
    }

    return 0;
  }, [proxyItems]);

  return (
    <DraggableModal
      RightItem={
        selectedProxy && genesisHash &&
        <SelectedProxy
          genesisHash={chain.genesisHash}
          signerInformation={{
            onClick: () => setShowProxySelection(true),
            selectedProxyAddress
          }}
        />
      }
      noDivider
      onClose={handleClose}
      open={true}
      style={{ backgroundColor: '#1B133C', minHeight: step === STEPS.WAIT_SCREEN ? '320px' : `${540 + extraHeight}px`, padding: '20px 15px 10px' }}
      title={
        [STEPS.REVIEW, STEPS.SIGN_QR].includes(step)
          ? t('Review')
          : step === STEPS.WAIT_SCREEN
            ? t('In process')
            : t('Confirmation')
      }
    >
      <>
        {[STEPS.REVIEW, STEPS.SIGN_QR].includes(step) &&
          <Review
            address={address}
            call={call}
            depositToPay={depositToPay}
            fee={fee}
            genesisHash={chain?.genesisHash}
            onClose={handleClose}
            proxyItems={proxyItems}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
            setShowProxySelection={setShowProxySelection}
            setStep={setStep}
            setTxInfo={setTxInfo}
            showProxySelection={showProxySelection}
          />
        }
        {
          step === STEPS.WAIT_SCREEN &&
          <WaitScreen2 />
        }
        {
          step === STEPS.CONFIRMATION && transactionDetail &&
          <Confirmation
            address={address ?? ''}
            genesisHash={genesisHash}
            transactionDetail={transactionDetail}
          />
        }
      </>
    </DraggableModal>
  );
}

export default React.memo(TransactionFlow);
