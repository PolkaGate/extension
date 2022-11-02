// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useEffect } from 'react';

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

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const _goBack = useCallback(
    () =>
      setShow(false)
    , [setShow]);

  const handleNext = useCallback(() => {
    _goBack();
  }, [_goBack]);

  const onSelect = useCallback((selected: Proxy) => {
    setSelectedProxy(selected);
  }, [setSelectedProxy]);

  return (
    <Popup show={show}>
      <HeaderBrand
        onBackClick={_goBack}
        showBackArrow
        text={t<string>('Select Proxy')}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='18px auto 0'
        width='90%'
      >
        {t('Select an appropriate proxy of the account to do transaction on behalf.')}
      </Typography>
      <ProxyTable
        chain={chain}
        label={t<string>('Proxies')}
        maxHeight='50%'
        mode='Select'
        onSelect={onSelect}
        proxies={proxies}
        proxyTypeFilter={proxyTypeFilter}
        style={{
          m: '20px auto',
          width: '92%'
        }}
      />
      <PButton
        _onClick={handleNext}
        disabled={!selectedProxy}
        text={t('Next')}
      />
    </Popup>
  );
}
