// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail } from '@polkadot/extension-polkagate/util/types';

import { Box, Container, type SxProps, type Theme, Typography } from '@mui/material';
import React, { memo } from 'react';

import { emptyHistoryList } from '../../../assets/icons/index';
import { useTranslation } from '../../../hooks';
import VelvetBox from '../../../style/VelvetBox';
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
  return (
    <VelvetBox style={style}>
      <Container disableGutters sx={{ display: 'grid', rowGap: '4px' }}>
        {historyItems && Object.entries(historyItems).map(([date, items], index) => (
          <HistoryItem
            historyDate={date}
            historyItems={items}
            key={index}
          />
        ))
        }
        <div id='observerObj' style={{ height: '1px' }} />
        {!historyItems &&
          <EmptyHistoryBox />
        }
      </Container>
    </VelvetBox>
  );
}

export default memo(HistoryBox);
