// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CurrencyItemType } from '@polkadot/extension-polkagate/fullscreen/home/partials/type';
import type { Prices, UserAddedEndpoint } from '@polkadot/extension-polkagate/util/types';
import type { NotificationMessageInformation } from '../types';

import { Grid, Stack, type Theme, Typography, useTheme } from '@mui/material';
import * as Icons from 'iconsax-react';
import React, { Fragment, useContext } from 'react';

import { CurrencyContext, GradientDivider, ScrollingTextBox, TwoToneText } from '@polkadot/extension-polkagate/src/components';
import { useUserAddedEndpoints } from '@polkadot/extension-polkagate/src/fullscreen/addNewChain/utils';
import { useAccount, usePrices, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { toShortAddress } from '@polkadot/extension-polkagate/src/util';

import { getChainInfo, getNotificationMessages, getTokenPriceBySymbol, isToday } from '../util';

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
            style={{ bgcolor: '#AA83DC26', borderRadius: '14px', px: '8px' }}
            text={account?.name ?? toShortAddress(address) ?? t('Unknown')}
            textStyle={{ color: '#AA83DC', ...theme.typography['B-1'] }}
            width={100}
          />}
        {!read && <Grid sx={{ bgcolor: theme.palette.menuIcon.hover, borderRadius: '999px', height: '8px', width: '8px' }} />}
      </Grid>
      <Typography color='#674394' variant='B-1'>
        {time}
      </Typography>
    </Stack>
  );
}

interface NotificationItemProps {
    item: NotificationMessageInformation;
    currency: CurrencyItemType | undefined
    t: (key: string) => string;
    theme: Theme;
    prices: Prices | null | undefined;
    useAddedEndpoints: Record<`0x${string}`, UserAddedEndpoint> | undefined

  }

function NotificationItem ({ currency, item, prices, t, theme, useAddedEndpoints }: NotificationItemProps) {
  const genesisHash = item.message.chain?.value as string | undefined;

  const chainInfo = getChainInfo(genesisHash);
  const tokenPrice = getTokenPriceBySymbol(chainInfo.token, chainInfo.chainName, genesisHash, prices, useAddedEndpoints);
  const { detail: { description, iconInfo, time, title }, info: { forAccount, type: messageType } } = getNotificationMessages(item.message, chainInfo, currency, tokenPrice, t);

  const { text, textInColor } = description;
  const { bgcolor, borderColor, color, itemIcon } = iconInfo;

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
  const theme = useTheme();
  const { t } = useTranslation();
  const { currency } = useContext(CurrencyContext);
  const useAddedEndpoints = useUserAddedEndpoints();
  const prices = usePrices();

  return (
    <Stack direction='column' sx={{ bgcolor: '#05091C', borderRadius: '14px', gap: '8px', p: '10px', width: '100%' }}>
      <ItemDate date={dateKey} />
      {items.map((item, index) => (
        <Fragment key={item.message.itemKey}>
          <NotificationItem
            currency={currency}
            item={item}
            prices={prices}
            t={t}
            theme={theme}
            useAddedEndpoints={useAddedEndpoints}
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
