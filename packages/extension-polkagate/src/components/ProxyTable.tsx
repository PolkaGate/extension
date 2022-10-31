// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormControlLabel, Grid, Radio, SxProps, Theme, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useTranslation } from '../hooks';
import { NameAddress, Proxy } from '../util/types';
import { getSubstrateAddress, toShortAddress } from '../util/utils';
import Label from './Label';
import { AccountContext, Identicon } from './';

interface Props {
  chain?: Chain | undefined | null;
  label: string;
  style?: SxProps<Theme>;
  proxies?: Proxy[];
  onSelect?: (selected: Proxy) => void
  maxHeight?: string;
  proxyTypeFilter?: string[];
  notFoundText?: string;
}

export default function ProxyTable({ proxyTypeFilter, notFoundText = '', onSelect, chain, label, style, proxies = undefined, maxHeight = '112px' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const [wanrningText, setWanrningText] = useState<string>();

  useEffect(() => {
    setWanrningText(notFoundText || `No proxies found for the above account’s address on ${chain?.name}. You can use it as Watch Only Account.`);
  }, [chain?.name, notFoundText]);

  const isAvailable = useCallback((proxy: Proxy): NameAddress | undefined =>
    accounts?.find((a) => a.address === getSubstrateAddress(proxy.delegate) && (proxyTypeFilter ? proxyTypeFilter.includes(proxy.proxyType) : true))
  , [accounts, proxyTypeFilter]);

  const handleOptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    proxies && onSelect && onSelect(proxies[Number(event.target.value)]);
  }, [onSelect, proxies]);

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
                xs={4.7}
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
                xs={3.9}
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
              <Grid
                item
                xs={2}
              >
                <Typography
                  fontSize='12px'
                  fontWeight={300}
                  lineHeight='25px'
                >
                  {onSelect ? t('Select') : t('Available')}
                </Typography>
              </Grid>
            </Grid>
            {chain &&
              (proxies
                ? proxies.length
                  ? proxies.map((proxy, index) => {
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
                          height: '41px',
                          opacity: `${isAvailable(proxy) ? 1 : 0.5}`,
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
                          xs={4.7}
                        >
                          <Grid
                            item
                            width='30px'
                          >
                            <Identicon
                              prefix={chain?.ss58Format ?? 42}
                              size={30}
                              theme={chain?.icon || 'polkadot'}
                              value={proxy.delegate}
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
                            {isAvailable(proxy)?.name || toShortAddress(proxy.delegate)}
                          </Typography>
                        </Grid>
                        <Grid
                          alignItems='center'
                          container
                          height='100%'
                          item
                          justifyContent='center'
                          xs={3.9}
                        >
                          <Typography
                            fontSize='12px'
                            fontWeight={400}
                          >
                            {proxy.proxyType}
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
                            {proxy.delay}
                          </Typography>
                        </Grid>
                        <Grid
                          alignItems='center'
                          container
                          height='100%'
                          item
                          justifyContent='center'
                          xs={2}
                        >
                          {onSelect
                            ? (
                              <FormControlLabel
                                control={
                                  <Radio
                                    // checked={selectedIndex === index}
                                    disabled={!isAvailable(proxy)}
                                    onChange={handleOptionChange}
                                    size='small'
                                    sx={{ color: 'red' }}
                                    value={index}
                                  />
                                }
                                label=''
                                sx={{ pl: '20px' }}
                                value={index}
                              />)
                            : (
                              <Typography
                                fontSize='12px'
                                fontWeight={400}
                              >
                                {isAvailable(proxy) ? 'Yes' : 'No'}
                              </Typography>)
                          }
                        </Grid>
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
