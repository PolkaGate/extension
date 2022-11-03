// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormControlLabel, Grid, Radio, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useTranslation } from '../hooks';
import { NameAddress, Proxy, ProxyItem } from '../util/types';
import { getSubstrateAddress, toShortAddress } from '../util/utils';
import Label from './Label';
import { AccountContext, Checkbox, Identicon } from '.';

interface Props {
  chain?: Chain | undefined | null;
  label: string;
  style?: SxProps<Theme>;
  proxies?: ProxyItem[];
  onSelect?: (selected: Proxy) => void;
  mode: 'None' | 'Availability' | 'Delete' | 'Select' | 'Status';
  maxHeight?: string;
  proxyTypeFilter?: string[];
  notFoundText?: string;
}

export default function ProxyTable({ proxyTypeFilter, notFoundText = '', onSelect, mode, chain, label, style, proxies = undefined, maxHeight = '112px' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const [wanrningText, setWanrningText] = useState<string>();
  const theme = useTheme();

  useEffect(() => {
    setWanrningText(notFoundText || `No proxies found for the above account’s address on ${chain?.name}. You can use it as Watch Only Account.`);
  }, [chain?.name, notFoundText, proxies?.length]);

  const isAvailable = useCallback((proxy: Proxy): NameAddress | undefined =>
    accounts?.find((a) => a.address === getSubstrateAddress(proxy.delegate) && (proxyTypeFilter ? proxyTypeFilter.includes(proxy.proxyType) : true))
    , [accounts, proxyTypeFilter]);

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    proxies && onSelect && onSelect(proxies[Number(event.target.value)]);
  }, [onSelect, proxies]);

  const handleDelete = useCallback((proxy: Proxy) => {
    proxies && onSelect && onSelect(proxy);
  }, [onSelect, proxies]);

  const Select = ({ proxy, index }: { proxy: Proxy, index: number }) => (
    <FormControlLabel
      control={
        <Radio
          disabled={!isAvailable(proxy)}
          onChange={handleSelect}
          size='small'
          sx={{ color: 'red' }}
          value={index}
        />
      }
      label=''
      sx={{ m: 'auto' }}
      value={index}
    />
  );

  const Delete = ({ proxyItem }: { proxyItem: ProxyItem }) => (
    <Grid
      onClick={() => handleDelete(proxyItem.proxy)}
    >
      {proxyItem.status === 'new'
        ? (
          <DeleteIcon
            sx={{
              color: 'secondary.main',
              cursor: 'pointer',
              fontSize: '30px'
            }}
          />)
        : (
          <Checkbox
            checked={proxyItem.status === 'remove'}
            height={25}
            label=''
            style={{ margin: 'auto', width: 'fit-content' }}
            theme={theme}
            width={25}
          />)
      }
    </Grid>
  );

  const Available = ({ proxy }: { proxy: Proxy }) => (
    <Typography
      fontSize='12px'
      fontWeight={400}
    >
      {isAvailable(proxy) ? 'Yes' : 'No'}
    </Typography>
  );

  const Status = ({ status }: { status: string }) => (
    <Typography
      fontSize='12px'
      fontWeight={400}
    >
      {status === 'new' && 'Adding'}
      {status === 'remove' && 'Removing'}
    </Typography>
  );

  const fade = (toCheck: ProxyItem) => {
    if (mode === 'Delete') {
      return (toCheck.status === 'remove');
    } else if (mode === 'Availability') {
      return (isAvailable(toCheck.proxy));
    }

    return false;
  };

  return (
    <>
      <Grid
        sx={{ ...style }}
      >
        <Label
          label={label}
          style={{ position: 'relative' }}
        >
          <Grid
            container
            direction='column'
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
                width: 0
              },
              '> div:not(:last-child:not(:only-child))': {
                borderBottom: '1px solid',
                borderBottomColor: 'secondary.light'
              },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'secondary.light',
              borderRadius: '5px',
              display: 'block',
              maxHeight,
              minHeight: '68px',
              overflowY: 'scroll',
              scrollbarWidth: 'none',
              textAlign: 'center'
            }}
          >
            <Grid
              container
              item
              sx={{
                '> div:not(:last-child)': {
                  borderRight: '1px solid',
                  borderRightColor: 'secondary.light'
                },
                textAlign: 'center'
              }}
              xs={12}
            >
              <Grid
                item
                xs={mode === 'None' ? 6.1 : 4.7}
              >
                <Typography
                  fontSize='12px'
                  fontWeight={300}
                  lineHeight='25px'
                >
                  {t('Address')}
                </Typography>
              </Grid>
              <Grid
                item
                xs={mode === 'None' ? 4.5 : 3.9}
              >
                <Typography
                  fontSize='12px'
                  fontWeight={300}
                  lineHeight='25px'
                >
                  {t('Type')}
                </Typography>
              </Grid>
              <Grid
                item
                xs={1.4}
              >
                <Typography
                  fontSize='12px'
                  fontWeight={300}
                  lineHeight='25px'
                >
                  {t('Delay')}
                </Typography>
              </Grid>
              {mode !== 'None' &&
                <Grid
                  item
                  xs={2}
                >
                  <Typography
                    fontSize='12px'
                    fontWeight={300}
                    lineHeight='25px'
                  >
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
                      <Grid
                        container
                        item
                        key={index}
                        sx={{
                          '> div:not(:last-child)': {
                            borderRight: '1px solid',
                            borderRightColor: 'secondary.light'
                          },
                          bgcolor: fade(proxyItem) ? '#212121' : 'transparent',
                          height: '41px',
                          opacity: fade(proxyItem) ? 0.7 : 1,
                          textAlign: 'center'
                        }}
                        xs={12}
                      >
                        <Grid
                          alignItems='center'
                          container
                          height='100%'
                          item
                          justifyContent='left'
                          pl='3px'
                          xs={mode === 'None' ? 6.1 : 4.7}
                        >
                          <Grid
                            item
                            width='30px'
                          >
                            <Identicon
                              prefix={chain?.ss58Format ?? 42}
                              size={30}
                              theme={chain?.icon || 'polkadot'}
                              value={proxyItem.proxy.delegate}
                            />
                          </Grid>
                          <Typography
                            fontSize='12px'
                            fontWeight={400}
                            maxWidth='calc(100% - 35px)'
                            overflow='hidden'
                            pl='5px'
                            textOverflow='ellipsis'
                            whiteSpace='nowrap'
                          >
                            {isAvailable(proxyItem.proxy)?.name || toShortAddress(proxyItem.proxy.delegate)}
                          </Typography>
                        </Grid>
                        <Grid
                          alignItems='center'
                          container
                          height='100%'
                          item
                          justifyContent='center'
                          xs={mode === 'None' ? 4.5 : 3.9}
                        >
                          <Typography
                            fontSize='12px'
                            fontWeight={400}
                          >
                            {proxyItem.proxy.proxyType}
                          </Typography>
                        </Grid>
                        <Grid
                          alignItems='center'
                          container
                          height='100%'
                          item
                          justifyContent='center'
                          xs={1.4}
                        >
                          <Typography
                            fontSize='12px'
                            fontWeight={400}
                          >
                            {proxyItem.proxy.delay}
                          </Typography>
                        </Grid>
                        {mode !== 'None' &&
                          <Grid
                            alignItems='center'
                            container
                            height='100%'
                            item
                            justifyContent='center'
                            xs={2}
                          >
                            {mode === 'Availability'
                              ? <Available proxy={proxyItem.proxy} />
                              : mode === 'Select'
                                ? <Select proxy={proxyItem.proxy} index={index} />
                                : mode === 'Delete'
                                  ? <Delete proxyItem={proxyItem} />
                                  : <Status status={proxyItem.status} />
                            }
                          </Grid>
                        }
                      </Grid>
                    );
                  })
                  : (
                    <Grid
                      display='inline-flex'
                      p='10px'
                    >
                      <FontAwesomeIcon
                        className='warningImage'
                        icon={faExclamationTriangle}
                      />
                      <Typography
                        fontSize='12px'
                        fontWeight={400}
                        lineHeight='20px'
                        pl='8px'
                      >
                        {wanrningText}
                      </Typography>
                    </Grid>
                  )
                : (
                  <Grid
                    alignItems='center'
                    container
                    justifyContent='center'
                  >
                    <Grid
                      item
                    >
                      <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
                    </Grid>
                    <Typography
                      fontSize='13px'
                      lineHeight='41px'
                      pl='10px'
                    >
                      {t<string>('looking for proxies...')}
                    </Typography>
                  </Grid>
                )
              )}
          </Grid>
        </Label>
      </Grid>
    </>
  );
}
