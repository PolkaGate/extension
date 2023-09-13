// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';

import { AccountContext, PButton, Popup } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { NameAddress, TransactionDetail } from '../../util/types';
import { accountName, amountToMachine, toShortAddress, upperCaseFirstChar } from '../../util/utils';
import Amount from './partials/Amount';
import FailSuccessIcon from './partials/FailSuccessIcon';
import Item from './partials/Item';
import ToFrom from './partials/ToFrom';
import Explorer from './Explorer';

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

  const _onBack = useCallback(() => {
    setShowDetail(false);
  }, [setShowDetail]);

  const action = useMemo((): string | undefined => upperCaseFirstChar(info?.action), [info?.action]);

  const subAction = useMemo((): string | undefined => info?.subAction ? upperCaseFirstChar(info?.subAction) : '', [info]);

  const ShowNameAddress = ({ nameAddress, title }: { title: string, nameAddress: NameAddress }) => {
    const name = nameAddress?.name || accountName(accounts, nameAddress?.address);

    return (
      <Grid container item maxWidth='85%' width='fit-content'>
        <Grid item sx={{ width: 'fit-content', maxWidth: '65%' }}>
          <Typography fontSize='16px' fontWeight={400} sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {title}: {name}
          </Typography>
        </Grid>
        <Grid item width='fit-content'>
          {`${name ? ' (' : ''}${toShortAddress(nameAddress.address)}${name ? ')' : ''}`}
        </Grid>
      </Grid>
    );
  };

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
        <Item item={info?.date && new Date(info.date).toLocaleDateString(undefined, options)} mt={15} />
        {info?.from &&
          <ToFrom item={<ShowNameAddress title={t('From')} nameAddress={info.from} />} toCopy={info?.from?.address} />
        }
        {info?.to &&
          <ToFrom item={<ShowNameAddress title={t('To')} nameAddress={info.to} />} toCopy={info?.to?.address} />
        }
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
        <Grid container item justifyContent='center' sx={{ mt: '12px' }}>
          <Explorer chainName={chainName} formatted={info?.from?.address} txHash={info?.txHash} />
        </Grid>
      </Grid>
      <PButton
        _onClick={_onBack}
        text={t<string>('Back')}
      />
    </Popup>
  );
}
