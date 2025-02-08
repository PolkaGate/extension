// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail } from '@polkadot/extension-polkagate/util/types';

import { Box, Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleUp2, CloseCircle, type Icon, Polkadot, Strongbox, Strongbox2, TickCircle } from 'iconsax-react';
import React, { useCallback } from 'react';

import { emptyHistoryList } from '../../../assets/icons/index';
import { FormatBalance2, GradientDivider } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import VelvetBox from '../../../style/VelvetBox';
import { amountToMachine } from '../../../util/utils';

const EmptyHistoryBox = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box
        component='img'
        src={emptyHistoryList as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '125px' }}
      />
      <Typography color='text.secondary' mb='30px' variant='B-2'>
        {t('No activity recorded yet')}!
      </Typography>
    </>
  );
};

interface HistoryItemProps {
  historyDate: string;
  historyItems: TransactionDetail[];
  decimal: number;
  token: string;
}

const HistoryItem = ({ decimal, historyDate, historyItems, token }: HistoryItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const historyIcon = useCallback((action: string): Icon => {
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
  }, []);

  const subAction = useCallback((historyItem: TransactionDetail) => {
    if (historyItem.subAction) {
      return (
        <Typography color='text.secondary' textTransform='capitalize' variant='B-4'>
          {historyItem.subAction}
        </Typography>
      );
    } else { // send or receive
      const isSend = historyItem.action.toLowerCase() === 'send';

      return (
        <Grid container item width='fit-content'>
          <Typography color='text.secondary' variant='B-4'>
            {isSend ? t('To') : t('From')}:
          </Typography>
          <Typography color='#AA83DC' variant='B-4'>
            {isSend
              ? (historyItem.to?.name)
              : historyItem.from.name
            }
          </Typography>
        </Grid>
      );
    }
  }, [t]);

  const historyStatus = useCallback((status: boolean) => {
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
  }, [t]);

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
                <HistoryIcon color='#AA83DC' size='25' />
              </Grid>
              <Grid container item justifyContent='space-between' xs>
                <Grid alignItems='flex-start' container direction='column' item width='fit-content'>
                  <Typography color='text.primary' textTransform='capitalize' variant='B-2'>
                    {historyItem.action}
                  </Typography>
                  {subAction(historyItem)}
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
                  {historyStatus(historyItem.success)}
                </Grid>
              </Grid>
            </Grid>
            {!noDivider && <GradientDivider style={{ my: '4px' }} />}
          </>
        );
      })}
    </Container>
  );
};

interface Props {
  historyItems: Record<string, TransactionDetail[]> | null | undefined;
  genesisHash: string;
  style?: SxProps<Theme>;
}

function HistoryBox({ genesisHash, historyItems, style }: Props) {
  const { decimal, token } = useChainInfo(genesisHash);

  return (
    <VelvetBox style={style}>
      <Container disableGutters sx={{ display: 'grid', rowGap: '4px' }}>
        {!historyItems
          ? <EmptyHistoryBox />
          : Object.entries(historyItems).map(([date, items], index) => (
            <HistoryItem
              decimal={decimal ?? 0}
              historyDate={date}
              historyItems={items}
              key={index}
              token={token ?? ''}
            />
          ))
        }
        {/* one should be in the progress (doesn't designed yet), and one at the end of the HistoryItem list) */}
        <div id='observerObj' style={{ height: '1px' }} />
      </Container>
    </VelvetBox>
  );
}

export default HistoryBox;
