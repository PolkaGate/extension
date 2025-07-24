// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Proxy, ProxyItem } from '../../util/types';

import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, PButton, ProxyTable, ShowBalance } from '../../components';
import { useInfo, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { getFormattedAddress } from '../../util/utils';
import AddProxy from './AddProxy';
import Review from './Review';

export default function ManageProxies(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { address } = useParams<{ address: string }>();
  const { account, api, chain } = useInfo(address);

  const [proxyItems, setProxyItems] = useState<ProxyItem[] | undefined>();
  const [showAddProxy, setShowAddProxy] = useState<boolean>(false);
  const [showReviewProxy, setShowReviewProxy] = useState<boolean>(false);
  const [formatted, setFormatted] = useState<string | undefined>();
  const [helperText, setHelperText] = useState<string>();
  const [depositValue, setDepositValue] = useState<BN | undefined>();
  const [disableAddProxyButton, setEnableAddProxyButton] = useState<boolean>(true);
  const [disableToConfirmButton, setEnableToConfirmButton] = useState<boolean>(true);
  const [available, setAvailable] = useState<number>(0);

  const proxyDepositBase = api ? api.consts['proxy']['proxyDepositBase'] as unknown as BN : BN_ZERO;
  const proxyDepositFactor = api ? api.consts['proxy']['proxyDepositFactor'] as unknown as BN : BN_ZERO;

  const depositToPay = useMemo(() => {
    if (!proxyItems || proxyItems.length === 0) {
      return BN_ZERO;
    }

    const alreadyHasProxy = proxyItems.filter((proxyItem) => proxyItem.status === 'current');
    const newProxiesLength = proxyItems.filter((proxyItem) => proxyItem.status === 'new').length;
    const removeProxiesLength = proxyItems.filter((proxyItem) => proxyItem.status === 'remove').length;

    if (alreadyHasProxy.length === 0 && removeProxiesLength === 0) {
      return depositValue;
    }

    const alreadyHasProxyDeposit = (proxyDepositFactor.muln((alreadyHasProxy.length + removeProxiesLength))).add(proxyDepositBase);

    if (newProxiesLength > removeProxiesLength) {
      return alreadyHasProxyDeposit.add(proxyDepositFactor.muln(newProxiesLength - removeProxiesLength));
    } else {
      return BN_ZERO;
    }
  }, [depositValue, proxyDepositBase, proxyDepositFactor, proxyItems]);

  const onBackClick = useCallback(() => {
    showReviewProxy ? setShowReviewProxy(!showReviewProxy) : onAction('/');
  }, [onAction, showReviewProxy]);

  const openAddProxy = useCallback(() => {
    !disableAddProxyButton && setShowAddProxy(!showAddProxy);
  }, [disableAddProxyButton, showAddProxy]);

  const toConfirm = useCallback(() => {
    setShowReviewProxy(!showReviewProxy);
  }, [showReviewProxy]);

  const checkForChanges = useCallback(() => {
    if (!disableAddProxyButton) {
      const anyChanges = proxyItems?.length === proxyItems?.filter((item) => item.status === 'current')?.length;

      !anyChanges && setEnableToConfirmButton(false);
      anyChanges && setEnableToConfirmButton(true);
    }

    setAvailable(proxyItems?.filter((item) => item.status !== 'remove')?.length || 0);
  }, [disableAddProxyButton, proxyItems]);

  const onSelect = useCallback((selected: Proxy) => {
    if (!proxyItems) {
      return;
    }

    const found = proxyItems.find(({ proxy }) => proxy.delegate === selected.delegate && proxy.proxyType === selected.proxyType);

    if (!found) {
      return;
    }

    const toDeleteIndex = proxyItems.indexOf(found);

    if (toDeleteIndex === -1) {
      return;
    }

    if (proxyItems[toDeleteIndex].status === 'current') {
      proxyItems[toDeleteIndex].status = 'remove';
      setProxyItems(proxyItems);
      checkForChanges();

      return;
    }

    if (proxyItems[toDeleteIndex].status === 'remove') {
      proxyItems[toDeleteIndex].status = 'current';
      setProxyItems(proxyItems);
      checkForChanges();

      return;
    }

    if (proxyItems[toDeleteIndex].status === 'new') {
      proxyItems.splice(toDeleteIndex, 1);
      setProxyItems(proxyItems);
      checkForChanges();
    }
  }, [checkForChanges, proxyItems]);

  useEffect(() => {
    chain && setFormatted(getFormattedAddress(address, undefined, chain.ss58Format));
    !available ? setDepositValue(BN_ZERO) : setDepositValue(proxyDepositBase.add(proxyDepositFactor.muln(available))) as unknown as BN;
    checkForChanges();
  }, [address, api, available, chain, checkForChanges, formatted, proxyDepositBase, proxyDepositFactor, proxyItems]);

  useEffect(() => {
    proxyItems !== undefined && setEnableAddProxyButton(false);
    checkForChanges();
  }, [account?.isExternal, checkForChanges, proxyItems]);

  useEffect(() => {
    setHelperText(t('Add new proxies or select existing ones to remove for this account, and please consider the deposit that will be reserved.'));
    proxyItems !== undefined && disableAddProxyButton && setHelperText(t('This is a watch-only account and cannot sign transactions, and there is no proxy associated with this account.'));
    !disableToConfirmButton && setHelperText(t("You can still modify the proxies you're adding, add new proxies, or select existing proxies to remove them. Once done, click 'Next' to confirm all transactions."));
  }, [disableAddProxyButton, disableToConfirmButton, proxyItems, t]);

  useEffect(() => {
    formatted && api && api.query['proxy']?.['proxies'](formatted)
      .then((proxies) => {
        const parsed = JSON.parse(JSON.stringify((proxies as unknown as any[])[0]));
        const fetchedProxyItems = (parsed as Proxy[])?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

        setProxyItems(fetchedProxyItems);
      });
  }, [api, chain, formatted]);

  return (
    <>
      <HeaderBrand
        onBackClick={showAddProxy ? openAddProxy : onBackClick}
        showBackArrow
        showClose
        text={showAddProxy ? t('Add Proxy') : t('Manage Proxies')}
      />
      {!showAddProxy && !showReviewProxy &&
        <>
          <Typography fontSize='14px' fontWeight={300} m='25px auto' textAlign='left' width='90%'>
            {helperText}
          </Typography>
          <Grid container m='auto' sx={{ opacity: disableAddProxyButton ? 0.5 : 1 }} width='92%'>
            <Grid display='inline-flex' item onClick={openAddProxy} sx={{ cursor: disableAddProxyButton ? 'context-menu' : 'pointer' }}>
              <AddRoundedIcon
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: '50px',
                  color: '#fff',
                  fontSize: '36px'
                }}
              />
              <Typography fontSize='16px' fontWeight={400} lineHeight='36px' pl='10px' sx={{ textDecoration: 'underline' }}>
                {t('Add proxy')}
              </Typography>
            </Grid>
          </Grid>
          <ProxyTable
            chain={chain as any}
            label={t('Proxies')}
            maxHeight={window.innerHeight / 2.5}
            mode='Delete'
            notFoundText={t('No proxies found.')}
            onSelect={onSelect}
            proxies={proxyItems}
            style={{
              m: '20px auto 10px',
              width: '92%'
            }}
          />
          <Grid alignItems='end' container sx={{ m: 'auto', width: '92%' }}>
            <Typography
              fontSize='14px'
              fontWeight={300}
              lineHeight='23px'
            >
              {t('Deposit:')}
            </Typography>
            <Grid item lineHeight='22px' pl='5px'>
              <ShowBalance
                api={api}
                balance={depositValue}
                decimalPoint={4}
                height={22}
              />
            </Grid>
          </Grid>
          <PButton
            _onClick={toConfirm}
            disabled={disableToConfirmButton}
            text={t('Next')}
          />
        </>
      }
      {showAddProxy && !showReviewProxy && chain && proxyItems !== undefined &&
        <AddProxy
          address={address}
          chain={chain as any}
          onChange={checkForChanges}
          proxyItems={proxyItems}
          setProxyItems={setProxyItems}
          setShowAddProxy={setShowAddProxy}
          showAddProxy={showAddProxy}
        />
      }
      {showReviewProxy && !!proxyItems?.length &&
        <Review
          address={formatted as string}
          api={api as ApiPromise}
          chain={chain as Chain}
          depositToPay={depositToPay}
          depositValue={depositValue as BN}
          proxies={proxyItems}
        />
      }
    </>
  );
}
