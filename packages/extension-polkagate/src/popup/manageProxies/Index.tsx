// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { ActionContext, ProxyTable, ShowBalance } from '../../components';
import { useAccount, useApi, useEndpoint, useMetadata, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { Proxy, ProxyItem } from '../../util/types';

interface Props {
  className?: string;
}

export default function ManageProxies({ className }: Props): React.ReactElement {
  const [proxiesItems, setProxyItems] = useState<ProxyItem[] | undefined>();
  const [proxies, setProxies] = useState<Proxy[] | undefined>();
  const [formatted, setFormatted] = useState<string | undefined>();
  const [depositValue, setDepositValue] = useState<BN | undefined>();

  const onAction = useContext(ActionContext);
  const { t } = useTranslation();
  const { address } = useParams<{ address: string; }>();
  const account = useAccount(address);
  const chain = useMetadata(account?.genesisHash, true);
  const endpoint = useEndpoint(account?.address, chain);
  const api = useApi(endpoint);

  const proxyDepositBase = api ? api.consts.proxy.proxyDepositBase : BN_ZERO;
  const proxyDepositFactor = api ? api.consts.proxy.proxyDepositFactor : BN_ZERO;
  const available = proxies?.filter((item) => item.status !== 'remove')?.length ?? 0;

  useEffect(() => {
    const publicKey = decodeAddress(address);

    chain && setFormatted(encodeAddress(publicKey, chain?.ss58Format));
    !available ? setDepositValue(BN_ZERO) : setDepositValue(proxyDepositBase.add(proxyDepositFactor.muln(available))) as unknown as BN;
  }, [address, api, available, chain, formatted, proxyDepositBase, proxyDepositFactor]);

  const _onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  useEffect(() => {
    formatted && api && api.query.proxy?.proxies(formatted).then((proxies) => {
      const proxiyItems = (JSON.parse(JSON.stringify(proxies[0])))?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

      setProxies(JSON.parse(JSON.stringify(proxies[0])));
      setProxyItems(proxiyItems);
    });
  }, [api, chain, formatted]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Manage Proxies')}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='25px auto'
        textAlign='left'
        width='90%'
      >
        {t<string>('Add new or select to remove proxies for this account, consider the deposit that will be reserved.')}
      </Typography>
      <Grid
        container
        m='auto'
        width='92%'
      >
        <Grid
          display='inline-flex'
          item
          sx={{
            cursor: 'pointer'
          }}
        // onClick={ }
        >
          <AddRoundedIcon
            sx={{
              bgcolor: 'primary.main',
              borderRadius: '50px',
              fontSize: '36px'
            }}
          />
          <Typography
            fontSize='16px'
            fontWeight={400}
            lineHeight='36px'
            pl='10px'
            sx={{
              textDecoration: 'underline'
            }}
          >
            {t<string>('Add proxy')}
          </Typography>
        </Grid>
      </Grid>
      <ProxyTable
        chain={chain}
        label={t<string>('Proxies')}
        proxies={proxies}
        style={{
          m: '20px auto 10px',
          width: '92%'
        }}
        maxHeight='40%'
      />
      <Grid
        alignItems='end'
        container
        sx={{
          m: 'auto',
          width: '92%'
        }}
      >
        <Typography
          fontSize='14px'
          fontWeight={300}
        >
          {t<string>('Deposit:')}
        </Typography>
        <Grid
          item
          lineHeight='22px'
          pl='5px'
        >
          <ShowBalance
            api={api}
            balance={depositValue}
            decimalPoint={4}
            height={22}
          />
        </Grid>
      </Grid>
    </>
  );
}
