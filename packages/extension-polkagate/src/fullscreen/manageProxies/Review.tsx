// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { CanPayFee, Proxy, ProxyItem, TxInfo } from '../../util/types';

import { Box, Grid, Stack, Typography } from '@mui/material';
import React, { useMemo, useRef } from 'react';

import { noop } from '@polkadot/util';

import { ChainLogo, FadeOnScroll, ShowBalance, SignArea3 } from '../../components';
import { useCanPayFeeAndDeposit, useChainInfo, useTranslation } from '../../hooks';
import { UnableToPayFee } from '../../partials';
import { FLOATING_POINT_DIGIT, PROXY_TYPE, type TransactionFlowStep } from '../../util/constants';
import ProxyAccountInfo from './components/ProxyAccountInfo';
import { type ProxyFlowStep } from './types';

interface Props {
  address: string | undefined;
  call: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined
  genesisHash: string | undefined;
  depositToPay: BN | undefined;
  fee: Balance | undefined;
  setStep: React.Dispatch<React.SetStateAction<ProxyFlowStep>>;
  proxyItems: ProxyItem[] | null | undefined;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  selectedProxy: Proxy | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  setShowProxySelection: React.Dispatch<React.SetStateAction<boolean>>;
  showProxySelection: boolean;
  onClose: () => void
}

function DisplayValue ({ balance, canPayFee, decimal, genesisHash, label, token }: {
    canPayFee?: CanPayFee;
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
        {canPayFee?.isAbleToPay === false && canPayFee?.warning &&
          <UnableToPayFee warningText={canPayFee.warning} />
        }
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

function Review ({ address, call, depositToPay, fee, genesisHash, onClose, proxyItems, selectedProxy, setSelectedProxy, setShowProxySelection, setStep, setTxInfo, showProxySelection }: Props): React.ReactElement {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const { changingItems, reviewText } = useMemo(() => {
    const newProxies = proxyItems?.filter(({ status }) => status === 'new');

    if (newProxies?.length) {
      return {
        changingItems: newProxies,
        reviewText: t('You are adding {{count}} prox{{iesOrY}}', { replace: { count: newProxies.length, iesOrY: newProxies.length > 1 ? 'ies' : 'y' } }) as unknown as string
      };
    }

    const removingProxies = proxyItems?.filter(({ status }) => status === 'remove');

    if (removingProxies?.length) {
      return {
        changingItems: removingProxies,
        reviewText: t('Are you sure you want to remove {{count}} prox{{iesOrY}}?', { replace: { count: removingProxies.length, iesOrY: removingProxies.length > 1 ? 'ies' : 'y' } }) as unknown as string
      };
    }

    return {
      changingItems: [],
      reviewText: ''
    };
  }, [proxyItems, t]);

  const feeAndDeposit = useCanPayFeeAndDeposit(address, genesisHash, selectedProxy?.delegate, fee, depositToPay);

  return (
    <Grid container item>
      <Grid container direction='column' item justifyContent='start'>
        <Typography color='#BEAAD8' my='15px' textAlign='center' variant='B-4'>
          {reviewText}
        </Typography>
        <Stack direction='column' sx={{ height: 'fit-content', position: 'relative' }}>
          <Grid container item ref={refContainer} sx={{ borderRadius: '14px', height: 'fit-content', maxHeight: '250px', overflow: 'hidden', overflowY: 'auto' }}>
            {changingItems.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === changingItems.length - 1;

              return (
                <ProxyAccountInfo
                  handleDelete={noop}
                  key={index}
                  proxyItem={item}
                  showCheck={false}
                  style={{
                    ...(
                      changingItems.length > 1
                        ? {
                          border: 'none',
                          borderBottom: !isLast ? '1px solid #1B133C' : 'none',
                          borderRadius: isFirst ? '14px 14px 0 0' : isLast ? ' 0 0 14px 14px' : '0',
                          height: '75px'
                        }
                        : {}
                    ),
                    width: '100%'
                  }}
                />
              );
            })}
          </Grid>
          <FadeOnScroll containerRef={refContainer} height='25px' ratio={0.3} style={{ borderRadius: '0 0 14px 14px' }} />
        </Stack>
        <Stack columnGap='10px' sx={{ bgcolor: '#05091C', borderRadius: '14px', marginTop: '15px', padding: '10px 15px' }}>
          <DisplayValue
            balance={depositToPay}
            decimal={decimal}
            genesisHash={genesisHash}
            label={t('Deposit')}
            token={token}
          />
          <Box sx={{ background: ' linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', m: '10px 0 5px', width: '100%' }} />
          <DisplayValue
            balance={fee}
            canPayFee={feeAndDeposit}
            decimal={decimal}
            genesisHash={genesisHash}
            label={t('Fee')}
            token={token}
          />
        </Stack>
      </Grid>
      {
        call &&
        <SignArea3
          address={address}
          genesisHash={genesisHash}
          ledgerStyle={{ width: '92%' }}
          onClose={onClose}
          proxyTypeFilter={PROXY_TYPE.GENERAL}
          selectedProxy={selectedProxy}
          setFlowStep={setStep as React.Dispatch<React.SetStateAction<TransactionFlowStep>>}
          setSelectedProxy={setSelectedProxy}
          setShowProxySelection={setShowProxySelection}
          setTxInfo={setTxInfo}
          showProxySelection={showProxySelection}
          transaction={call}
          withCancel
        />}
    </Grid>

  );
}

export default React.memo(Review);
