// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, PButton, ProxyTable, ShowBalance } from '../../components';
import { useAccount, useApi, useMetadata, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { Proxy, ProxyItem } from '../../util/types';
import { getFormattedAddress } from '../../util/utils';
import AddProxy from './AddProxy';
import Review from './Review';

export default function ManageProxies(): React.ReactElement {
  const [proxyItems, setProxyItems] = useState<ProxyItem[] | undefined>();
  const [showAddProxy, setShowAddProxy] = useState<boolean>(false);
  const [showReviewProxy, setShowReviewProxy] = useState<boolean>(false);
  const [formatted, setFormatted] = useState<string | undefined>();
  const [helperText, setHelperText] = useState<string>();
  const [depositValue, setDepositValue] = useState<BN | undefined>();
  const [disableAddProxyButton, setEnableAddProxyButton] = useState<boolean>(true);
  const [disableToConfirmButton, setEnableToConfirmButton] = useState<boolean>(true);
  const [available, setAvailable] = useState<number>(0);

  const onAction = useContext(ActionContext);
  const { t } = useTranslation();
  const { address } = useParams<{ address: string; }>();
  const account = useAccount(address);
  const chain = useMetadata(account?.genesisHash, true);
  const api = useApi(account?.address);

  const proxyDepositBase = api?.consts?.proxy?.proxyDepositBase || BN_ZERO;
  const proxyDepositFactor = api?.consts.proxy?.proxyDepositFactor || BN_ZERO;

  const _onBackClick = useCallback(() => {
    showReviewProxy ? setShowReviewProxy(!showReviewProxy) : onAction('/');
  }, [onAction, showReviewProxy]);

  const _openAddProxy = useCallback(() => {
    !disableAddProxyButton && setShowAddProxy(!showAddProxy);
  }, [disableAddProxyButton, showAddProxy]);

  const _toConfirm = useCallback(() => {
    setShowReviewProxy(!showReviewProxy);
  }, [showReviewProxy]);

  const checkForChanges = useCallback(() => {
    if (!disableAddProxyButton) {
      const anyChanges = proxyItems?.length === proxyItems?.filter((item) => item.status === 'current')?.length;

      !anyChanges && setEnableToConfirmButton(false);
      anyChanges && setEnableToConfirmButton(true);
    }

    setAvailable(proxyItems?.filter((item) => item.status !== 'remove')?.length);
  }, [disableAddProxyButton, proxyItems]);

  const onSelect = useCallback((selected: Proxy) => {
    const toDeleteIndex = proxyItems?.indexOf(proxyItems?.find((item) => item.proxy.delegate === selected.delegate && item.proxy.proxyType === selected.proxyType));

    if (toDeleteIndex !== undefined || toDeleteIndex !== -1) {
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
    }
  }, [checkForChanges, proxyItems]);

  useEffect(() => {
    chain && setFormatted(getFormattedAddress(address, undefined, chain.ss58Format));
    !available ? setDepositValue(BN_ZERO) : setDepositValue(proxyDepositBase.add(proxyDepositFactor.muln(available))) as unknown as BN;
    checkForChanges();
  }, [address, api, available, chain, checkForChanges, formatted, proxyDepositBase, proxyDepositFactor, proxyItems]);

  useEffect(() => {
    proxyItems !== undefined && !(account?.isExternal && proxyItems.length === 0) && setEnableAddProxyButton(false);
    checkForChanges();
  }, [account?.isExternal, checkForChanges, proxyItems]);

  useEffect(() => {
    setHelperText(t<string>('Add new or select to remove proxies for this account, consider the deposit that will be reserved.'));
    proxyItems !== undefined && disableAddProxyButton && setHelperText(t<string>('This is Address Only and cannot sign transaction and there is no proxy for this account.'));
    !disableToConfirmButton && setHelperText(t<string>('You still can modify proxies you’re adding, add new proxies, or select existing proxies to remove them, and click on Next to confirm all transactions.'));
  }, [disableAddProxyButton, disableToConfirmButton, proxyItems, t]);

  useEffect(() => {
    formatted && api && api.query.proxy?.proxies(formatted).then((proxies) => {
      const fetchedProxyItems = (JSON.parse(JSON.stringify(proxies[0])))?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

      setProxyItems(fetchedProxyItems);
    });
  }, [api, chain, formatted]);

  return (
    <>
      <HeaderBrand
        onBackClick={showAddProxy ? _openAddProxy : _onBackClick}
        showBackArrow
        showClose
        text={showAddProxy ? t<string>('Add Proxy') : t<string>('Manage Proxies')}
      />
      {!showAddProxy && !showReviewProxy &&
        <>
          <Typography fontSize='14px' fontWeight={300} m='25px auto' textAlign='left' width='90%'>
            {helperText}
          </Typography>
          <Grid container m='auto' sx={{ opacity: disableAddProxyButton ? 0.5 : 1 }} width='92%'>
            <Grid display='inline-flex' item onClick={_openAddProxy} sx={{ cursor: disableAddProxyButton ? 'context-menu' : 'pointer' }}>
              <AddRoundedIcon
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: '50px',
                  color: '#fff',
                  fontSize: '36px'
                }}
              />
              <Typography fontSize='16px' fontWeight={400} lineHeight='36px' pl='10px' sx={{ textDecoration: 'underline' }}>
                {t<string>('Add proxy')}
              </Typography>
            </Grid>
          </Grid>
          <ProxyTable
            chain={chain}
            label={t<string>('Proxies')}
            maxHeight={window.innerHeight / 2.5}
            mode='Delete'
            notFoundText={t<string>('No proxies found.')}
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
              {t<string>('Deposit:')}
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
            _onClick={_toConfirm}
            disabled={disableToConfirmButton}
            text={t<string>('Next')}
          />
        </>
      }
      {showAddProxy && !showReviewProxy &&
        <AddProxy
          address={address}
          api={api}
          chain={chain}
          onChange={checkForChanges}
          proxyItems={proxyItems}
          setProxyItems={setProxyItems}
          setShowAddProxy={setShowAddProxy}
          showAddProxy={showAddProxy}
        />
      }
      {showReviewProxy &&
        <Review
          address={formatted}
          api={api}
          chain={chain}
          depositValue={depositValue}
          proxies={proxyItems}
        />
      }
    </>
  );
}
