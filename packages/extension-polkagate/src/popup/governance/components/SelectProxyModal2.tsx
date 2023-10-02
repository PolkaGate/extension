// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

export default function SelectProxyModal2({ address, closeSelectProxy, height, proxies, proxyTypeFilter, selectedProxy, setSelectedProxy }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chain = useChain(address);
  const ref = useRef(selectedProxy);

  const [_selectedProxy, _setSelectedProxy] = useState<Proxy | undefined>(selectedProxy);
  const hasChanged = useMemo(() => ref.current !== _selectedProxy, [_selectedProxy]);

  const proxiesToSelect = useMemo(() => proxies?.filter((item) => item.status !== 'new'), [proxies]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const onApply = useCallback(() => {
    setSelectedProxy(_selectedProxy);
    closeSelectProxy();
  }, [_selectedProxy, closeSelectProxy, setSelectedProxy]);

  const onDeselect = useCallback(() => {
    _setSelectedProxy(undefined);
  }, []);

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
        onSelect={_setSelectedProxy}
        proxies={proxiesToSelect}
        proxyTypeFilter={proxyTypeFilter}
        selected={_selectedProxy}
        style={{
          m: '20px auto 0',
          width: '100%'
        }}
      />
      <Grid container item justifyContent='flex-end' onClick={onDeselect}>
        <Typography fontSize='14px' fontWeight={400} lineHeight='36px' sx={{ cursor: _selectedProxy ? 'pointer' : 'default', textAlign: 'right', textDecoration: 'underline', userSelect: 'none' }}>
          {t<string>('Clear selection and use the proxied')}
        </Typography>
      </Grid>
      <PButton
        _ml={0}
        _onClick={onApply}
        disabled={!hasChanged}
        text={t('Apply')}
      />
    </Grid>
  );
}
