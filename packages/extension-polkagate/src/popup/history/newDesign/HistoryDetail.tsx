// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail } from '../../../util/types';

import { Grid, Stack, Typography } from '@mui/material';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React, { useMemo } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { FormatPrice } from '../../../components';
import { useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave2';
import { GlowBox, VelvetBox } from '../../../style';
import { amountToMachine, formatTimestamp } from '../../../util/utils';

type HistoryItemType = {
  date: string;
  from?: string;
  to?: string;
  amount?: string;
  fee: string;
  block: string;
  hash: string;
  'pool name'?: string;
  validators?: string;
  vote?: string;
  'referenda id'?: string;
  conviction?: string;
  'track id'?: string;
  delegatee?: string;
}

interface Props {
  historyItem: TransactionDetail;
}

function HistoryStatus({ success }: { success: boolean }) {
  const { t } = useTranslation();

  return (
    <Stack sx={{ mt: '-12px' }}>
      <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', width: 'fit-content' }}>
        {success
          ? <TickCircle color='#82FFA5' size='40' />
          : <CloseCircle color='#FF4FB9' size='40' />
        }
      </Grid>
      <Typography color='#AA83DC' pt='8px' variant='B-2'>
        {success
          ? t('Completed')
          : t('Failed')
        }
      </Typography>
    </Stack>
  );
}

function HistoryAmount({ amount, decimal, genesisHash, sign, token }: { amount: string, decimal: number, sign?: string, token?: string, genesisHash: string }) {
  const price = useTokenPriceBySymbol(token, genesisHash);

  const totalBalancePrice = useMemo(() => calcPrice(price.price, amountToMachine(amount, decimal) ?? BN_ZERO, decimal ?? 0), [amount, decimal, price.price]);

  const [integerPart, decimalPart] = amount.split('.');

  // const [integerPart, decimalPart] = useMemo(() => {
  //   const humanizedAmount = amountToHuman(amount, decimal);

  //   const [integerPart, decimalPart] = humanizedAmount.split('.');

  //   return [integerPart, decimalPart];
  // }, [amount, decimal]);

  return (
    <Stack>
      <Stack direction='row'>
        <Typography color='text.primary' variant='H-1'>
          {sign}{integerPart}
        </Typography>
        <Typography color='text.secondary' variant='H-3'>
          {'.'}{decimalPart}{` ${token}`}
        </Typography>
      </Stack>
      <FormatPrice
        commify
        fontFamily='Inter'
        fontSize='12px'
        fontWeight={500}
        ignoreHide
        num={totalBalancePrice ?? 0}
        skeletonHeight={14}
        textColor={'#BEAAD8'}
        width='fit-content'
      />
    </Stack>
  );
}

function DetailHeader({ historyItem }: Props) {
  return (
    <GlowBox>
      <HistoryStatus success={historyItem.success} />
      <HistoryAmount
        amount={historyItem.amount ?? '0'}
        decimal={historyItem.decimal ?? 0}
        genesisHash={historyItem.chain?.genesisHash ?? ''}
        sign=''
        token={historyItem.token ?? ''}
      />
    </GlowBox>
  );
}

function DetailCard ({ historyItem }: Props) {
  const items = useMemo(() => {

  }, []);

  return (
    <VelvetBox>
      <></>
    </VelvetBox>
  );
}

function HistoryDetail({ historyItem }: Props): React.ReactElement {
  return (
    <>
      <DetailHeader historyItem={historyItem} />
    </>
  );
}

export default HistoryDetail;
