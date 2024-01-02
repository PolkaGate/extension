// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { FormControlLabel, Grid, Radio, SxProps, Theme, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Chain } from '@polkadot/extension-chains/types';

import { useApi, useApiWithChain, useTranslation } from '../hooks';
import { NameAddress, Proxy, ProxyItem } from '../util/types';
import { getSubstrateAddress } from '../util/utils';
import Label from './Label';
import { AccountContext, Checkbox2 as Checkbox, Identity } from '.';

interface Props {
  chain: Chain | undefined | null;
  label: string;
  style?: SxProps<Theme>;
  proxies: ProxyItem[] | undefined;
  onSelect?: (selected: Proxy) => void;
  mode: 'None' | 'Availability' | 'Delete' | 'Select' | 'Status';
  maxHeight?: string | number;
  proxyTypeFilter?: string[];
  notFoundText?: string;
  selected?: Proxy;
}

export default function ProxyTable({ proxyTypeFilter, notFoundText = '', selected, onSelect, mode, chain, label, style, proxies = undefined, maxHeight = '112px' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const [warningText, setWarningTest] = useState<string>();
  const params = useParams<{ address: string | undefined }>();
  const api = useApi(params?.address);
  const api2 = useApiWithChain(chain);

  useEffect(() => {
    const text = notFoundText || (mode === 'Availability'
      ? t('No proxies found for the provided address on {{chainName}}. You can use it as a watch-only account.', { replace: { chainName: chain?.name } })
      : t('No proxies were found for the account on {{chainName}}.', { replace: { chainName: chain?.name } }));

    setWarningTest(text);
  }, [chain?.name, mode, notFoundText, t]);

  const isAvailable = useCallback((proxy: Proxy): NameAddress | undefined =>
    accounts?.find((a) => a.address === getSubstrateAddress(proxy.delegate) && (proxyTypeFilter ? proxyTypeFilter.includes(proxy.proxyType) : true))
    , [accounts, proxyTypeFilter]);

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    proxies && onSelect && onSelect(proxies[Number(event.target.value)].proxy);
  }, [onSelect, proxies]);

  const handleDelete = useCallback((proxy: Proxy) => {
    proxies && onSelect && onSelect(proxy);
  }, [onSelect, proxies]);

  const Select = ({ index, proxy }: { proxy: Proxy, index: number }) => (
    <FormControlLabel
      checked={proxy === selected}
      control={
        <Radio
          onChange={handleSelect}
          size='small'
          sx={{ '&.Mui-disabled': { color: 'text.disabled' }, color: 'secondary.main' }}
          value={index}
        />
      }
      disabled={!isAvailable(proxy)}
      label=''
      sx={{ m: 'auto' }}
      value={index}
    />
  );

  const Delete = ({ proxyItem }: { proxyItem: ProxyItem }) => (
    <Grid height={25} onClick={() => handleDelete(proxyItem.proxy)}>
      {proxyItem.status === 'new'
        ? <BackspaceIcon
          sx={{
            color: 'secondary.main',
            cursor: 'pointer',
            height: '25px',
            width: '30px'
          }}
        />
        : <Checkbox
          checked={proxyItem.status === 'remove'}
          style={{ transform: 'scale(1.4)' }}
        />
      }
    </Grid>
  );

  const Available = ({ proxy }: { proxy: Proxy }) => (
    <Typography fontSize='12px' fontWeight={400}>
      {isAvailable(proxy) ? t('Yes') : t('No')}
    </Typography>
  );

  const Status = ({ status }: { status: string }) => (
    <Typography fontSize='12px' fontWeight={400}>
      {status === 'new' && 'Adding'}
      {status === 'remove' && 'Removing'}
    </Typography>
  );

  const fade = (toCheck: ProxyItem) => {
    if (mode === 'Delete') {
      return (toCheck.status === 'remove');
    }

    if (mode === 'Availability' || mode === 'Select') {
      return !(isAvailable(toCheck.proxy));
    }

    return false;
  };

  return (
    <Grid sx={{ ...style }}>
      <Label label={label} style={{ fontWeight: 300, position: 'relative' }}>
        <Grid container direction='column' sx={{ '> div:not(:last-child:not(:only-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight, minHeight: '68px', overflowY: 'scroll', textAlign: 'center' }}>
          <Grid container item sx={{ '> div:not(:last-child)': { borderRight: '1px solid', borderRightColor: 'secondary.light' }, textAlign: 'center' }} xs={12}>
            <Grid item xs={mode === 'None' ? 6.1 : 4.7}>
              <Typography fontSize='12px' fontWeight={300} lineHeight='25px'>
                {t('Account')}
              </Typography>
            </Grid>
            <Grid item xs={mode === 'None' ? 4.5 : 3.9}>
              <Typography fontSize='12px' fontWeight={300} lineHeight='25px'>
                {t('Type')}
              </Typography>
            </Grid>
            <Grid item xs={1.4}>
              <Typography fontSize='12px' fontWeight={300} lineHeight='25px'>
                {t('Delay')}
              </Typography>
            </Grid>
            {mode !== 'None' &&
              <Grid item xs={2}>
                <Typography fontSize='12px' fontWeight={300} lineHeight='25px'>
                  {mode === 'Select' ? t('Select') : mode === 'Delete' ? t('Delete') : mode === 'Status' ? t('Status') : t('Available')}
                </Typography>
              </Grid>
            }
          </Grid>
          {chain &&
            (proxies
              ? proxies.length
                ? proxies.map((proxyItem, index) => {
                  return (
                    <Grid container item key={index} sx={{ '> div:not(:last-child)': { borderRight: '1px solid', borderRightColor: 'secondary.light' }, bgcolor: fade(proxyItem) ? 'primary.contrastText' : 'transparent', height: '41px', opacity: fade(proxyItem) ? 0.7 : 1, textAlign: 'center' }} xs={12}>
                      <Grid alignItems='center' container item justifyContent='left' pl='3px' xs={mode === 'None' ? 6.1 : 4.7}>
                        <Identity api={api ?? api2} chain={chain} formatted={proxyItem.proxy.delegate} identiconSize={25} showShortAddress showSocial={false} style={{ 'div:nth-child(2)': { maxWidth: '85px' }, fontSize: '12px' }} subIdOnly />
                      </Grid>
                      <Grid alignItems='center' container height='100%' item justifyContent='center' xs={mode === 'None' ? 4.5 : 3.9}>
                        <Typography fontSize='12px' fontWeight={400}>
                          {proxyItem.proxy.proxyType}
                        </Typography>
                      </Grid>
                      <Grid alignItems='center' container height='100%' item justifyContent='center' xs={1.4}>
                        <Typography fontSize='12px' fontWeight={400}>
                          {proxyItem.proxy.delay}
                        </Typography>
                      </Grid>
                      {mode !== 'None' &&
                        <Grid alignItems='center' container height='100%' item justifyContent='center' xs={2}>
                          {mode === 'Availability'
                            ? <Available proxy={proxyItem.proxy} />
                            : mode === 'Select'
                              ? <Select index={index} proxy={proxyItem.proxy} />
                              : mode === 'Delete'
                                ? <Delete proxyItem={proxyItem} />
                                : <Status status={proxyItem.status} />
                          }
                        </Grid>
                      }
                    </Grid>
                  );
                })
                : <Grid display='inline-flex' p='10px'>
                  <FontAwesomeIcon className='warningImage' icon={faExclamationTriangle} />
                  <Typography fontSize='12px' fontWeight={400} lineHeight='20px' pl='8px'>
                    {warningText}
                  </Typography>
                </Grid>
              : <Grid alignItems='center' container justifyContent='center'>
                <Grid item role='progressbar'>
                  <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
                </Grid>
                <Typography fontSize='13px' lineHeight='41px' pl='10px'>
                  {t<string>('looking for proxies...')}
                </Typography>
              </Grid>
            )}
        </Grid>
      </Label>
    </Grid>
  );
}
