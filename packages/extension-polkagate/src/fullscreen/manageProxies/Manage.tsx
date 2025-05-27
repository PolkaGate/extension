// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { ProxyItem } from '../../util/types';

import { Stack, Typography } from '@mui/material';
import { AddCircle, Firstline } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import { FLOATING_POINT_DIGIT } from '@polkadot/extension-polkagate/src/util/constants';
import { BN_ZERO } from '@polkadot/util';

import { ChainLogo, FormatBalance2, GradientButton, ShowBalance } from '../../components';
import { useTranslation } from '../../hooks';
import ProxyTableFL from './components/ProxyTableFL';
import { STEPS } from './types';

interface Props {
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<string>>;
  isDisabledAddProxyButton: boolean;
  proxyItems: ProxyItem[] | null | undefined;
  chain: Chain | null | undefined;
  setProxyItems: React.Dispatch<React.SetStateAction<ProxyItem[] | null | undefined>>;
  depositedValue: BN | null | undefined;
  setNewDepositedValue: React.Dispatch<React.SetStateAction<BN | undefined>>;
  newDepositValue: BN | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

export default function Manage ({ api, chain, decimal, depositedValue, isDisabledAddProxyButton, newDepositValue, proxyItems, setNewDepositedValue, setProxyItems, setStep, token }: Props): React.ReactElement {
  const { t } = useTranslation();

  const proxyDepositBase = api ? api.consts['proxy']['proxyDepositBase'] as unknown as BN : BN_ZERO;
  const proxyDepositFactor = api ? api.consts['proxy']['proxyDepositFactor'] as unknown as BN : BN_ZERO;
  const confirmDisabled = useMemo(() => !proxyItems || proxyItems.length === 0 || proxyItems.every(({ status }) => status === 'current'), [proxyItems]);

  useEffect(() => {
    if (!proxyItems || proxyItems.length === 0 || confirmDisabled) {
      setNewDepositedValue(undefined);

      return;
    }

    const toAdds = proxyItems.filter(({ status }) => status === 'new').length;
    const olds = proxyItems.filter(({ status }) => status === 'current').length;

    if (olds > 0) {
      return setNewDepositedValue(proxyDepositFactor.muln(olds + toAdds).add(proxyDepositBase));
    }

    if (toAdds > 0) {
      return setNewDepositedValue(proxyDepositFactor.muln(toAdds).add(proxyDepositBase));
    }

    return setNewDepositedValue(BN_ZERO);
  }, [confirmDisabled, proxyDepositBase, proxyDepositFactor, proxyItems, setNewDepositedValue]);

  const toAddProxy = useCallback(() => {
    isDisabledAddProxyButton === false && setStep(STEPS.ADD_PROXY);
  }, [isDisabledAddProxyButton, setStep]);

  const onDeleteProxy = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const handleDelete = useCallback((proxyItem: ProxyItem) => {
    const updatedProxyItems = proxyItems?.map((_proxyItem) => {
      if (proxyItem.proxy.delegate === _proxyItem.proxy.delegate && proxyItem.proxy.proxyType === _proxyItem.proxy.proxyType) {
        if (_proxyItem.status === 'new') {
          return undefined;
        } else if (_proxyItem.status === 'current') {
          _proxyItem.status = 'remove';

          return _proxyItem;
        } else {
          _proxyItem.status = 'current';

          return _proxyItem;
        }
      }

      return _proxyItem;
    }).filter((item) => !!item);

    setProxyItems(updatedProxyItems);
  }, [proxyItems, setProxyItems]);

  const toBeDeletedProxies = useMemo(() => proxyItems?.filter(({ status }) => status === 'remove'), [proxyItems]);

  return (
    <Stack direction='column' sx={{ height: '584px', position: 'relative', width: '800px', zIndex: 1 }}>
      <Stack alignItems='center' columnGap={3} direction='row' sx={{ justifyContent: 'start', mb: '20px', width: '100%' }}>
        <GradientButton
          StartIcon={AddCircle}
          contentPlacement='center'
          disabled={isDisabledAddProxyButton}
          onClick={toAddProxy}
          style={{
            borderRadius: '18px',
            height: '40px',
            minWidth: '20%',
            width: 'fit-content'
          }}
          text={t('Add proxy')}
        />
        <Stack columnGap={1} direction='row'>
          <Typography color='#AA83DC' variant='B-1'>
            {t('Deposit')}
          </Typography>
          <ChainLogo genesisHash={chain?.genesisHash} size={18} />
          <Typography color='#EAEBF1' variant='B-1'>
            {decimal && token &&
              <FormatBalance2
                decimalPoint={FLOATING_POINT_DIGIT}
                decimals={[decimal]}
                tokens={[token]}
                value={depositedValue ?? newDepositValue ?? BN_ZERO}
              />}
          </Typography>
          {newDepositValue && depositedValue &&
            <>
              <Typography color='#AA83DC' px='8px' variant='B-1'>
                {'-->'}
              </Typography>
              <Typography color='#EAEBF1' variant='B-1'>
                <ShowBalance
                  balance={newDepositValue}
                  decimal={decimal}
                  decimalPoint={4}
                  height={22}
                  token={token}
                />
              </Typography>
            </>
          }
        </Stack>
      </Stack>
      <ProxyTableFL
        api={api}
        chain={chain}
        handleDelete={handleDelete}
        proxyItems={proxyItems}
      />
      {
        !!toBeDeletedProxies?.length &&
        <Stack alignItems='end' direction='row' justifyContent='space-between' sx={{ bottom: '0', position: 'absolute', width: '100%' }}>
          <Stack alignItems='center' columnGap='10px' direction='row'>
            <Firstline color='#674394' size='18px' variant='Bold' />
            <Typography color='#EAEBF1' variant='B-2'>
              {toBeDeletedProxies?.length}
            </Typography>
            <Typography color='#AA83DC' variant='B-4'>
              {`/ ${proxyItems?.length} selected`}
            </Typography>
            <Typography color='#AA83DC' variant='H-4'>
              X
            </Typography>
          </Stack>
          <GradientButton
            contentPlacement='center'
            disabled={isDisabledAddProxyButton}
            onClick={onDeleteProxy}
            style={{
              borderRadius: '18px',
              height: '40px',
              width: '377px'
            }}
            text={t('Delete {{count}} prox{{ending}}', { replace: { count: toBeDeletedProxies?.length, ending: toBeDeletedProxies?.length && toBeDeletedProxies.length > 1 ? 'ies' : 'y' } })}
          />
        </Stack>
      }
    </Stack>
  );
}
