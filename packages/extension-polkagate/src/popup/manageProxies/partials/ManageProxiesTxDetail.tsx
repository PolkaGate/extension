// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { Chain } from '../../../../../extension-chains/src/types';
import { AccountContext, ShortAddress, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import ThroughProxy from '../../../partials/ThroughProxy';
import { NameAddress, Proxy, ProxyItem } from '../../../util/types';
import { getSubstrateAddress } from '../../../util/utils';

interface Props {
  proxies: ProxyItem[];
  api: ApiPromise;
  deposit?: BN;
  address?: string;
  name?: string;
  chain?: Chain;
}

export default function ManageProxiesTxDetail({ address, api, chain, deposit, name, proxies }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const isAvailable = useCallback((proxy: Proxy): NameAddress | undefined => accounts?.find((a) => a.address === getSubstrateAddress(proxy.delegate)), [accounts]);

  return (
    <>
      <Grid
        container
        maxHeight={address ? '60px' : '85px'}
        overflow='hidden'
      >
        {proxies.map((proxy, index) => (
          <Grid
            alignItems='end'
            container
            item
            justifyContent='center'
            key={index}
            sx={{
              m: 'auto',
              pt: '5px',
              width: '90%'
            }}
          >
            {isAvailable(proxy.proxy)?.name
              ? (
                <Typography
                  fontSize='16px'
                  fontWeight={400}
                  lineHeight='23px'
                  maxWidth='35%'
                  overflow='hidden'
                  textOverflow='ellipsis'
                  whiteSpace='nowrap'
                >
                  {isAvailable(proxy.proxy)?.name}
                </Typography>)
              : (
                <Grid
                  fontSize='16px'
                  fontWeight={400}
                  item
                  lineHeight='22px'
                  pl='5px'
                >
                  <ShortAddress
                    address={proxy.proxy.delegate}
                    style={{ fontSize: '16px' }}
                    inParentheses
                  />
                </Grid>)
            }
            <Typography
              fontSize='16px'
              fontWeight={400}
              lineHeight='23px'
            >
              {`(${proxy.proxy.proxyType})`}
            </Typography>
            <Typography
              fontSize='16px'
              fontWeight={400}
              lineHeight='23px'
              pl='5px'
            >
              {proxy.status === 'new' && t<string>('Added')}
              {proxy.status === 'remove' && t<string>('Removed')}
            </Typography>
          </Grid>
        ))}
      </Grid>
      {address &&
        <Grid m='5px auto' width='92%'>
          <ThroughProxy address={address} name={name} chain={chain} />
        </Grid>
      }
      <Divider
        sx={{
          bgcolor: 'secondary.main',
          height: '2px',
          m: '5px auto',
          width: '75%'
        }}
      />
      <Grid
        alignItems='end'
        container
        justifyContent='center'
        sx={{
          m: 'auto',
          width: '90%'
        }}
      >
        <Typography
          fontSize='16px'
          fontWeight={400}
          lineHeight='23px'
        >
          {t<string>('Deposit:')}
        </Typography>
        <Grid
          fontSize='16px'
          fontWeight={400}
          item
          lineHeight='22px'
          pl='5px'
        >
          <ShowBalance
            api={api}
            balance={deposit}
            decimalPoint={4}
            height={22}
          />
        </Grid>
      </Grid>
    </>
  );
}