// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState, useMemo } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { PButton, ProxyTable } from '../../../components';
import { useChain, useTranslation } from '../../../hooks';
import { Proxy, ProxyItem } from '../../../util/types';

interface Props {
  address: string | undefined;
  selectedProxy: Proxy | undefined
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>
  proxyTypeFilter: string[]
  proxies: ProxyItem[] | undefined;
  height: number | undefined;
  closeSelectProxy: () => void
}

export default function SelectProxyModal({ address, closeSelectProxy, height, proxies, proxyTypeFilter, selectedProxy, setSelectedProxy }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chain = useChain(address);
  const [change, setChange] = useState<boolean>(true);

  const proxiesToSelect = useMemo(() => proxies?.filter((item) => item.status !== 'new'), [proxies]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const handleNext = useCallback(() => {
    setChange(true);
    closeSelectProxy();
  }, [closeSelectProxy]);

  const onSelect = useCallback((selected: Proxy) => {
    setChange(!change);
    setSelectedProxy(selected);
  }, [change, setSelectedProxy]);

  const onDeselect = useCallback(() => {
    selectedProxy && setChange(!change);
    selectedProxy && setSelectedProxy(undefined);
  }, [change, selectedProxy, setSelectedProxy]);

  return (
    <Grid container direction='column' height={`${height ?? 300}px`}>
      <Typography fontSize='14px' fontWeight={300} m='18px auto 0' pt='25px' textAlign='left'>
        {t('Choose a suitable proxy for the account to conduct the transaction on its behalf.')}
      </Typography>
      <ProxyTable
        chain={chain}
        label={t<string>('Proxies')}
        maxHeight='300px'
        mode='Select'
        onSelect={onSelect}
        proxies={proxiesToSelect}
        proxyTypeFilter={proxyTypeFilter}
        selected={selectedProxy}
        style={{
          m: '20px auto 0',
          width: '100%'
        }}
      />
      <Grid container item justifyContent='flex-end' onClick={onDeselect}>
        <Typography fontSize='14px' fontWeight={400} lineHeight='36px' sx={{ cursor: selectedProxy ? 'pointer' : 'default', textAlign: 'right', textDecoration: 'underline' }}>
          {t<string>('Clear selection and use the proxied')}
        </Typography>
      </Grid>
      <PButton
        _ml={0}
        _onClick={handleNext}
        disabled={change}
        text={t('Apply')}
      />
    </Grid>
  );
}
