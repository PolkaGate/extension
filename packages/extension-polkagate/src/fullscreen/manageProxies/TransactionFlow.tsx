// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, TxInfo } from '../../util/types';

import { Box, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { BN_ZERO, noop } from '@polkadot/util';

import { CanPayErrorAlert, ChainLogo, SelectedProxy, ShowBalance, SignArea3 } from '../../components';
import { useCanPayFeeAndDeposit, useChainInfo, useEstimatedFee, useFormatted3, useTranslation } from '../../hooks';
import { FLOATING_POINT_DIGIT, PROXY_TYPE } from '../../util/constants';
import { DraggableModal } from '../components/DraggableModal';
import WaitScreen from '../governance/partials/WaitScreen';
import ProxyAccountInfo from './components/ProxyAccountInfo';
import Confirmation from './Confirmation';
import { STEPS } from './types';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<string>>;
  proxyItems: ProxyItem[] | null | undefined;
  chain: Chain | null | undefined;
  depositedValue: BN | null | undefined;
  step: string;
  newDepositValue: BN | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

function DisplayValue (
  { balance, decimal, genesisHash, label, token }: {
    label: string;
    genesisHash: string | undefined;
    balance: BN | undefined;
    decimal: number | undefined;
    token: string | undefined;
  }): React.ReactElement {
  return (
    <Stack direction='row' justifyContent='space-between'>
      <Typography color='#AA83DC' variant='B-1'>
        {label}
      </Typography>
      <Stack alignItems='center' columnGap={1} direction='row'>
        <ChainLogo genesisHash={genesisHash} size={18} />
        <Typography color='#EAEBF1' variant='B-1'>
          {decimal && token &&
            <ShowBalance
              balance={balance}
              decimal={decimal}
              decimalPoint={FLOATING_POINT_DIGIT}
              token={token}
            />}
        </Typography>
      </Stack>
    </Stack>
  );
}

function TransactionFlow ({ address, api, chain, depositedValue, proxyItems, setRefresh, setStep, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted3(address, chain?.genesisHash);
  const { decimal, token } = useChainInfo(chain?.genesisHash, true);

  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);

  const proxyDepositBase = api ? api.consts['proxy']['proxyDepositBase'] as unknown as BN : BN_ZERO;
  const proxyDepositFactor = api ? api.consts['proxy']['proxyDepositFactor'] as unknown as BN : BN_ZERO;
  const confirmDisabled = useMemo(() => !proxyItems || proxyItems.length === 0 || proxyItems.every(({ status }) => status === 'current'), [proxyItems]);

  const newDepositValue = useMemo(() => {
    if (!proxyItems || proxyItems.length === 0 || confirmDisabled) {
      return undefined;
    }

    const toAdds = proxyItems.filter(({ status }) => status === 'new').length;
    const olds = proxyItems.filter(({ status }) => status === 'current').length;

    if (olds > 0) {
      return proxyDepositFactor.muln(olds + toAdds).add(proxyDepositBase);
    }

    if (toAdds > 0) {
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
    } else if (depositedValue.gte(newDepositValue)) {
      return BN_ZERO;
    } else {
      return newDepositValue.sub(depositedValue);
    }
  }, [depositedValue, newDepositValue]);

  const removeProxy = api?.tx['proxy']['removeProxy']; /** (delegate, proxyType, delay) **/
  const addProxy = api?.tx['proxy']['addProxy']; /** (delegate, proxyType, delay) **/
  const batchAll = api?.tx['utility']['batchAll'];

  const changedItems = useMemo(() => proxyItems?.filter(({ status }) => status !== 'current'), [proxyItems]);

  const { mode, reviewText } = useMemo(() => {
    const settingProxy = proxyItems?.every(({ status }) => status === 'new');

    if (settingProxy) {
      return {
        mode: 'adding proxy(ies)',
        reviewText: `You are adding ${proxyItems && proxyItems.length > 1 ? `${proxyItems.length} proxies` : 'a proxy'}`
      };
    }

    const clearingProxy = proxyItems?.every(({ status }) => status === 'remove');

    if (clearingProxy) {
      return {
        mode: 'clearing proxy(ies)',
        reviewText: `You are clearing your ${proxyItems && proxyItems?.length > 1 ? 'proxies' : 'proxy'}`
      };
    }

    const toAdds = proxyItems?.filter(({ status }) => status === 'new').length;
    const toRemoves = proxyItems?.filter(({ status }) => status === 'remove').length;

    return {
      mode: 'managing proxy(ies)',
      reviewText: `You are ${toAdds && toAdds > 0 ? `adding ${toAdds} ${toRemoves && toRemoves > 0 ? ' and' : ''}` : ''} ${toRemoves && toRemoves > 0 ? `removing ${toRemoves}` : ''} ${(toAdds ?? 0) + (toRemoves ?? 0) > 1 ? 'proxies' : 'proxy'}`
    };
  }, [proxyItems]);

  const call = useMemo(() => {
    if (!removeProxy || !addProxy || !batchAll) {
      return undefined;
    }

    const temp: SubmittableExtrinsic<'promise'>[] = [];

    proxyItems?.forEach(({ proxy, status }) => {
      const { delay, delegate, proxyType } = proxy;

      status === 'remove' && temp.push(removeProxy(delegate, proxyType, delay));
      status === 'new' && temp.push(addProxy(delegate, proxyType, delay));
    });

    return temp.length > 1
      ? batchAll(temp)
      : temp[0];
  }, [addProxy, batchAll, proxyItems, removeProxy]);

  const estimatedFee = useEstimatedFee(address, chain?.genesisHash, call);

  const feeAndDeposit = useCanPayFeeAndDeposit(formatted?.toString(), selectedProxy?.delegate, estimatedFee, depositToPay);

  const backToManage = useCallback(() => {
    setStep(STEPS.MANAGE);
  }, [setStep]);

  const handleClose = useCallback(() => {
    setRefresh(true);
    setStep(STEPS.CHECK);
  }, [setRefresh, setStep]);

  return (
    <DraggableModal
      RightItem={
        selectedProxy && chain?.genesisHash &&
        <SelectedProxy
          genesisHash={chain.genesisHash}
          signerInformation={{
            onClick: () => setShowProxySelection(true),
            selectedProxyAddress
          }}
        />
      }
      noDivider
      onClose={backToManage}
      open={step !== STEPS.CHECK}
      style={{ backgroundColor: '#1B133C', minHeight: step === STEPS.WAIT_SCREEN ? '320px' : '540px', padding: '20px 15px 10px' }}
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
          <>
            <Grid container direction='column' item justifyContent='center'>
              {feeAndDeposit.isAbleToPay === false &&
                <CanPayErrorAlert canPayStatements={feeAndDeposit.statement} />
              }
              <Typography color='#BEAAD8' my='15px' textAlign='center' variant='B-4'>
                {reviewText}
              </Typography>
              {
                changedItems?.[0] &&
                <ProxyAccountInfo
                  handleDelete={noop}
                  proxyItem={changedItems?.[0]}
                  showCheck={false}
                  style={{ width: '100%' }}
                />}
              <Stack columnGap='10px' sx={{ bgcolor: '#05091C', borderRadius: '14px', marginTop: '15px', padding: '10px 15px' }}>
                <DisplayValue
                  balance={depositToPay}
                  decimal={decimal}
                  genesisHash={chain?.genesisHash}
                  label={t('Deposit')}
                  token={token}
                />
                <Box sx={{ background: ' linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', m: '10px 0 5px', width: '34s' }} />
                <DisplayValue
                  balance={estimatedFee}
                  decimal={decimal}
                  genesisHash={chain?.genesisHash}
                  label={t('Fee')}
                  token={token}
                />
              </Stack>
            </Grid>
            {
              call &&
              <SignArea3
                address={address}
                genesisHash={chain?.genesisHash}
                maybeApi={undefined}
                onClose={backToManage}
                proxyTypeFilter={PROXY_TYPE.GENERAL}
                selectedProxy={selectedProxy}
                setFlowStep={setStep}
                setSelectedProxy={setSelectedProxy}
                setShowProxySelection={setShowProxySelection}
                setTxInfo={setTxInfo}
                showProxySelection={showProxySelection}
                transaction={call}
                withCancel
              />}
            {/*            disabled={!depositToPay || feeAndDeposit.isAbleToPay !== true || !changedItems || changedItems.length === 0}          */}
          </>
        }
        {
          step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {
          step === STEPS.CONFIRMATION && txInfo && newDepositValue && changedItems &&
          <Confirmation
            address={address}
            depositAmount={newDepositValue}
            handleClose={handleClose}
            proxyItems={changedItems}
            txInfo={txInfo}
          />
        }
      </>
    </DraggableModal>
  );
}

export default React.memo(TransactionFlow);
