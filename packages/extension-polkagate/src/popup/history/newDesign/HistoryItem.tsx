// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail } from '../../../util/types';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { CloseCircle, Login, Logout, Money, Polkadot, Strongbox, Strongbox2, TickCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { FormatBalance2, FormatPrice, ScrollingTextBox } from '../../../components';
import { useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import GradientDivider from '../../../style/GradientDivider';
import { amountToMachine } from '../../../util/utils';

interface HistoryItemProps {
  historyDate: string;
  historyItems: TransactionDetail[];
}

type ActionType = 'send' | 'receive' | 'solo staking' | 'pool staking' | 'reward';

const HistoryIcon = ({ action }: { action: string }) => {
  const normalizedAction = action.toLowerCase() as ActionType;

  const DEFAULT_ICON = <Polkadot color='#AA83DC' size='26' />;

  const actionIcons: Record<ActionType, React.JSX.Element> = {
    'pool staking': <Strongbox2 color='#AA83DC' size='26' />,
    receive: <Login color='#82FFA5' size='22' variant='Bold' />,
    reward: <Money color='#82FFA5' size='22' />,
    send: <Logout color='#AA83DC' size='22' />,
    'solo staking': <Strongbox color='#AA83DC' size='26' />
  };

  return actionIcons[normalizedAction] || DEFAULT_ICON;
};

const historyIconBgColor = (action: string) => {
  const normalizedAction = action.toLowerCase() as ActionType;

  const actionColors: Record<ActionType, string> = {
    'pool staking': '#6743944D',
    receive: '#82FFA540',
    reward: '#82FFA540',
    send: 'transparent',
    'solo staking': '#6743944D'
  } as const;

  return actionColors[normalizedAction] || '#6743944D';
};

const isReward = (historyItem: TransactionDetail) => ['withdraw rewards'].includes(historyItem.subAction?.toLowerCase() ?? '');

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

  if (historyItem.subAction) { // not a send or received TX
    return (
      <Grid alignItems='flex-start' container direction='column' item width='fit-content'>
        <Typography color='text.primary' textTransform='capitalize' variant='B-2'>
          {historyItem.subAction}
        </Typography>
        <Grid alignItems='center' columnGap='4px' container item width='fit-content'>
          <Typography color='text.secondary' textTransform='capitalize' variant='B-5'>
            {historyItem.action}
          </Typography>
          <TimeOfTheDay date={historyItem.date} />
        </Grid>
      </Grid>
    );
  } else { // send or receive
    const isSend = historyItem.action.toLowerCase() === 'send';

    return (
      <Grid alignItems='flex-start' container direction='column' item width='fit-content'>
        <Typography color='text.primary' textTransform='capitalize' variant='B-2'>
          {historyItem.action}
        </Typography>
        <Grid alignItems='center' columnGap='4px' container item width='fit-content'>
          <Typography color='text.secondary' variant='B-4'>
            {isSend ? t('To') : t('From')}:
          </Typography>
          <ScrollingTextBox
            scrollOnHover
            style={{ lineHeight: '18px' }}
            text={isSend
              ? (historyItem.to?.name ?? historyItem.to?.address) ?? ''
              : (historyItem.from.name ?? historyItem.from.address) ?? ''
            }
            textStyle={{
              color: '#AA83DC',
              ...theme.typography['B-4']
            }}
            width={75}
          />
          <TimeOfTheDay date={historyItem.date} />
        </Grid>
      </Grid>
    );
  }
});

const HistoryStatusAmount = memo(function HistoryStatusAmount ({ historyItem }: { historyItem: TransactionDetail }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const price = useTokenPriceBySymbol(historyItem.token ?? '', historyItem.chain?.genesisHash ?? '');

  const short = window.location.hash.includes('token');

  const totalBalancePrice = useMemo(() => calcPrice(price.price, amountToMachine(historyItem.amount, historyItem.decimal ?? 0) ?? BN_ZERO, historyItem.decimal ?? 0), [historyItem.amount, historyItem.decimal, price.price]);

  const success = historyItem.success;
  const isReceivedOrReward = (!historyItem.subAction && historyItem.action.toLowerCase() !== 'send') || isReward(historyItem);
  const isSend = historyItem.action.toLowerCase() === 'send';

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
                textColor={isReceivedOrReward ? '#82FFA5' : theme.palette.text.primary}
                width='fit-content'
                withSmallDecimal
              />
            </Grid>
          }
        </Grid>
        : <Grid alignItems='center' columnGap='4px' container item justifyContent='center' width='fit-content'>
          {success
            ? <TickCircle color='#FF8A65' size='18' variant='Bold' />
            : <CloseCircle color='#FF8A65' size='18' variant='Bold' />
          }
          <Typography color={success ? '#82FFA5' : '#FF4FB9'} variant='B-4'>
            {success ? t('Completed') : t('Failed')}
          </Typography>
        </Grid>
      }
    </>
  );
});

function HistoryItem ({ historyDate, historyItems }: HistoryItemProps) {
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ background: '#05091C', borderRadius: '14px', display: 'grid', p: '10px' }}>
      <Typography color='text.secondary' sx={{ background: '#C6AECC26', borderRadius: '10px', mb: '4px', p: '2px 4px', width: 'fit-content' }} variant='B-2'>
        {historyDate}
      </Typography>
      {historyItems.map((historyItem, index) => {
        const action = isReward(historyItem) ? 'reward' : historyItem.action;
        const iconBgColor = historyIconBgColor(action);
        const noDivider = historyItems.length === index + 1;

        return (
          <>
            <Grid alignItems='center' container item justifyContent='space-between' key={index} sx={{ ':hover': { background: '#1B133C', px: '8px' }, borderRadius: '12px', columnGap: '8px', cursor: 'pointer', py: '4px', transition: 'all 250ms ease-out' }}>
              <Grid alignItems='center' container item justifyContent='center' sx={{ background: iconBgColor, border: '2px solid', borderColor: '#2D1E4A', borderRadius: '999px', height: '36px', width: '36px' }}>
                <HistoryIcon action={action} />
              </Grid>
              <Grid container item justifyContent='space-between' xs>
                <ActionSubAction
                  historyItem={historyItem}
                />
                <Grid container direction='column' item width='fit-content'>
                  <FormatBalance2
                    decimalPoint={2}
                    decimals={[historyItem.decimal ?? 0]}
                    style={{
                      color: theme.palette.text.primary,
                      ...theme.typography['B-2'],
                      width: 'max-content'
                    }}
                    tokens={[historyItem.token ?? '']}
                    value={amountToMachine(historyItem.amount, historyItem.decimal ?? 0)}
                  />
                  <HistoryStatusAmount historyItem={historyItem} />
                </Grid>
              </Grid>
            </Grid>
            {!noDivider && <GradientDivider style={{ my: '4px' }} />}
          </>
        );
      })}
    </Container>
  );
}

export default memo(HistoryItem);
