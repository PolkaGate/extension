// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import HistoryIcon from '@polkadot/extension-polkagate/src/fullscreen/history/HistoryIcon';
import { historyIconBgColor, isReward, resolveActionType } from '@polkadot/extension-polkagate/src/util/index';
import { BN_ZERO } from '@polkadot/util';

import { DisplayBalance, FormatPrice, ScrollingTextBox } from '../../../components';
import { useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import GradientDivider from '../../../style/GradientDivider';
import { amountToMachine, calcPrice } from '../../../util';
import HistoryDetail from './HistoryDetail';

interface HistoryItemProps {
  historyDate: string;
  historyItems: TransactionDetail[];
  short: boolean;
}

const TimeOfTheDay = ({ date }: { date: number }) => {
  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp);

    return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true, minute: '2-digit' });
  }, []);

  return (
    <Typography color='#674394' variant='B-5'>
      {formatTimestamp(date)}
    </Typography>
  );
};

const ActionSubAction = memo(function SubAction ({ historyItem }: { historyItem: TransactionDetail; }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return useMemo(() => {
    const isTransfer = historyItem.action.toLowerCase() === 'balances';
    const isSend = historyItem.subAction?.toLowerCase() === 'send';

    return (
      <Grid alignItems='flex-start' container direction='column' item width='fit-content'>
        <Typography color='text.primary' textTransform='capitalize' variant='B-2'>
          {historyItem.subAction}
        </Typography>
        <Grid alignItems='center' columnGap='4px' container item width='fit-content'>
          {isTransfer
            ? (<>
              <Typography color='text.secondary' variant='B-4'>
                {isSend ? t('To') : t('From')}:
              </Typography>
              <ScrollingTextBox
                scrollOnHover
                style={{ lineHeight: '18px' }}
                text={isSend
                  ? (historyItem.to?.name || historyItem.to?.address) ?? ''
                  : (historyItem.from.name || historyItem.from.address) ?? ''
                }
                textStyle={{
                  color: '#AA83DC',
                  ...theme.typography['B-4']
                }}
                width={75}
              />
            </>)
            : (<Typography color='text.secondary' textTransform='capitalize' variant='B-5'>
              {historyItem.action}
            </Typography>)
          }
          <TimeOfTheDay date={historyItem.date} />
        </Grid>
      </Grid>
    );
  }, [historyItem.action, historyItem.date, historyItem.from.address, historyItem.from.name, historyItem.subAction, historyItem.to, t, theme.typography]);
});

const HistoryStatusAmount = memo(function HistoryStatusAmount ({ historyItem, short }: { historyItem: TransactionDetail, short: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const price = useTokenPriceBySymbol(historyItem.token ?? '', historyItem.chain?.genesisHash ?? '');

  const totalBalancePrice = useMemo(() => calcPrice(price.price, amountToMachine(historyItem.amount, historyItem.decimal ?? 0) ?? BN_ZERO, historyItem.decimal ?? 0), [historyItem.amount, historyItem.decimal, price.price]);

  const success = historyItem.success;
  const isTransfer = historyItem.action.toLowerCase() === 'balances';
  const isSend = historyItem.subAction?.toLowerCase() === 'send';
  const reward = isReward(historyItem);
  const isReceivedOrReward = reward || (isTransfer && !isSend);

  return (
    <>
      {short
        ? <Grid alignItems='center' columnGap='4px' container item justifyContent='center' width='fit-content'>
          {!success
            ? <>
              <CloseCircle color='#FF8A65' size='18' variant='Bold' />
              <Typography color='#FF4FB9' variant='B-4'>
                {t('Failed')}
              </Typography>
            </>
            : <Grid alignItems='center' container item sx={{ columnGap: '4px', display: 'flex', flexDirection: 'row', width: 'fit-content' }}>
              <Typography color={isReceivedOrReward ? '#82FFA5' : theme.palette.text.primary} variant='B-2'>
                {isReceivedOrReward ? '+' : isSend ? '-' : ''}
              </Typography>
              <FormatPrice
                commify
                decimalColor={isReceivedOrReward ? '#82FFA580' : theme.palette.text.secondary}
                dotStyle='small'
                fontFamily='Inter'
                fontSize='14px'
                fontWeight={600}
                num={totalBalancePrice}
                textColor={isReceivedOrReward ? '#82FFA5' : theme.palette.text.secondary}
                width='fit-content'
                withSmallDecimal
              />
            </Grid>
          }
        </Grid>
        : <Grid alignItems='center' columnGap='4px' container item justifyContent='center' width='fit-content'>
          {success
            ? <TickCircle color='#82FFA5' size='15' variant='Bold' />
            : <CloseCircle color='#FF8A65' size='15' variant='Bold' />
          }
          <Typography color={success ? '#82FFA5' : '#FF4FB9'} variant='B-4'>
            {success ? t('Completed') : t('Failed')}
          </Typography>
        </Grid>
      }
    </>
  );
});

function HistoryItem ({ historyDate, historyItems, short }: HistoryItemProps) {
  const theme = useTheme();

  const [historyItemDetail, setHistoryItemDetail] = useState<TransactionDetail>();

  const openDetail = useCallback((item: TransactionDetail) => () => {
    setHistoryItemDetail(item);
  }, []);

  return (
    <>
      <Container disableGutters sx={{ background: '#05091C', borderRadius: '14px', display: 'grid', p: '10px' }}>
        <Typography color='text.secondary' sx={{ background: '#C6AECC26', borderRadius: '10px', mb: '4px', p: '2px 4px', width: 'fit-content' }} variant='B-2'>
          {historyDate}
        </Typography>
        {historyItems.map((historyItem, index) => {
          const action = resolveActionType(historyItem);
          const iconBgColor = historyIconBgColor(action);
          const noDivider = historyItems.length === index + 1;

          return (
            <React.Fragment key={index}>
              <Grid alignItems='center' container item justifyContent='space-between' key={index} onClick={openDetail(historyItem)} sx={{ ':hover': { background: '#1B133C', px: '8px' }, borderRadius: '12px', columnGap: '8px', cursor: 'pointer', py: '4px', transition: 'all 250ms ease-out' }}>
                <Grid alignItems='center' container item justifyContent='center' sx={{ background: iconBgColor, border: '2px solid', borderColor: '#2D1E4A', borderRadius: '999px', height: '36px', width: '36px' }}>
                  <HistoryIcon action={action} isFullscreen={false} />
                </Grid>
                <Grid container item justifyContent='space-between' xs>
                  <ActionSubAction
                    historyItem={historyItem}
                  />
                  <Grid alignItems='flex-end' container direction='column' item width='fit-content'>
                    <DisplayBalance
                      balance={amountToMachine(historyItem.amount, historyItem.decimal ?? 0)}
                      decimal={historyItem.decimal}
                      decimalPoint={2}
                      style={{
                        color: theme.palette.text.primary,
                        ...theme.typography['B-2'],
                        width: 'max-content'
                      }}
                      token={historyItem.token}
                    />
                    <HistoryStatusAmount historyItem={historyItem} short={short} />
                  </Grid>
                </Grid>
              </Grid>
              {!noDivider && <GradientDivider style={{ my: '4px' }} />}
            </React.Fragment>
          );
        })}
      </Container>
      <HistoryDetail
        historyItem={historyItemDetail}
        setOpenMenu={setHistoryItemDetail}
      />
    </>
  );
}

export default memo(HistoryItem);
