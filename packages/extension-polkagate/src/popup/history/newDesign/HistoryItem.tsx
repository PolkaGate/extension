// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { TransactionDetail } from '../../../util/types';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleUp2, CloseCircle, Polkadot, Strongbox, Strongbox2, TickCircle } from 'iconsax-react';
import React, { memo } from 'react';

import { FormatBalance2, ScrollingTextBox } from '../../../components';
import { useTranslation } from '../../../hooks';
import GradientDivider from '../../../style/GradientDivider';
import { amountToMachine } from '../../../util/utils';

/* eslint-disable react/jsx-max-props-per-line */

interface HistoryItemProps {
  historyDate: string;
  historyItems: TransactionDetail[];
  decimal: number;
  token: string;
}

const historyIcon = (action: string): Icon => {
  switch (action.toLowerCase()) {
    case 'send':
      return ArrowCircleUp2;

    case 'receive':
      return ArrowCircleDown2;

    case 'solo staking':
      return Strongbox;

    case 'pool staking':
      return Strongbox2;

    default:
      return Polkadot;
  }
};

const SubAction = memo(function SubAction ({ historyItem }: { historyItem: TransactionDetail; }) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (historyItem.subAction) {
    return (
      <Typography color='text.secondary' textTransform='capitalize' variant='B-4'>
        {historyItem.subAction}
      </Typography>
    );
  } else { // send or receive
    const isSend = historyItem.action.toLowerCase() === 'send';

    return (
      <Grid alignItems='center' columnGap='4px' container item width='fit-content'>
        <Typography color='text.secondary' variant='B-4'>
          {isSend ? t('To') : t('From')}:
        </Typography>
        <ScrollingTextBox
          style={{ lineHeight: '18px' }}
          text={isSend
            ? (historyItem.to?.name ?? historyItem.to?.address) ?? ''
            : (historyItem.from.name ?? historyItem.from.address) ?? ''
          }
          textStyle={{
            color: '#AA83DC',
            ...theme.typography['B-4']
          }}
          width={90}
        />
      </Grid>
    );
  }
});

const HistoryStatus = memo(function HistoryStatus ({ status }: { status: boolean }) {
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' columnGap='4px' container item justifyContent='center' width='fit-content'>
      {status
        ? <TickCircle color='#FF8A65' size='18' variant='Bold' />
        : <CloseCircle color='#FF8A65' size='18' variant='Bold' />
      }
      <Typography color={status ? '#82FFA5' : '#FF4FB9'} variant='B-4'>
        {status ? t('Completed') : t('Failed')}
      </Typography>
    </Grid>
  );
});

function HistoryItem ({ decimal, historyDate, historyItems, token }: HistoryItemProps) {
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ background: '#05091C', borderRadius: '14px', display: 'grid', p: '10px' }}>
      <Typography color='text.secondary' sx={{ background: '#C6AECC26', borderRadius: '10px', mb: '4px', p: '2px 4px', width: 'fit-content' }} variant='B-2'>
        {historyDate}
      </Typography>
      {historyItems.map((historyItem, index) => {
        const HistoryIcon = historyIcon(historyItem.action);
        const noDivider = historyItems.length === index + 1;

        return (
          <>
            <Grid alignItems='center' container item justifyContent='space-between' key={index} sx={{ ':hover': { background: '#1B133C', px: '8px' }, borderRadius: '12px', columnGap: '8px', cursor: 'pointer', py: '4px', transition: 'all 250ms ease-out' }}>
              <Grid alignItems='center' container item justifyContent='center' sx={{ background: '#6743944D', border: '2px solid', borderColor: '#2D1E4A', borderRadius: '999px', height: '36px', width: '36px' }}>
                <HistoryIcon color='#AA83DC' size='26' />
              </Grid>
              <Grid container item justifyContent='space-between' xs>
                <Grid alignItems='flex-start' container direction='column' item width='fit-content'>
                  <Typography color='text.primary' textTransform='capitalize' variant='B-2'>
                    {historyItem.action}
                  </Typography>
                  <SubAction historyItem={historyItem} />
                </Grid>
                <Grid container direction='column' item width='fit-content'>
                  <FormatBalance2
                    decimalPoint={2}
                    decimals={[decimal]}
                    style={{
                      color: theme.palette.text.primary,
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 600,
                      width: 'max-content'
                    }}
                    tokens={[token]}
                    value={amountToMachine(historyItem.amount, decimal)}
                  />
                  <HistoryStatus status={historyItem.success} />
                </Grid>
              </Grid>
            </Grid>
            {!noDivider && <GradientDivider style={{ my: '4px' }} />}
          </>
        );
      })}
    </Container>
  );
}

export default memo(HistoryItem);
