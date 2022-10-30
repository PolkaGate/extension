// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Link, Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { AccountContext, ActionContext, PButton } from '../../components';
import { useRedirectOnRefresh, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import getLogo from '../../util/getLogo';
import { accountName, toShortAddress, upperCaseFirstChar } from '../../util/utils';
import Amount from './partials/Amount';
import FailSuccessIcon from './partials/FailSuccessIcon';
import Item from './partials/Item';

interface LocationState {
  chainName: string;
  info: Record<string, any>;
  decimal: number;
  token: string;
  path: string;
}

// TODO: make this as a popup
export default function Detail(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);

  const { state: { chainName, decimal, info, path, token } } = useLocation<LocationState>();
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const subscanLink = () => 'https://' + chainName + '.subscan.io/extrinsic/' + String(info?.extrinsicHash);

  const _onBack = useCallback(() => {
    path && onAction(path);
  }, [onAction, path]);

  const action = useMemo((): string | undefined => {
    if (info?.transfer) {
      if (info?.id.includes('to')) {
        return t('Receive');
      }

      return t('Send');
    }

    if (info?.extrinsic) {
      return upperCaseFirstChar(info?.extrinsic.module);
    }
  }, [info, t]);

  const subAction = useMemo((): string | undefined => {
    if (info?.extrinsic) {
      return upperCaseFirstChar(info?.extrinsic.call);
    }
  }, [info]);

  const success = useMemo((): boolean =>
    !!(info?.extrinsic?.success || info?.transfer?.success || info?.reward?.success)
    , [info]);

  const from = useMemo(() => {
    const name = accountName(accounts, info?.transfer?.from);

    if (info?.transfer) {
      return `${t('From')}:  ${name ?? ''}${name ? '(' : ''}${toShortAddress(info.transfer.from)}${name ? ')' : ''}`;
    }
  }, [accounts, info?.transfer, t]);

  const to = useMemo(() => {
    const name = accountName(accounts, info?.transfer?.to);

    if (info?.transfer) {
      return `${t('To')}: ${name ?? ''}${name ? '(' : ''}${toShortAddress(info.transfer.to)}${name ? ')' : ''}`;
    }
  }, [info, t]);

  const amount = useMemo((): string | undefined => {
    if (info?.transfer) {
      return info.transfer.amount;
    }
  }, [info]);

  const fee = useMemo((): string | undefined => {
    if (info?.transfer) {
      return info.transfer.fee;
    }

    if (info?.extrinsic) {
      return info.extrinsic.fee;
    }
  }, [info]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBack}
        showBackArrow
        text={t<string>('Transaction Detail')}
      />
      <Grid
        alignItems='center'
        justifyContent='center'
        pt='10px'
        textAlign='center'
      >
        <Typography
          fontSize='20px'
          fontWeight={400}
        >
          {action}
        </Typography>
        <Typography
          fontSize='18px'
          fontWeight={300}
        >
          {subAction}
        </Typography>
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '35%'
          }}
        />
        <FailSuccessIcon success={success} />
        {/* <Typography
          fontSize='16px'
          fontWeight={400}
          mt='15px'
        >
          Reason
        </Typography> */}
        <Item item={info?.timestamp && (new Date(parseInt(info.timestamp) * 1000)).toLocaleDateString(undefined, options)} mt={15} />
        <Item item={from} toCopy={info?.transfer?.from} />
        <Item item={to} toCopy={info?.transfer?.to} />
        {amount &&
          <Amount amount={amount} decimal={decimal} label={t('Amount')} token={token} />
        }
        {fee &&
          <Amount amount={fee} decimal={decimal} label={t('Fee')} token={token} />
        }
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '75%'
          }}
        />
        <Item item={`${t('Block')}: #${info?.blockNumber}`} noDivider />
        <Item item={`${t('Hash')}: #${toShortAddress(info?.extrinsicHash, 6)}`} noDivider toCopy={info?.extrinsicHash} />
        <Grid item sx={{ mt: '20px' }}>
          <Link
            href={`${subscanLink()}`}
            rel='noreferrer'
            target='_blank'
            underline='none'
          >
            <Grid
              alt={'subscan'}
              component='img'
              src={getLogo('subscan')}
              sx={{ height: 40, width: 40 }}
            />
          </Link>
        </Grid>
      </Grid>
      <PButton
        _onClick={_onBack}
        text={t<string>('Back')}
      />
    </>
  );
}
