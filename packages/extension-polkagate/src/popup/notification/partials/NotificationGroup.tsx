// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationMessageType } from '../types';

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { Fragment } from 'react';

import { GradientDivider, ScrollingTextBox, TwoToneText } from '@polkadot/extension-polkagate/src/components';
import { useAccount, useChainInfo, useCurrency, useTokenPriceBySymbol, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { toShortAddress } from '@polkadot/extension-polkagate/src/util';

import { getNotificationDescription, getNotificationIcon, getNotificationItemTitle, getTimeOfDay, isToday } from '../util';

function ItemDate ({ date }: { date: string; }) {
  const theme = useTheme();
  const isTodayDate = isToday(date);

  return (
    <Typography
      color={isTodayDate ? theme.palette.menuIcon.hover : theme.palette.text.secondary}
      sx={{ bgcolor: isTodayDate ? '#FF4FB926' : '#C6AECC26', borderRadius: '9px', p: '2px 4px', width: 'fit-content' }}
      variant='B-2'
    >
      {date}
    </Typography>
  );
}

function TitleTime ({ address, read, time, title }: { address: string | undefined; read: boolean; time: string; title: string; }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);

  return (
    <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Grid container item sx={{ alignItems: 'center', gap: '6px', width: 'fit-content' }}>
        <Typography color={theme.palette.text.primary} variant='B-2'>
          {title}
        </Typography>
        <ScrollingTextBox
          scrollOnHover
          style={{ bgcolor: '#AA83DC26', px: '4px' }}
          text={account?.name ?? toShortAddress(address) ?? t('Unknown')}
          textStyle={{ color: '#AA83DC', ...theme.typography['B-1'] }}
          width={75}
        />
        {!read && <Grid sx={{ bgcolor: theme.palette.menuIcon.hover, borderRadius: '999px', height: '8px', width: '8px' }} />}
      </Grid>
      <Typography color='#674394' variant='B-1'>
        {time}
      </Typography>
    </Stack>
  );
}

function NotificationItem ({ item }: { item: NotificationMessageType; }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();

  const genesisHash = item.chain?.value as string ?? '';

  const chainInfo = useChainInfo(genesisHash, true);
  const price = useTokenPriceBySymbol(chainInfo.token, genesisHash);

  const title = getNotificationItemTitle(item.type, item.referenda);
  const time = getTimeOfDay(item.payout?.timestamp ?? item.receivedFund?.timestamp ?? Date.now()); //  ?? item.referenda?.timestamp
  const { text, textInColor } = getNotificationDescription(item, t, chainInfo, price, currency);
  const { ItemIcon, bgcolor, borderColor, color } = getNotificationIcon(item);

  return (
    <Stack direction='row' sx={{ alignItems: 'center', gap: '6px', width: '100%' }}>
      <ItemIcon color={color} style={{ backgroundColor: bgcolor, border: '2px solid', borderColor, borderRadius: '999px', height: '32px', padding: '3px', width: '32px' }} variant='Bold' />
      <Stack direction='column' sx={{ width: 'calc(100% - 32px - 6px)' }}>
        <TitleTime
          address={item.forAccount}
          read={item.read}
          time={time}
          title={title}
        />
        <TwoToneText
          color={theme.palette.text.primary}
          style={{ color: theme.palette.text.secondary, width: 'fit-content', ...theme.typography['B-4'], textAlign: 'left' }}
          text={text}
          textPartInColor={textInColor as string}
        />
      </Stack>
    </Stack>
  );
}

function NotificationGroup ({ group: [dateKey, items] }: { group: [string, NotificationMessageType[]]; }) {
  return (
    <Stack direction='column' sx={{ bgcolor: '#05091C', borderRadius: '14px', gap: '8px', p: '10px', width: '100%' }}>
      <ItemDate date={dateKey} />
      {items.map((item, index) => (
        <Fragment key={`${item.extrinsicIndex} + ${index}`}>
          <NotificationItem
            item={item}
          />
          {items.length > index + 1 &&
            <GradientDivider style={{ mx: '-10px', my: '2px' }} />
          }
        </Fragment>
      ))}
    </Stack>
  );
}

export default NotificationGroup;
