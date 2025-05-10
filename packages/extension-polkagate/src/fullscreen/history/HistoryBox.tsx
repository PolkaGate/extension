// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '@polkadot/extension-polkagate/src/util/types';

import { Box, Container, Stack, Typography } from '@mui/material';
import React, { memo, useRef } from 'react';

import AssetLoading from '@polkadot/extension-polkagate/src/popup/home/partial/AssetLoading';

import { emptyHistoryList } from '../../assets/icons/index';
import { useTranslation } from '../../hooks';
import { COLUMN_WIDTH } from './consts';
import HistoryItem from './HistoryItem';

function EmptyHistoryBox() {
  const { t } = useTranslation();

  return (
    <>
      <Box
        component='img'
        src={emptyHistoryList as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '125px' }}
      />
      <Typography color='text.secondary' mb='30px' variant='B-2'>
        {t('No transaction history is available yet')}
      </Typography>
    </>
  );
}

interface Props {
  historyItems: TransactionDetail[] | null | undefined;
  notReady?: boolean;
}

function HistoryBox({ historyItems, notReady = false }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);

  const short = window.location.hash.includes('token');

  // const formatDate = useCallback((inputDate: string) => {
  //   // Handle invalid dates
  //   const date = new Date(inputDate);

  //   if (isNaN(date.getTime())) {
  //     return inputDate;
  //   }

  //   const today = new Date();
  //   const yesterday = new Date(today);

  //   yesterday.setDate(today.getDate() - 1);

  //   // Reset time components for accurate comparison
  //   const resetTime = (date: Date) => {
  //     date.setHours(0, 0, 0, 0);

  //     return date;
  //   };

  //   const compareDate = resetTime(new Date(date));
  //   const compareToday = resetTime(new Date(today));
  //   const compareYesterday = resetTime(new Date(yesterday));

  //   if (compareDate.getTime() === compareToday.getTime()) {
  //     return 'Today';
  //   }

  //   if (compareDate.getTime() === compareYesterday.getTime()) {
  //     return 'Yesterday';
  //   }

  //   return inputDate;
  // }, []);

  return (
    <>
      <Stack columnGap='30px' direction='row' sx={{ height: '40px', padding: '10px 15px', width: '100%' }}>
        <Typography color='#BEAAD8' sx={{ textAlign: 'left', width: COLUMN_WIDTH.ACTION }} variant='B-1'>
          {t('Type')}
        </Typography>
        <Typography color='#BEAAD8' sx={{ textAlign: 'left', width: COLUMN_WIDTH.SUB_ACTION }} variant='B-1'>
          {t('Info')}
        </Typography>
        <Typography color='#BEAAD8' sx={{ textAlign: 'right', width: COLUMN_WIDTH.AMOUNT }} variant='B-1'>
          {t('Amount')}
        </Typography>
        <Typography color='#BEAAD8' sx={{ paddingLeft: '15px', textAlign: 'left', width: COLUMN_WIDTH.DATE }} variant='B-1'>
          {t('Date')}
        </Typography>
        <Typography color='#BEAAD8' sx={{ textAlign: 'left', width: COLUMN_WIDTH.STATUS }} variant='B-1'>
          {t('Status')}
        </Typography>
      </Stack>
      <Container disableGutters ref={refContainer} sx={{ display: 'grid', maxHeight: '470px', overflow: 'scroll', position: 'relative', rowGap: '4px' }}>
        {!notReady && historyItems?.map((item, index) => (
          <HistoryItem
            historyItem={item}
            key={index}
            short={short}
          />
        ))
        }
        <Typography fontSize='18px' fontWeight={600} >
          <div id='observerObj' style={{ height: '1px' }} />
        </Typography>
        {!notReady && historyItems === null &&
          <EmptyHistoryBox />
        }
        {!notReady && historyItems === undefined &&
          <AssetLoading itemsCount={short ? 2 : 5} noDrawer />
        }
        {notReady &&
          <Typography color='text.primary' my='40px' variant='B-2'>
            {t('Select a chain to view your account history.')}
          </Typography>
        }
      </Container>
    </>
  );
}

export default memo(HistoryBox);
