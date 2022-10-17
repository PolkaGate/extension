// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { nameAddress, Proxy } from '../util/plusTypes';
import Identicon from './Identicon';
import Label from './Label';

interface Props {
  addresesOnThisChain: nameAddress[];
  chain?: Chain | undefined;
  label: string;
  withRemove?: boolean;
  style?: SxProps<Theme>;
  proxies?: Proxy[];
}

export default function ProxyTable({ addresesOnThisChain, chain, label, withRemove = false, style, proxies = undefined }: Props): React.ReactElement<Props> {
  const isAvailable = useCallback((address: string): nameAddress => addresesOnThisChain?.find((a) => a.address === address), [addresesOnThisChain]);

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
              maxHeight: '109px',
              minHeight: '68px',
              overflowY: 'scroll',
              scrollbarWidth: 'none'
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
                xs={4.5}
              >
                <Typography
                  fontSize='12px'
                  fontWeight={300}
                  lineHeight='25px'
                >
                  Address
                </Typography>
              </Grid>
              <Grid
                item
                xs={3}
              >
                <Typography
                  fontSize='12px'
                  fontWeight={300}
                  lineHeight='25px'
                >
                  Type
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
                  Delay
                </Typography>
              </Grid>
              <Grid
                item
                xs={2.5}
              >
                <Typography
                  fontSize='12px'
                  fontWeight={300}
                  lineHeight='25px'
                >
                  Available
                </Typography>
              </Grid>
              {/* <Grid item>
                address
              </Grid> */}
            </Grid>
            {proxies &&
              proxies.map((proxy, index) => {
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
                      textAlign: 'center'
                    }}
                    xs={12}
                  >
                    <Grid
                      alignItems='center'
                      container
                      height='100%'
                      item
                      justifyContent='center'
                      xs={4.5}
                    >
                      <Grid
                        item
                        width='30px'
                      >
                        <Identicon
                          // prefix={chain?.ss58Format ?? 42}
                          prefix={0}
                          size={30}
                          // theme={chain?.icon || 'polkadot'}
                          theme={'polkadot'}
                          value={proxy.delegate}
                        />
                      </Grid>
                      <Typography
                        fontSize='12px'
                        fontWeight={400}
                        maxWidth='85px'
                        overflow='hidden'
                        pl='5px'
                        textOverflow='ellipsis'
                      >
                        {proxy.delegate}
                      </Typography>
                    </Grid>
                    <Grid
                      alignItems='center'
                      container
                      height='100%'
                      item
                      justifyContent='center'
                      xs={3}
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
                      xs={2}
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
                      xs={2.5}
                    >
                      <Typography
                        fontSize='12px'
                        fontWeight={400}
                      >
                        {isAvailable(proxy.delegate)}
                      </Typography>
                    </Grid>
                    {/* <Grid item>
                address
              </Grid> */}
                  </Grid>
                )
              })
            }
          </Grid>
        </Label>
      </Grid>
    </>
  );
}
