// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../util/types';

import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { ArrowRight2, CloseCircle, TickCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import HistoryDetail from '@polkadot/extension-polkagate/src/popup/history/newDesign/HistoryDetail';
import { BN_ZERO } from '@polkadot/util';

import { CryptoFiatBalance, Identity2, ScrollingTextBox } from '../../components';
import { useTokenPriceBySymbol, useTranslation } from '../../hooks';
import { amountToMachine, calcPrice, historyIconBgColor, resolveActionType } from '../../util';
import { COLUMN_WIDTH } from './consts';
import HistoryIcon from './HistoryIcon';

interface HistoryItemProps {
  historyItem: TransactionDetail;
}

const TimeOfTX = ({ date, style = {} }: { date: number, style: React.CSSProperties }) => {
  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp);

    const datePart = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date); // => "22/04/2025"

    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: true,
      minute: '2-digit'
    }).format(date); // => "8:44 AM"

    return `${datePart.replace(/\//g, '.')}, ${timePart}`;
  }, []);

  return (
    <Typography color='#BEAAD8' sx={{ textAlign: 'left', ...style }} variant='B-2'>
      {formatTimestamp(date)}
    </Typography>
  );
};

const HistoryStatus = memo(function HistoryStatus ({ historyItem }: { historyItem: TransactionDetail }) {
  const { t } = useTranslation();
  const success = historyItem.success;

  return (
    <Grid alignItems='center' columnGap='4px' container item justifyContent='center' sx={{ bgcolor: !success ? '#FF4FB926' : '#82FFA526', borderRadius: '9px', p: '2px 5px' }} width='fit-content'>
      {success
        ? <TickCircle color='#82FFA5' size='14' variant='Bold' />
        : <CloseCircle color='#FF4FB9' size='14' variant='Bold' />
      }
      <Typography color={success ? '#82FFA5' : '#FF4FB9'} variant='B-2'>
        {success ? t('Completed') : t('Failed')}
      </Typography>
    </Grid>

  );
});

function HistoryItem ({ historyItem }: HistoryItemProps) {
  const theme = useTheme();

  const [historyItemDetail, setHistoryItemDetail] = useState<TransactionDetail>();

  const openDetail = useCallback((item: TransactionDetail) => () => {
    setHistoryItemDetail(item);
  }, []);

  const { action: hAction, amount, chain, date, decimal = 0, from, subAction, to, token } = historyItem;
  const action = resolveActionType(historyItem);
  const price = useTokenPriceBySymbol(token ?? '', chain?.genesisHash ?? '');
  const fiatBalance = useMemo(() => calcPrice(price.price, amountToMachine(amount, decimal) ?? BN_ZERO, decimal), [amount, decimal, price.price]);

  const iconBgColor = historyIconBgColor(action);
  const isTransfer = hAction.toLowerCase() === 'balances';
  const isSend = subAction?.toLowerCase() === 'send';

  return (
    <>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ background: '#05091C', borderRadius: '14px', display: 'flex', height: '50px', p: '0 7px 0 10px' }}>
        <Grid alignItems='center' columnGap='30px' container item justifyContent='start' onClick={openDetail(historyItem)} sx={{ ':hover': { background: '#1B133C', my: '1px', p: '5px 8px' }, borderRadius: '12px 0 0 12px', cursor: 'pointer', transition: 'all 250ms ease-out' }}>
          <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'start', mx: '5px' }} width={COLUMN_WIDTH.ACTION}>
            <Grid alignItems='center' container item justifyContent='center' sx={{ background: iconBgColor, border: '2px solid', borderColor: '#2D1E4A', borderRadius: '999px', height: '24px', width: '24px' }}>
              <HistoryIcon action={action} />
            </Grid>
            <ScrollingTextBox
              text={subAction ?? ''}
              textStyle={{
                color: 'text.primary',
                ml: '5px',
                textTransform: 'capitalize',
                ...theme.typography['B-2']
              }}
              width={parseInt(COLUMN_WIDTH.ACTION) - 24}
            />
          </Stack>
          <Grid alignItems='center' columnGap='4px' container item width={COLUMN_WIDTH.SUB_ACTION}>
            {isTransfer
              ? <Stack alignItems='center' direction='row' sx={{ columnGap: '5px', justifyContent: 'start' }} width='fit-content'>
                <Identity2
                  address={isSend ? to?.address ?? '' : from.address}
                  addressStyle={{ backgroundColor: '#C6AECC26', borderRadius: '9px', marginTop: '-3%', padding: '2px 3px' }}
                  charsCount={4}
                  direction='row'
                  genesisHash={chain?.genesisHash ?? POLKADOT_GENESIS}
                  identiconSize={24}
                  nameStyle={{ py: '2px' }}
                  showSocial={false}
                  style={{ color: '#BEAAD8', maxWidth: 'inherit', overflow: 'auto', variant: 'B-2' }}
                  withShortAddress={true}
                />
              </Stack>
              : (<Typography color='#BEAAD8' textTransform='capitalize' variant='B-2'>
                {hAction}
              </Typography>)
            }
          </Grid>
          <CryptoFiatBalance
            cryptoBalance={amountToMachine(amount, decimal)}
            cryptoProps={{ style: { color: '#AA83DC', fontSize: '11px' } }}
            decimal={decimal}
            fiatBalance={fiatBalance}
            fiatProps={{ decimalColor: theme.palette.text.primary }}
            style={{
              alignItems: 'end',
              rowGap: 0,
              textAlign: 'right',
              width: COLUMN_WIDTH.AMOUNT
            }}
            token={token}
          />
          <TimeOfTX date={date} style={{ paddingLeft: '15px', width: COLUMN_WIDTH.DATE }} />
          <HistoryStatus historyItem={historyItem} />
        </Grid>
        <Box onClick={openDetail(historyItem)} sx={{ alignItems: 'center', bgcolor: '#2D1E4A', borderRadius: '8px', cursor: 'pointer', display: 'flex', height: '36px', justifyContent: 'center', width: '34px' }}>
          <ArrowRight2 color='#AA83DC' size='16px' variant='Bold' />
        </Box>
      </Stack>
      <HistoryDetail
        historyItem={historyItemDetail}
        setOpenMenu={setHistoryItemDetail}
      />
    </>
  );
}

export default memo(HistoryItem);
