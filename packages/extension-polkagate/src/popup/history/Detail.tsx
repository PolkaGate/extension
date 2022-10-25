// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Cancel as CancelIcon, CheckCircle as CheckCircleIcon, LensBlur as LensBlurIcon } from '@mui/icons-material';
import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { FormatBalance2, PButton } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { SubQueryHistory } from '../../util/types';
import { toShortAddress, upperCaseFirstChar } from '../../util/utils';
import { BN } from '@polkadot/util';

export default function Detail(): React.ReactElement {
  const { t } = useTranslation();
  const { state: { info, decimals, token } } = useLocation();
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

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
  }, [info, t]);

  const _onBack = useCallback(() => {
    return 'sdasd';
  }, []);

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
      return `${t('To')}: ${toShortAddress(info.transfer.from)}`;
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
        <LensBlurIcon
          sx={{
            fontSize: '40px',
            mt: '20px'
          }}
        />
      </Grid>
      <PButton
        _onClick={_onBack}
        text={t<string>('Back')}
      />
    </>
  );
}
