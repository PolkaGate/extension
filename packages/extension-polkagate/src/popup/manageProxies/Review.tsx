// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { PasswordWithUseProxy, PButton, ProxyTable, ShowBalance } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { ProxyItem } from '../../util/types';
import { ApiPromise } from '@polkadot/api';
import { useAccount } from '../../hooks';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  depositValue: BN;
  proxies: ProxyItem[];
}

export default function Review({ address, api, chain, depositValue, proxies }: Props): React.ReactElement {
  const [helperText, setHelperText] = useState<string | undefined>();
  const [proxiesToChange, setProxiesToChange] = useState<ProxyItem[] | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [password, setPassword] = useState<string>('');
  const [nextButtonDisabe, setNextButtonDisabe] = useState<boolean>(true);

  const { t } = useTranslation();
  const account = useAccount(address);

  const onNext = useCallback(() => {
    console.log('helllo');
  }, []);

  useEffect(() => {
    const addingLength = proxies.filter((item) => item.status === 'new').length;
    const removingLength = proxies.filter((item) => item.status === 'remove').length;

    addingLength && setHelperText(t<string>(`You are adding ${addingLength} Proxy(ies)`));
    removingLength && setHelperText(t<string>(`You are removing ${removingLength} Proxy(ies)`));
    addingLength && removingLength && setHelperText(t<string>(`Adding ${addingLength} and removing ${removingLength} Proxy(ies)`));
  }, [proxies, t]);

  useEffect(() => {
    const toChange = proxies.filter((item) => item.status === 'remove' || item.status === 'new');

    setProxiesToChange(toChange);
  }, [proxies]);

  return (
    <>
      <Typography
        m='20px auto'
        sx={{
          borderBottom: '1px solid',
          borderBottomColor: 'secondary.main'
        }}
        textAlign='center'
        width='30%'
      >
        {t<string>('Review')}
      </Typography>
      <Typography
        textAlign='center'
      >
        {helperText}
      </Typography>
      <ProxyTable
        chain={chain}
        label={t<string>('Proxies')}
        maxHeight={window.innerHeight / 2.3}
        mode='Status'
        proxies={proxiesToChange}
        style={{
          m: '20px auto 10px',
          width: '92%'
        }}
      />
      <Grid
        alignItems='center'
        container
        justifyContent='center'
        m='20px auto 5px'
        width='92%'
      >
        <Grid
          display='inline-flex'
          item
        >
          <Typography
            fontSize='14px'
            fontWeight={300}
            lineHeight='23px'
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
        <Divider
          orientation='vertical'
          sx={{
            backgroundColor: 'text.primary',
            height: '30px',
            mx: '5px',
            my: 'auto'
          }}
        />
        <Grid
          display='inline-flex'
          item
        >
          <Typography
            fontSize='14px'
            fontWeight={300}
            lineHeight='23px'
          >
            {t<string>('Fee:')}
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
      </Grid>
      <PasswordWithUseProxy
        api={api}
        label={`${t<string>('Password')} for ${account?.name}`}
        proxiedAddress={address}
        proxies={proxies}
        onChange={setPassword}
        genesisHash={account?.genesisHash}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '4%',
          width: '92%'
        }}
      />
      <PButton
        text={t<string>('Next')}
        disabled={nextButtonDisabe}
        _onClick={onNext}
      />
    </>
  );
}
