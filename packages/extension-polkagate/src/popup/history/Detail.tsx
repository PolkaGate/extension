// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Link, Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';

import { AccountContext, PButton, Popup } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import getLogo from '../../util/getLogo';
import { TransactionDetail } from '../../util/types';
import { accountName, amountToMachine, toShortAddress, upperCaseFirstChar } from '../../util/utils';
import Amount from './partials/Amount';
import FailSuccessIcon from './partials/FailSuccessIcon';
import Item from './partials/Item';

interface Props {
  chainName: string;
  info: TransactionDetail;
  decimal: number;
  token: string;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
  showDetail: boolean;
}

export default function Detail({ chainName, decimal, info, setShowDetail, showDetail, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const subscanLink = () => 'https://' + chainName + '.subscan.io/extrinsic/' + String(info?.txHash);

  const _onBack = useCallback(() => {
    setShowDetail(false);
  }, [setShowDetail]);

  const action = useMemo((): string | undefined => upperCaseFirstChar(info?.action), [info?.action]);

  const subAction = useMemo((): string | undefined => info?.subAction ? upperCaseFirstChar(info?.subAction) : '', [info]);

  const from = useMemo(() => {
    const name = info?.from?.name || accountName(accounts, info?.from?.address);

    if (info?.from) {
      return `${t('From')}:  ${name ?? ''}${name ? '(' : ''}${toShortAddress(info.from.address)}${name ? ')' : ''}`;
    }
  }, [accounts, info?.from, t]);

  const to = useMemo(() => {
    const name = info?.to?.name || accountName(accounts, info?.to?.address);

    if (info?.to) {
      return `${t('To')}: ${name ?? ''}${name ? '(' : ''}${toShortAddress(info.to.address)}${name ? ')' : ''}`;
    }
  }, [accounts, info?.to, t]);

  return (
    <Popup show={showDetail}>
      <HeaderBrand
        onBackClick={_onBack}
        showBackArrow
        text={t<string>('Transaction Detail')}
      />
      <Grid alignItems='center' justifyContent='center' pt='10px' textAlign='center'>
        <Typography fontSize='20px' fontWeight={400}>
          {action}
        </Typography>
        <Typography fontSize='18px' fontWeight={300}>
          {subAction}
        </Typography>
        <Divider sx={{ bgcolor: 'secondary.light', height: '2px', m: '3px auto', width: '35%' }} />
        <FailSuccessIcon success={info.success} />
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
        {info?.amount &&
          <Amount amount={String(amountToMachine(info.amount, decimal))} decimal={decimal} label={t('Amount')} token={token} />
        }
        {info?.fee &&
          <Amount amount={info?.fee} decimal={decimal} label={t('Fee')} token={token} />
        }
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '75%'
          }}
        />
        <Item item={`${t('Block')}: #${info?.block}`} noDivider />
        <Item item={`${t('Hash')}: #${toShortAddress(info?.txHash, 6)}`} noDivider toCopy={info?.txHash} />
        <Grid item sx={{ mt: '20px' }}>
          <Link href={`${subscanLink()}`} rel='noreferrer' target='_blank' underline='none'>
            <Grid alt={'subscan'} component='img' src={getLogo('subscan')} sx={{ height: 40, width: 40 }} />
          </Link>
        </Grid>
      </Grid>
      <PButton
        _onClick={_onBack}
        text={t<string>('Back')}
      />
    </Popup>
  );
}
