// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, SxProps, Theme, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useTranslation } from '../hooks';
import { NameAddress, Proxy } from '../util/types';
import Identicon from './Identicon';
import Label from './Label';

interface Props {
  addressesOnThisChain: NameAddress[];
  chain?: Chain | undefined;
  label: string;
  withRemove?: boolean;
  style?: SxProps<Theme>;
  proxies?: Proxy[];
}

export default function ProxyTable({ addressesOnThisChain, chain, label, withRemove = false, style, proxies = undefined }: Props): React.ReactElement<Props> {
  const isAvailable = useCallback((address: string): NameAddress | undefined => addressesOnThisChain?.find((a) => a.address === address), [addressesOnThisChain]);
  const { t } = useTranslation();

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
                              prefix={chain?.ss58Format ?? 42}
                              size={30}
                              theme={chain?.icon || 'polkadot'}
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
                            {isAvailable(proxy.delegate) ? 'Yes' : 'No'}
                          </Typography>
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
                        {`No proxies found for the above account’s address on ${chain.name}. You can use it as Watch Only Account.`}
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
