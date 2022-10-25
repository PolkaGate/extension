// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Cancel as CancelIcon, CheckCircle as CheckCircleIcon, LensBlur as LensBlurIcon } from '@mui/icons-material';
import { Divider, Grid, Link, Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { ActionContext, FormatBalance2, PButton } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import getLogo from '../../util/getLogo';
import { toShortAddress, upperCaseFirstChar } from '../../util/utils';


export default function Detail(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const { state: { chainName, info, decimals, token, path } } = useLocation();
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
    if (info?.transfer) {
      return `${t('From')}: ${toShortAddress(info.transfer.from)}`;
    }
  }, [info, t]);

  const to = useMemo(() => {
    if (info?.transfer) {
      return `${t('To')}: ${toShortAddress(info.transfer.to)}`;
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

  const Item = ({ item, mt = 0, noDivider = false }: { item: string | undefined, mt?: number, noDivider?: boolean }) => (
    <>
      {item &&
        <>
          <Typography
            fontSize='16px'
            fontWeight={400}
            sx={{ mt: `${mt}px` }}
          >
            {item}
          </Typography>
          {!noDivider && <Divider
            sx={{
              bgcolor: 'secondary.light',
              height: '2px',
              m: '3px auto',
              width: '75%'
            }}
          />
          }
        </>
      }
    </>
  );

  const Amount = ({ amount, label }: { label: string, amount: string }) => (
    <Grid container item justifyContent='center' spacing={1}
      fontSize='16px'
      fontWeight={400}
    >
      <Grid item>
        {label}
      </Grid>
      <Grid item>
        <FormatBalance2 decimals={[Number(decimals)]} tokens={[token]} value={new BN(amount)} />
      </Grid>
    </Grid>
  );

  const FailSuccessIcon = () => (
    <>
      {
        success
          ? <CheckCircleIcon
            sx={{
              bgcolor: '#fff',
              borderRadius: '50%',
              color: 'success.main',
              fontSize: '54px',
              mt: '20px'
            }
            }
          />
          : <CancelIcon
            sx={{
              bgcolor: '#fff',
              borderRadius: '50%',
              color: 'warning.main',
              fontSize: '54px',
              mt: '20px'
            }}
          />
      }
      <Typography
        fontSize='16px'
        fontWeight={500}
        mt='10px'
      >
        {success ? t<string>('Completed') : t<string>('Failed')}
      </Typography>
    </>
  );

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
        {/* {Condition && */}
        <Typography
          fontSize='18px'
          fontWeight={300}
        >
          {subAction}
        </Typography>
        {/* } */}
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '35%'
          }}
        />
        <FailSuccessIcon />
        {/* <Typography
          fontSize='16px'
          fontWeight={400}
          mt='15px'
        >
          Reason
        </Typography> */}
        <Item item={info?.timestamp && (new Date(parseInt(info.timestamp) * 1000)).toLocaleDateString(undefined, options)} mt={15} />
        <Item item={from} />
        <Item item={to} />
        {amount &&
          <Amount label={t('Amount')} amount={amount} />
        }
        {fee &&
          <Amount label={t('Fee')} amount={fee} />
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
        <Item item={`${t('Hash')}: #${toShortAddress(info?.extrinsicHash, 6)}`} noDivider />
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
      <PButton
        _onClick={_onBack}
        text={t<string>('Back')}
      />
    </>
  );
}
