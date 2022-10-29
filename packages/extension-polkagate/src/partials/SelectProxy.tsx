// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { PButton, ProxyTable } from '../components'
import { useMetadata, useTranslation } from '../hooks';
import useRedirectOnRefresh from '../hooks/useRedirectOnRefresh';
import { HeaderBrand } from '../partials';
import { Proxy } from '../util/types';

interface Props {
  className?: string;
}

export default function SelectProxy({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const history = useHistory();
  const { state } = useLocation();

  useRedirectOnRefresh('/');
  const { genesisHash, proxiedAddress } = useParams<{ proxiedAddress: string, genesisHash: string }>();
  const chain = useMetadata(genesisHash, true);

  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const backPath = (state?.pathname ?? '/') as unknown as string;

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const _goBack = useCallback(
    () => {
      history.push({ pathname: backPath });
    }
    , [backPath, history]);

  const handleNext = useCallback(() => {
    proxiedAddress && history.push({
      pathname: backPath,
      state: { selectedProxy }
    });
  }, [backPath, history, proxiedAddress, selectedProxy]);

  const onSelect = useCallback((selected: Proxy) => {
    setSelectedProxy(selected);
  }, []);

  return (
    <>
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
        maxHeight={window.innerHeight / 2}
        onSelect={onSelect}
        proxies={state?.proxies}
        style={{
          m: '20px auto',
          width: '92%',

        }}
      />
      <PButton
        _onClick={handleNext}
        disabled={!selectedProxy}
        text={t('Next')}
      />
    </>
  );
}
