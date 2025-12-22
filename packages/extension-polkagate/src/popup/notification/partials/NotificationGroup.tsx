// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationMessageInformation } from '../types';

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import * as Icons from 'iconsax-react';
import React, { Fragment } from 'react';

import { GradientDivider, ScrollingTextBox, TwoToneText } from '@polkadot/extension-polkagate/src/components';
import { useAccount, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { toShortAddress } from '@polkadot/extension-polkagate/src/util';

import { isToday } from '../util';

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

function TitleTime ({ address, noName, read, time, title }: { address: string | undefined; read: boolean; time: string; title: string; noName: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);

  return (
    <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Grid container item sx={{ alignItems: 'center', gap: '6px', width: 'fit-content' }}>
        <Typography color={theme.palette.text.primary} variant='B-2'>
          {title}
        </Typography>
        {!noName &&
          <ScrollingTextBox
            scrollOnHover
            style={{ bgcolor: '#AA83DC26', px: '4px' }}
            text={account?.name ?? toShortAddress(address) ?? t('Unknown')}
            textStyle={{ color: '#AA83DC', ...theme.typography['B-1'] }}
            width={75}
          />}
        {!read && <Grid sx={{ bgcolor: theme.palette.menuIcon.hover, borderRadius: '999px', height: '8px', width: '8px' }} />}
      </Grid>
      <Typography color='#674394' variant='B-1'>
        {time}
      </Typography>
    </Stack>
  );
}

function NotificationItem ({ item }: { item: NotificationMessageInformation; }) {
  const theme = useTheme();

  const title = item.message.detail.title;
  const time = item.message.detail.time;
  const forAccount = item.message.info.forAccount;
  const messageType = item.message.info.type;
  const { text, textInColor } = item.message.detail.description;
  const { bgcolor, borderColor, color, itemIcon } = item.message.detail.iconInfo;

  const ItemIcon = Icons[itemIcon as keyof typeof Icons];

  return (
    <Stack direction='row' sx={{ alignItems: 'center', gap: '6px', width: '100%' }}>
      <ItemIcon color={color} style={{ backgroundColor: bgcolor, border: '2px solid', borderColor, borderRadius: '999px', height: '32px', padding: '3px', width: '32px' }} variant='Bold' />
      <Stack direction='column' sx={{ width: 'calc(100% - 32px - 6px)' }}>
        <TitleTime
          address={forAccount}
          noName={messageType === 'referenda'}
          read={item.read}
          time={time}
          title={title}
        />
        <TwoToneText
          color={theme.palette.text.primary}
          style={{ color: theme.palette.text.secondary, width: 'fit-content', ...theme.typography['B-4'], textAlign: 'left' }}
          text={text}
          textPartInColor={textInColor}
        />
      </Stack>
    </Stack>
  );
}

function NotificationGroup ({ group: [dateKey, items] }: { group: [string, NotificationMessageInformation[]]; }) {
  return (
    <Stack direction='column' sx={{ bgcolor: '#05091C', borderRadius: '14px', gap: '8px', p: '10px', width: '100%' }}>
      <ItemDate date={dateKey} />
      {items.map((item, index) => (
        <Fragment key={item.message.detail.itemKey}>
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
