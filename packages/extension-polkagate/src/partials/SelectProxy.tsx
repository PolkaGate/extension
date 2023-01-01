// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { PButton, ProxyTable } from '../components';
import Popup from '../components/Popup';
import { useMetadata, useTranslation } from '../hooks';
import { HeaderBrand } from '../partials';
import { Proxy, ProxyItem } from '../util/types';

interface Props {
  show: boolean;
  proxiedAddress: string;
  genesisHash: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProxy: Proxy | undefined
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>
  proxyTypeFilter: string[]
  proxies: ProxyItem[] | undefined;
}

export default function SelectProxy({ genesisHash, proxies, proxyTypeFilter, selectedProxy, setSelectedProxy, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chain = useMetadata(genesisHash, true);
  const [proxiesToSelect, setProxiesToSelect] = useState<ProxyItem[] | undefined>();
  const [change, setChange] = useState<boolean>(true);

  useEffect(() => {
    const toSelect = proxies?.filter((item) => item.status !== 'new');

    setProxiesToSelect(toSelect);
  }, [proxies]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const _goBack = useCallback(
    () =>
      setShow(false)
    , [setShow]);

  const handleNext = useCallback(() => {
    setChange(true);
    _goBack();
  }, [_goBack]);

  const onSelect = useCallback((selected: Proxy) => {
    setChange(!change);
    setSelectedProxy(selected);
  }, [change, setSelectedProxy]);

  const onDeselect = useCallback(() => {
    selectedProxy && setChange(!change);
    selectedProxy && setSelectedProxy(undefined);
  }, [change, selectedProxy, setSelectedProxy]);

  return (
    <Popup show={show}>
      <HeaderBrand
        onBackClick={_goBack}
        showBackArrow
        text={t<string>('Select Proxy')}
      />
      <Typography fontSize='14px' fontWeight={300} m='18px auto 0' width='90%'>
        {t('Select an appropriate proxy of the account to do transaction on behalf.')}
      </Typography>
      <ProxyTable
        chain={chain}
        label={t<string>('Proxies')}
        maxHeight='50%'
        mode='Select'
        onSelect={onSelect}
        proxies={proxiesToSelect}
        proxyTypeFilter={proxyTypeFilter}
        selected={selectedProxy}
        style={{
          m: '20px auto 0',
          width: '92%'
        }}
      />
      <Grid m='auto' onClick={onDeselect} width='92%'>
        <Typography fontSize='14px' fontWeight={400} lineHeight='36px' sx={{ cursor: selectedProxy ? 'pointer' : 'default', textAlign: 'right', textDecoration: 'underline' }}>
          {t<string>('Clear selection and use the proxied')}
        </Typography>
      </Grid>
      <PButton
        _onClick={handleNext}
        disabled={change}
        text={t('Done')}
      />
    </Popup>
  );
}
