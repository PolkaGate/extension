// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '@polkadot/extension-polkagate/src/util/types';

import { Box, Stack, Typography, useTheme } from '@mui/material';
import React, { memo, useCallback, useRef } from 'react';

import { FadeOnScroll } from '@polkadot/extension-polkagate/src/components/index';

import { emptyList, emptyListLight } from '../../../assets/icons/index';
import { useIsExtensionPopup, useIsSidePanel, useTranslation } from '../../../hooks';
import VelvetBox from '../../../style/VelvetBox';
import AssetLoading from '../../home/partial/AssetLoading';
import HistoryItem from './HistoryItem';

function EmptyHistoryBox() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <>
      <Box
        component='img'
        src={(isDark ? emptyList : emptyListLight) as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '125px' }}
      />
      <Typography color='text.secondary' mb='30px' variant='B-2'>
        {t('No transaction history is available yet')}
      </Typography>
    </>
  );
}

interface Props {
  historyItems: Record<string, TransactionDetail[]> | null | undefined;
  isFetchingMore?: boolean;
  style?: React.CSSProperties;
  notReady?: boolean;
}

function HistoryBox({ historyItems, isFetchingMore = false, notReady = false, style }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);

  const isExtension = useIsExtensionPopup();
  const isSidePanel = useIsSidePanel();

  const short = window.location.hash.includes('token');

  const formatDate = useCallback((inputDate: string) => {
    // Handle invalid dates
    const date = new Date(inputDate);

    if (isNaN(date.getTime())) {
      return inputDate;
    }

    const today = new Date();
    const yesterday = new Date(today);

    yesterday.setDate(today.getDate() - 1);

    // Reset time components for accurate comparison
    const resetTime = (date: Date) => {
      date.setHours(0, 0, 0, 0);

      return date;
    };

    const compareDate = resetTime(new Date(date));
    const compareToday = resetTime(new Date(today));
    const compareYesterday = resetTime(new Date(yesterday));

    if (compareDate.getTime() === compareToday.getTime()) {
      return 'Today';
    }

    if (compareDate.getTime() === compareYesterday.getTime()) {
      return 'Yesterday';
    }

    return inputDate;
  }, []);

  const historyEntries = historyItems ? Object.entries(historyItems) : [];
  const hasHistoryItems = Boolean(historyEntries.length);
  const isLoading = !notReady && (historyItems === undefined || (!hasHistoryItems && isFetchingMore));
  const showEmptyState = !notReady && !hasHistoryItems && historyItems !== undefined && !isFetchingMore && !isLoading;
  const showFetchingMore = hasHistoryItems && !isLoading && isFetchingMore;
  const loadingItemsCount = short
    ? isSidePanel ? 4 : 2
    : 5;

  return (
    <VelvetBox style={style}>
      <Stack direction='column' id='scrollArea' ref={refContainer} sx={{ height: isExtension ? 'inherit' : 'calc(100vh - 633px)', overflowY: 'auto', rowGap: isLoading ? 0 : '4px' }}>
        {hasHistoryItems && historyEntries.map(([date, items], index) => (
          <HistoryItem
            historyDate={formatDate(date)}
            historyItems={items}
            key={index}
            short={short}
          />
        ))
        }
        <div id='observerObj' style={{ height: '1px' }} />
        {showEmptyState &&
          <EmptyHistoryBox />
        }
        {showFetchingMore &&
          <AssetLoading itemsCount={1} noDrawer />
        }
        {isLoading &&
          <AssetLoading itemsCount={loadingItemsCount} noDrawer />
        }
        {notReady &&
          <Typography color='text.primary' my='40px' variant='B-2'>
            {t('Select a chain to view your account history.')}
          </Typography>
        }
        <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} />
      </Stack>
    </VelvetBox>
  );
}

export default memo(HistoryBox);
