// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, FormControlLabel, Grid, SxProps, Theme, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, Label, Progress } from '../../../components';
import { useTranslation } from '../../../hooks';

interface Props {
  api: ApiPromise | undefined;
  chain: Chain | undefined;
  label: string;
  style?: SxProps<Theme>;
  maxHeight?: string;
  minHeight?: string;
  proxiedAccounts: string[] | null | undefined;
  selectedProxied: string[];
  setSelectedProxied: React.Dispatch<React.SetStateAction<string[]>>
}

export default function ProxiedTable ({ api, chain, label, maxHeight = '120px', minHeight = '70px', proxiedAccounts, selectedProxied, setSelectedProxied, style }: Props): React.ReactElement {
  const { t } = useTranslation();

  // const isAvailable = useCallback((proxy: Proxy): NameAddress | undefined =>
  //   accounts?.find((a) => a.address === getSubstrateAddress(proxy.delegate) && (proxyTypeFilter ? proxyTypeFilter.includes(proxy.proxyType) : true))
  //   , [accounts, proxyTypeFilter]);

  console.log('proxiedAccounts:', proxiedAccounts);

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const proxied = proxiedAccounts && proxiedAccounts[Number(event.target.value)];
    const alreadyAdded = selectedProxied.includes(proxied as string);

    if (proxied && alreadyAdded) {
      setSelectedProxied(selectedProxied.filter((selected) => selected !== proxied));
    } else if (proxied && !alreadyAdded) {
      setSelectedProxied([...selectedProxied, proxied]);
    }
  }, [proxiedAccounts, selectedProxied, setSelectedProxied]);

  const Select = ({ index, proxied }: { proxied: string, index: number }) => (
    <FormControlLabel
      checked={selectedProxied.includes(proxied)}
      control={
        <Checkbox
          onChange={handleSelect}
          size='medium'
          sx={{ '&.Mui-disabled': { color: 'text.disabled' }, color: 'secondary.main' }}
          value={index}
        />
      }
      label=''
      sx={{ m: 'auto' }}
      value={index}
    />
  );

  // const fade = (toCheck: ProxyItem) => {
  //   if (mode === 'Delete') {
  //     return (toCheck.status === 'remove');
  //   }

  //   if (mode === 'Availability' || mode === 'Select') {
  //     return !(isAvailable(toCheck.proxy));
  //   }

  //   return false;
  // };

  return (
    <Grid container item sx={{ ...style }}>
      <Label label={label} style={{ fontWeight: 300, position: 'relative', width: '100%' }}>
        <Grid container direction='column' item sx={{ '> div:not(:last-child:not(:only-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight, minHeight, overflowY: 'scroll', textAlign: 'center' }}>
          <Grid container item sx={{ '> div:not(:last-child)': { borderRight: '1px solid', borderRightColor: 'secondary.light' }, textAlign: 'center' }}>
            <Grid container item xs={10}>
              <Typography fontSize='12px' fontWeight={300} lineHeight='25px' pl='20px'>
                {t('Account')}
              </Typography>
            </Grid>
            <Grid container item xs={2}>
              <Typography fontSize='12px' fontWeight={300} lineHeight='25px' sx={{ textAlign: 'center', width: '100%' }}>
                {t('Select')}
              </Typography>
            </Grid>
          </Grid>
          {proxiedAccounts === undefined &&
            <Grid alignItems='center' container justifyContent='center'>
              <Progress gridSize={75} pt='10px' title={t('Looking for proxied accounts ...')} type='grid' />
            </Grid>
          }
          {(proxiedAccounts === null || (proxiedAccounts && proxiedAccounts.length === 0)) &&
            <Grid display='inline-flex' p='10px'>
              <FontAwesomeIcon className='warningImage' icon={faExclamationTriangle} />
              <Typography fontSize='12px' fontWeight={400} lineHeight='20px' pl='8px'>
                {t('This isn\'t a proxy account on {{chainName}}!', { replace: { chainName: chain?.name } })}
              </Typography>
            </Grid>
          }
          {proxiedAccounts && proxiedAccounts.length > 0 && proxiedAccounts.map((proxiedAccount, index) =>
            <Grid container item key={index} sx={{ '> div:not(:last-child)': { borderRight: '1px solid', borderRightColor: 'secondary.light' }, height: '41px', textAlign: 'center' }}>
              <Grid alignItems='center' container item justifyContent='left' pl='10px' xs={10}>
                <Identity api={api} chain={chain} formatted={proxiedAccount} identiconSize={25} showShortAddress showSocial={false} style={{ fontSize: '12px', maxWidth: '100%' }} subIdOnly />
              </Grid>
              <Grid alignItems='center' container height='100%' item justifyContent='center' xs={2}>
                <Select index={index} proxied={proxiedAccount} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Label>
    </Grid>
  );
}
