// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail } from '@polkadot/extension-polkagate/util/types';

import { Box, Container, type SxProps, type Theme, Typography } from '@mui/material';
import React, { memo, useCallback } from 'react';

import { emptyHistoryList } from '../../../assets/icons/index';
import { useTranslation } from '../../../hooks';
import VelvetBox from '../../../style/VelvetBox';
import AssetLoading from '../../home/partial/AssetLoading';
import HistoryItem from './HistoryItem';

function EmptyHistoryBox () {
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
  historyItems: Record<string, TransactionDetail[]> | null | undefined;
  style?: SxProps<Theme>;
}

function HistoryBox ({ historyItems, style }: Props) {
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

  return (
    <VelvetBox style={style}>
      <Container disableGutters sx={{ display: 'grid', rowGap: '4px' }}>
        {historyItems && Object.entries(historyItems).map(([date, items], index) => (
          <HistoryItem
            historyDate={formatDate(date)}
            historyItems={items}
            key={index}
          />
        ))
        }
        <div id='observerObj' style={{ height: '1px' }} />
        {historyItems === null &&
          <EmptyHistoryBox />
        }
        {historyItems === undefined &&
          <AssetLoading itemsCount={2} noDrawer />
        }
      </Container>
    </VelvetBox>
  );
}

export default memo(HistoryBox);
