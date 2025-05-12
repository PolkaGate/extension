// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '@polkadot/extension-polkagate/src/util/types';

import { Container, Stack, Typography } from '@mui/material';
import React, { memo, useRef } from 'react';

import { useTranslation } from '../../hooks';
import { COLUMN_WIDTH } from './consts';
import EmptyHistoryBox from './EmptyHistoryBox';
import HistoryItem from './HistoryItem';
import HistoryLoading from './HistoryLoading';

interface Props {
  historyItems: TransactionDetail[] | null | undefined;
  notReady?: boolean;
}

function HistoryBox ({ historyItems, notReady = false }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);

  return (
    <>
      <Stack columnGap='30px' direction='row' sx={{ height: '40px', padding: '10px 15px', width: '100%' }}>
        <Typography color='#BEAAD8' sx={{ textAlign: 'left', width: COLUMN_WIDTH.ACTION }} variant='B-1'>
          {t('Type')}
        </Typography>
        <Typography color='#BEAAD8' sx={{ textAlign: 'left', width: COLUMN_WIDTH.SUB_ACTION }} variant='B-1'>
          {t('Object info')}
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
      <Container disableGutters ref={refContainer} sx={{ alignContent: 'start', display: 'grid', height: '422px', maxHeight: '470px', overflow: 'scroll', position: 'relative', rowGap: '3px' }}>
        {
          !notReady && historyItems?.map((item, index) => (
            <HistoryItem
              historyItem={item}
              key={index}
            />
          ))
        }
        <Typography fontSize='18px' fontWeight={600}>
          <div id='observerObj' style={{ height: '1px' }} />
        </Typography>
        {
          !notReady && historyItems === null &&
          <EmptyHistoryBox />
        }
        {
          !notReady && historyItems === undefined &&
          <HistoryLoading itemsCount={7} />
        }
        {
          notReady &&
          <Typography color='text.primary' my='40px' variant='B-2'>
            {t('Select a chain to view your account history.')}
          </Typography>
        }
      </Container>
    </>
  );
}

export default memo(HistoryBox);
