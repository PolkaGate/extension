// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account balances information in detail
 * */

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { Container, Divider, Grid, Skeleton, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { Identicon, Motion, Popup, ShowBalance } from '../../components';
import { useAccountName, useFormatted, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { BalancesInfo } from '../../util/types';
import { getValue } from './util';

interface Props {
  api?: ApiPromise;
  identity: DeriveAccountRegistration | null | undefined;
  show: boolean;
  chain: Chain;
  price: number | undefined;
  balances: BalancesInfo;
  address: AccountId | string;
  setShow: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

export default function Others({ address, api, balances, chain, identity, price, setShow, show }: Props): React.ReactElement<void> {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const accountName = useAccountName(address);

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      judgement={identity?.judgements}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  const goToAccount = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const Balance = ({ balances, type }: { type: string, balances: BalancesInfo | undefined }) => {
    const value = getValue(type, balances);
    const balanceInUSD = price && value && balances?.decimal && Number(value) / (10 ** balances.decimal) * price;

    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' py='5px'>
          <Grid item xs={4.5}>
            <Typography sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '36px' }}>
              {type}
            </Typography>
          </Grid>
          <Grid container direction='column' item alignItems='flex-end' xs>
            <Grid item textAlign='right'>
              <Typography sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }}>
                <ShowBalance api={api} balance={value} decimal={balances?.decimal} token={balances?.token} />
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
          <Grid container item justifyContent='center' >
            <Typography sx={{ fontSize: '28px', fontWeight: 400, maxWidth: '82%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {identity?.display || accountName}
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
          <Balance balances={balances} type={'Pooled Balance'} />
          <Balance balances={balances} type={'Free Balance'} />
          <Balance balances={balances} type={'Locked Balance'} />
          <Balance balances={balances} type={'Frozen Fee'} />
          <Balance balances={balances} type={'Vested Balance'} />
          <Balance balances={balances} type={'Vested Claimable'} />
          {/* <Balance balances={balances} type={'Vesting Locked'} /> */}
          {/* <Balance balances={balances} type={'Vesting Total'} /> */}
          <Balance balances={balances} type={'Voting Balance'} />
        </Container>
      </Popup>
    </Motion>
  );
}
