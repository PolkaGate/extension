// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account balances information in detail
 * */

import '@vaadin/icons';

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Container, Divider, Grid, Skeleton, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountJson } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';

import { Identicon, Motion, Popup, ShowBalance } from '../../components';
import { useFormatted, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { getValue } from './util';

interface Props {
  account: AccountJson | null;
  api: ApiPromise;
  show: boolean;
  chain: Chain;
  price: number | undefined;
  balances: DeriveBalancesAll;
  formatted: string;
  setShow: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

export default function Others({ account, api, balances, chain, formatted, price, setShow, show }: Props): React.ReactElement<void> {
  const { t } = useTranslation();

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      // isExternal={isExternal}
      // onCopy={_onCopy}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  const goToAccount = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const Balance = ({ balances, type }: { type: string, balances: DeriveBalancesAll | undefined }) => {
    const value = getValue(type, balances);
    const balanceInUSD = price && value && api && Number(value) / (10 ** api.registry.chainDecimals[0]) * price;

    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' py='5px'>
          <Grid item xs={4.5}>
            <Typography sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '36px' }}>
              {type}
            </Typography>
          </Grid>
          <Grid container direction='column' item justifyContent='flex-end' xs>
            <Grid item textAlign='right'>
              <Typography sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }}>
                <ShowBalance api={api} balance={value} />
              </Typography>
            </Grid>
            <Grid item pt='6px' textAlign='right'>
              <Typography sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '15px' }}>
                {balanceInUSD !== undefined
                  ? `$${Number(balanceInUSD)?.toLocaleString()}`
                  : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />
                }
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: type === 'Others' ? '2px' : '1px', my: '5px' }} />
      </>
    );
  };

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          _centerItem={identicon}
          noBorder
          onBackClick={goToAccount}
          paddingBottom={0}
          showBackArrow
        />
        <Container disableGutters sx={{ px: '15px' }}>
          <Grid container item justifyContent='center' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Typography sx={{ fontSize: '28px', fontWeight: 400, letterSpacing: '-0.015em' }}>
              {account?.name}
            </Typography>
          </Grid>
          <Grid container item justifyContent='center'>
            <Typography sx={{ fontSize: '36px', fontWeight: 400, letterSpacing: '-0.015em' }}>
              {t('Others')}
            </Typography>
          </Grid>
          <Grid alignItems='center' item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px' }} />
          </Grid>
        </Container>
        <Container disableGutters sx={{ maxHeight: `${parent.innerHeight - 150}px`, overflowY: 'auto', px: '15px' }}>
          {/* <Balance balances={balances} type={'Free Balance'} /> */}
          {/* <Balance balances={balances} type={'Reserved Balance'} /> */}
          <Balance balances={balances} type={'Frozen Misc'} />
          <Balance balances={balances} type={'Frozen Fee'} />
          <Balance balances={balances} type={'Locked Balance'} />
          <Balance balances={balances} type={'Vested Balance'} />
          <Balance balances={balances} type={'Vested Claimable'} />
          <Balance balances={balances} type={'Vesting Locked'} />
          <Balance balances={balances} type={'Vesting Total'} />
          {/* <Balance balances={balances} type={'Voting Balance'} /> */}
        </Container>
      </Popup>
    </Motion>
  );
}
