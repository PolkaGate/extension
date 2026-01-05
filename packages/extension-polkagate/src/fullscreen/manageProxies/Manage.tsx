// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { ProxyItem } from '../../util/types';

import { Stack, Typography } from '@mui/material';
import { AddCircle, Firstline } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { ChainLogo, DisplayBalance, GradientButton } from '../../components';
import { useTranslation } from '../../hooks';
import { SelectionStatus } from '../stake/partials/FooterControls';
import ProxyList from './components/ProxyList';
import { STEPS } from './consts';
import { type ProxyFlowStep } from './types';

interface Props {
  api: ApiPromise | undefined | null;
  setStep: React.Dispatch<React.SetStateAction<ProxyFlowStep>>;
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
    if (!proxyItems) {
      return;
    }

    const updatedProxyItems = proxyItems
      .map((_proxyItem) => {
        const isTarget =
          proxyItem.proxy.delegate === _proxyItem.proxy.delegate &&
          proxyItem.proxy.proxyType === _proxyItem.proxy.proxyType;

        if (!isTarget) {
          return _proxyItem;
        }

        switch (_proxyItem.status) {
          case 'new':
            return null; // Remove newly added proxy
          case 'current':
            return { ..._proxyItem, status: 'remove' };// Mark current proxy for removal
          case 'remove':
            return { ..._proxyItem, status: 'current' };// Undo removal
          default:
            return _proxyItem;
        }
      })
      .filter(Boolean) as ProxyItem[]; // remove nulls

    setProxyItems(updatedProxyItems);
  }, [proxyItems, setProxyItems]);

  const clearRemoveChecks = useCallback(() => {
    setProxyItems((prev) =>
      prev?.map((item) =>
        item.status === 'remove'
          ? { ...item, status: 'current' }
          : item
      )
    );
  }, [setProxyItems]);

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
        <Stack alignItems='center' columnGap={1} direction='row'>
          <Typography color='#AA83DC' variant='B-1'>
            {t('Deposit')}
          </Typography>
          <ChainLogo genesisHash={chain?.genesisHash} size={18} />
          <DisplayBalance
            balance={proxyItems === undefined ? undefined : depositedValue ?? newDepositValue ?? BN_ZERO}
            decimal={decimal}
            skeletonStyle={{ backgroundColor: '#946CC840' }}
            style={{ color: '#EAEBF1' }}
            token={token}
          />
          {newDepositValue && depositedValue &&
            <Stack columnGap='3px' direction='row' sx={{ bgcolor: '#C6AECC26', borderRadius: '10px', px: '5px' }}>
              <Typography color='primary.main' variant='B-1'>
                {newDepositValue && !newDepositValue.isZero() && (newDepositValue.gt(depositedValue) ? '+' : '-')}
              </Typography>
              <DisplayBalance
                balance={newDepositValue && newDepositValue.isZero() ? BN_ZERO : newDepositValue.sub(depositedValue).abs()}
                decimal={decimal}
                style={{ color: 'primary.main' }}
                token={token}
              />
            </Stack>
          }
        </Stack>
      </Stack>
      <ProxyList
        handleDelete={handleDelete}
        proxyItems={proxyItems}
      />
      {
        !!toBeDeletedProxies?.length &&
        <Stack alignItems='end' direction='row' justifyContent='space-between' sx={{ bottom: '0', position: 'absolute', width: '100%' }}>
          <SelectionStatus
            Icon={Firstline}
            maxSelectable={proxyItems?.length}
            onReset={clearRemoveChecks}
            selectedCount={toBeDeletedProxies?.length}
          />
          <GradientButton
            contentPlacement='center'
            disabled={isDisabledAddProxyButton}
            onClick={onDeleteProxy}
            style={{
              borderRadius: '18px',
              height: '40px',
              width: '377px'
            }}
            text={t('Remove {{count}} prox{{ending}}', { replace: { count: toBeDeletedProxies?.length, ending: toBeDeletedProxies?.length && toBeDeletedProxies.length > 1 ? 'ies' : 'y' } })}
          />
        </Stack>
      }
    </Stack>
  );
}
