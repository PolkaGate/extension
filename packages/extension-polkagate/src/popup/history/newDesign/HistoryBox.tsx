// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '@polkadot/extension-polkagate/src/util/types';

import { Box, Container, Typography } from '@mui/material';
import React, { memo, useCallback, useRef } from 'react';

import { FadeOnScroll } from '@polkadot/extension-polkagate/src/components/index';

import { emptyHistoryList } from '../../../assets/icons/index';
import { useIsExtensionPopup, useTranslation } from '../../../hooks';
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
  style?: React.CSSProperties;
  notReady?: boolean;
}

function HistoryBox ({ historyItems, notReady = false, style }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);

  const isExtension = useIsExtensionPopup();

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

  return (
    <VelvetBox style={style}>
      <Container disableGutters ref={refContainer} sx={{ display: 'grid', height: isExtension ? 'inherit' : '168px', overflow: 'scroll', rowGap: '4px' }}>
        {!notReady && historyItems && Object.entries(historyItems).map(([date, items], index) => (
          <HistoryItem
            historyDate={formatDate(date)}
            historyItems={items}
            key={index}
            short={short}
          />
        ))
        }
        <div id='observerObj' style={{ height: '1px' }} />
        {!notReady && historyItems === null &&
          <EmptyHistoryBox />
        }
        {!notReady && historyItems === undefined &&
          <AssetLoading itemsCount={short ? 2 : 5} noDrawer />
        }
        {notReady &&
          <Typography color='text.secondary' my='30px' variant='B-2'>
            {t('Select a chain to view the transaction history on')}
          </Typography>
        }
        <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} />
      </Container>
    </VelvetBox>
  );
}

export default memo(HistoryBox);
