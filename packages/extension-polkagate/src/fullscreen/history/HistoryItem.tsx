// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../util/types';

import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleRight2, ArrowRight2, ArrowSwapHorizontal, CloseCircle, Data, Dislike, Like1, LikeDislike, MedalStar, Money, Polkadot, Sagittarius, ShoppingBag, Strongbox, Strongbox2, TickCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import { calcPrice } from '@polkadot/extension-polkagate/src/hooks/useYouHave2';
import { BN_ZERO } from '@polkadot/util';

import { ScrollingTextBox } from '../../components';
import { isAye } from '../../fullscreen/governance/post/myVote/util';
import { useTokenPriceBySymbol, useTranslation } from '../../hooks';
import { amountToMachine } from '../../util/utils';
import { COLUMN_WIDTH } from './consts';
import CryptoFiatBalance from './CryptoFiatBalance';
import HistoryDetail from './HistoryDetail';

interface HistoryItemProps {
  historyItem: TransactionDetail;
  short: boolean;
}

type ActionType = 'send' | 'receive' | 'solo staking' | 'pool staking' | 'reward' | 'aye' | 'nay' | 'abstain' | 'delegate' | 'utility' | 'balances' | 'governance' | 'proxy';
const actionTypes: ActionType[] = ['send', 'receive', 'solo staking', 'pool staking', 'reward', 'aye', 'nay', 'abstain', 'delegate', 'utility', 'balances', 'governance', 'proxy'];
const isActionType = (value: string): value is ActionType => actionTypes.includes(value as ActionType);

const HistoryIcon = ({ action }: { action: string }) => {
  const normalizedAction = action.toLowerCase() as ActionType;

  const DEFAULT_ICON = <Polkadot color='#AA83DC' size='20' />;

  const actionIcons: Record<ActionType, React.JSX.Element> = {
    abstain: <LikeDislike color='#AA83DC' size='20' variant='Bold' />,
    aye: <Like1 color='#82FFA5' size='15' variant='Bold' />,
    balances: <ArrowSwapHorizontal color='#AA83DC' size='20' />,
    delegate: <Sagittarius color='#AA83DC' size='20' variant='Bulk' />,
    governance: <MedalStar color='#AA83DC' size='16' />,
    nay: <Dislike color='#FF165C' size='15' variant='Bold' />,
    'pool staking': <Strongbox2 color='#AA83DC' size='20' />,
    proxy: <Data color='#AA83DC' size='14' />,
    receive: <ArrowCircleDown2 color='#82FFA5' size='16' variant='Linear' />,
    reward: <Money color='#82FFA5' size='16' />,
    send: <ArrowCircleRight2 color='#AA83DC' size='16' />,
    'solo staking': <Strongbox color='#AA83DC' size='20' />,
    utility: <ShoppingBag color='#AA83DC' size='16' />
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
    proxy: 'transparent',
    receive: '#82FFA540',
    reward: '#82FFA540',
    send: 'transparent',
    'solo staking': '#6743944D',
    utility: 'transparent'
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
      minute: '2-digit',
      hour12: true
    }).format(date); // => "8:44 AM"

    return `${datePart.replace(/\//g, '.')}, ${timePart}`;
  }, []);

  return (
    <Typography color='#BEAAD8' sx={{ textAlign: 'left', ...style }} variant='B-2'>
      {formatTimestamp(date)}
    </Typography>
  );
};

const HistoryStatusAmount = memo(function HistoryStatusAmount({ historyItem }: { historyItem: TransactionDetail }) {
  const { t } = useTranslation();
  const success = historyItem.success;

  return (
    <Grid alignItems='center' columnGap='4px' container item justifyContent='center' sx={{ bgcolor: !success ? '#FF4FB926' : '#82FFA526', borderRadius: '9px', px: '5px' }} width='fit-content'>
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

function HistoryItem({ historyItem }: HistoryItemProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const [historyItemDetail, setHistoryItemDetail] = useState<TransactionDetail>();

  const openDetail = useCallback((item: TransactionDetail) => () => {
    setHistoryItemDetail(item);
  }, []);

  let action = isReward(historyItem)
    ? 'reward'
    : getVoteType(historyItem.voteType) ?? historyItem.subAction ?? '';

  if (!isActionType(action)) {
    action = historyItem.action;
  }

  const price = useTokenPriceBySymbol(historyItem.token ?? '', historyItem.chain?.genesisHash ?? '');
  const fiatBalance = useMemo(() => calcPrice(price.price, amountToMachine(historyItem.amount, historyItem.decimal ?? 0) ?? BN_ZERO, historyItem.decimal ?? 0), [historyItem.amount, historyItem.decimal, price.price]);

  const iconBgColor = historyIconBgColor(action);
  const isTransfer = historyItem.action.toLowerCase() === 'balances';
  const isSend = historyItem.subAction?.toLowerCase() === 'send';

  return (
    <>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ background: '#05091C', borderRadius: '14px', display: 'flex', height: '48px', p: '0 5px 0 10px' }}>
        <Grid alignItems='center' columnGap='30px' container item justifyContent='start' onClick={openDetail(historyItem)} sx={{ ':hover': { background: '#1B133C', my: '1px', px: '8px' }, borderRadius: '12px', cursor: 'pointer', transition: 'all 250ms ease-out' }}>
          <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'start', mx: '5px' }} width={COLUMN_WIDTH.ACTION}>
            <Grid alignItems='center' container item justifyContent='center' sx={{ background: iconBgColor, border: '2px solid', borderColor: '#2D1E4A', borderRadius: '999px', height: '24px', width: '24px' }}>
              <HistoryIcon action={action} />
            </Grid>
            <Typography color='text.primary' sx={{ ml: '5px', textTransform: 'capitalize' }} variant='B-2'>
              {historyItem.subAction}
            </Typography>
          </Stack>
          <Grid alignItems='center' columnGap='4px' container item width={COLUMN_WIDTH.SUB_ACTION}>
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
          </Grid>
          <CryptoFiatBalance
            cryptoBalance={amountToMachine(historyItem.amount, historyItem.decimal ?? 0)}
            cryptoProps={{ style: { color: '#AA83DC', fontSize: '11px' } }}
            decimal={historyItem.decimal}
            fiatBalance={fiatBalance}
            fiatProps={{ decimalColor: theme.palette.text.primary }}
            style={{
              alignItems: 'end',
              textAlign: 'right',
              width: COLUMN_WIDTH.AMOUNT
            }}
            token={historyItem.token}
          />
          <TimeOfTX date={historyItem.date} style={{paddingLeft: '15px', width: COLUMN_WIDTH.DATE }} />
          <HistoryStatusAmount historyItem={historyItem} />
        </Grid>
        <Box sx={{ alignItems: 'center', bgcolor: '#2D1E4A', borderRadius: '8px', display: 'flex', height: '36px', justifyContent: 'center', width: '34px' }}>
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
