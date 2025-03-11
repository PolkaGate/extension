// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail } from '../../../util/types';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { ArrowSwapHorizontal, CloseCircle, Data, Dislike, Like1, LikeDislike, Login, Logout, MedalStar, Money, Polkadot, Sagittarius, ShoppingBag, Strongbox, Strongbox2, TickCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { FormatBalance2, FormatPrice, ScrollingTextBox } from '../../../components';
import { isAye } from '../../../fullscreen/governance/post/myVote/util';
import { useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import GradientDivider from '../../../style/GradientDivider';
import { amountToMachine } from '../../../util/utils';
import HistoryDetail from './HistoryDetail';

interface HistoryItemProps {
  historyDate: string;
  historyItems: TransactionDetail[];
  short: boolean;
}

type ActionType = 'send' | 'receive' | 'solo staking' | 'pool staking' | 'reward' | 'aye' | 'nay' | 'abstain' | 'delegate' | 'utility' | 'balances' | 'governance' | 'proxy';
const actionTypes: ActionType[] = ['send', 'receive', 'solo staking', 'pool staking', 'reward', 'aye', 'nay', 'abstain', 'delegate', 'utility', 'balances', 'governance', 'proxy'];
const isActionType = (value: string): value is ActionType => actionTypes.includes(value as ActionType);

const HistoryIcon = ({ action }: { action: string }) => {
  const normalizedAction = action.toLowerCase() as ActionType;

  const DEFAULT_ICON = <Polkadot color='#AA83DC' size='26' />;

  const actionIcons: Record<ActionType, React.JSX.Element> = {
    abstain: <LikeDislike color='#AA83DC' size='26' variant='Bold' />,
    aye: <Like1 color='#82FFA5' size='22' variant='Bold' />,
    balances: <ArrowSwapHorizontal color='#AA83DC' size='26' />,
    delegate: <Sagittarius color='#AA83DC' size='26' variant='Bulk' />,
    governance: <MedalStar color='#AA83DC' size='22' />,
    nay: <Dislike color='#FF165C' size='22' variant='Bold' />,
    'pool staking': <Strongbox2 color='#AA83DC' size='26' />,
    proxy: <Data color='#AA83DC' size='22' />,
    receive: <Login color='#82FFA5' size='22' variant='Bold' />,
    reward: <Money color='#82FFA5' size='22' />,
    send: <Logout color='#AA83DC' size='22' />,
    'solo staking': <Strongbox color='#AA83DC' size='26' />,
    utility: <ShoppingBag color='#AA83DC' size='26' />
  };

  return actionIcons[normalizedAction] || DEFAULT_ICON;
};

const historyIconBgColor = (action: string) => {
  const normalizedAction = action.toLowerCase() as ActionType;

  const actionColors: Record<ActionType, string> = {
    abstain: '#6743944D',
    aye: '#6743944D',
    balances: '#6743944D',
    delegate: '#6743944D',
    governance: '#6743944D',
    nay: '#6743944D',
    'pool staking': '#6743944D',
    proxy: '#6743944D',
    receive: '#82FFA540',
    reward: '#82FFA540',
    send: 'transparent',
    'solo staking': '#6743944D',
    utility: '#6743944D'
  } as const;

  return actionColors[normalizedAction] || '#6743944D';
};

export const isReward = (historyItem: TransactionDetail) => ['withdraw rewards', 'claim payout'].includes(historyItem.subAction?.toLowerCase() ?? '');

export const getVoteType = (voteType: number | null | undefined) => {
  if (voteType === undefined) {
    return undefined;
  } else if (voteType === null) {
    return 'abstain';
  } else if (isAye(voteType as unknown as string)) {
    return 'aye';
  } else if (!isAye(voteType as unknown as string)) {
    return 'nay';
  }

  return undefined;
};

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
          let action = isReward(historyItem)
            ? 'reward'
            : getVoteType(historyItem.voteType) ?? historyItem.subAction ?? '';

          if (!isActionType(action)) {
            action = historyItem.action;
          }

          const iconBgColor = historyIconBgColor(action);
          const noDivider = historyItems.length === index + 1;

          return (
            <>
              <Grid alignItems='center' container item justifyContent='space-between' key={index} onClick={openDetail(historyItem)} sx={{ ':hover': { background: '#1B133C', px: '8px' }, borderRadius: '12px', columnGap: '8px', cursor: 'pointer', py: '4px', transition: 'all 250ms ease-out' }}>
                <Grid alignItems='center' container item justifyContent='center' sx={{ background: iconBgColor, border: '2px solid', borderColor: '#2D1E4A', borderRadius: '999px', height: '36px', width: '36px' }}>
                  <HistoryIcon action={action} />
                </Grid>
                <Grid container item justifyContent='space-between' xs>
                  <ActionSubAction
                    historyItem={historyItem}
                  />
                  <Grid alignItems='flex-end' container direction='column' item width='fit-content'>
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
                    <HistoryStatusAmount historyItem={historyItem} short={short} />
                  </Grid>
                </Grid>
              </Grid>
              {!noDivider && <GradientDivider style={{ my: '4px' }} />}
            </>
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
