// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { Identicon, ShortAddress } from '../components';
import { useTranslation } from '../hooks';

interface Props {
  name: string | Element;
  address: string;
  chain: Chain;
}

export default function ThroughProxy({ address, chain, name }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <Grid
        alignItems='center'
        container
        justifyContent='center'
        sx={{
          fontWeight: 300,
          letterSpacing: '-0.015em'
        }}
      >
        <Grid
          item
          sx={{
            fontSize: '12px'
          }}
          xs={2}
        >
          {t('Through')}
        </Grid>
        <Divider
          orientation='vertical'
          sx={{
            bgcolor: 'secondary.main',
            height: '27px',
            mb: '1px',
            mt: '4px',
            width: '1px'
          }}
        />
        <Grid
          alignItems='center'
          container
          item
          justifyContent='center'
          sx={{
            maxWidth: '65%',
            px: '2px',
            width: 'fit-content'
          }}
        >
          <Grid
            alignItems='center'
            container
            item
            justifyContent='center'
            sx={{
              lineHeight: '28px'
            }}
          >
            {chain &&
              <Grid
                item
              >
                <Identicon
                  iconTheme={chain?.icon || 'polkadot'}
                  prefix={chain?.ss58Format ?? 42}
                  size={25}
                  value={address}
                />
              </Grid>
            }
            <Grid
              container
              item
              sx={{
                fontSize: '16px',
                fontWeight: 400,
                maxWidth: '80%',
                overflow: 'hidden',
                pl: '7px',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <Grid
                item
                // maxWidth= '80%',
                overflow='hidden'
                pl='7px'
                textOverflow='ellipsis'
                whiteSpace='nowrap'
                sx={{
                  lineHeight: '16px'
                }}
              >
                {name}
              </Grid>
              <Grid
                item
                sx={{
                  fontSize: '12px',
                  fontWeight: 300,
                  lineHeight: '12px',
                  width: 'fit-content'
                }}
              >
                <ShortAddress address={address} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider
          orientation='vertical'
          sx={{
            bgcolor: 'secondary.main',
            height: '27px',
            mb: '1px',
            mt: '4px',
            width: '1px'
          }}
        />
        <Grid
          item
          sx={{
            fontSize: '12px',
            fontWeight: 300,
            textAlign: 'center'
          }}
          xs={2}
        >
          {t('as proxy')}
        </Grid>
      </Grid>
    </>
  );
}
