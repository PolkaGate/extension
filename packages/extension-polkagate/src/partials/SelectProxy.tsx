// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext, ActionContext, PButton, ProxyTable } from '../components'
import { useMetadata, useTranslation } from '../hooks';
import { createAccountExternal } from '../messaging';
import { HeaderBrand } from '../partials';
import { Proxy } from '../util/types';

interface Props {
  className?: string;
}

export default function SelectProxy({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const history = useHistory();
  const { state } = useLocation();
  const { genesisHash, proxiedAddress } = useParams<{ proxiedAddress: string, genesisHash: string }>();
  const chain = useMetadata(genesisHash, true);

  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxies, setProxies] = useState<Proxy[] | undefined>();

  // const addressesOnThisChain = useMemo((): NameAddress[] | undefined => {
  //   if (chain?.ss58Format === undefined) {
  //     return undefined;
  //   }

  //   return accounts.reduce(function (result: NameAddress[], acc): NameAddress[] {
  //     const publicKey = decodeAddress(acc.address);

  //     result.push({ address: encodeAddress(publicKey, chain.ss58Format), name: acc?.name });

  //     return result;
  //   }, []);
  // }, [accounts, chain?.ss58Format]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  // useEffect(() => {
  //   (!proxiedAddress || !chain) && setProxies(undefined);
  // }, [proxiedAddress, chain]);

  // useEffect(() => {
  //   proxiedAddress && api && api.query.proxy?.proxies(proxiedAddress).then((proxies) => {
  //     setProxies(JSON.parse(JSON.stringify(proxies[0])));
  //   });
  // }, [api, chain, proxiedAddress]);

  const _goBack = useCallback(
    () => {
      const backPath: string = state?.pathname ?? '/';

      history.push({ pathname: backPath });
    }
    , [history, state?.pathname]);

  const handleNext = useCallback(() => {
    const backPath: string = state?.pathname ?? '/';

    proxiedAddress && history.push({
      pathname: backPath,
      state: { selectedProxy }
    });
  }, [history, proxiedAddress, selectedProxy, state?.pathname]);

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
        proxies={state?.proxies || proxies}
        style={{
          m: '20px auto',
          width: '92%'
        }}
        onSelect={onSelect}
      />
      <PButton
        _onClick={handleNext}
        disabled={!selectedProxy}
        text={t('Next')}
      />
    </>
  );
}
