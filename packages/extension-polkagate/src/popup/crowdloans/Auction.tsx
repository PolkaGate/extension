// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/** 
 * @description
 *  this component renders auction tab which show an ongoing auction information along with a possible parachain bids/winning 
 * 
 * auction start                                                                                                      Auction ends
 * 
 *  |--------27000 blocks (grace period ~ 2days)---------||===========72000 blocks (candle Phase ~ 5days)============|||
 * */

import { Grid, LinearProgress, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { Switch, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import BouncingSubTitle from '../../partials/BouncingSubTitle';
import { AUCTION_GRACE_PERIOD } from '../../util/constants';
import { Auction } from '../../util/types';
import { remainingTime } from '../../util/utils';
import blockToDate from './partials/blockToDate';

interface Props {
  api?: ApiPromise;
  auction: Auction;
  currentBlockNumber?: number;
}

export default function AuctionTab({ api, auction, currentBlockNumber }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const [viewType, setViewType] = useState<'Date' | 'Block'>('Date');
  const [time, setTime] = useState<number>();

  const firstLease = auction?.auctionInfo && Number(auction?.auctionInfo[0]);
  const candlePhaseStartBlock = auction?.auctionInfo && Number(auction?.auctionInfo[1]);
  const lastLease = api && Number(api.consts.auctions.leasePeriodsPerSlot.toString()) - 1;
  const endingPeriod = api && Number(api.consts.auctions?.endingPeriod.toString());
  const AUCTION_START_BLOCK = candlePhaseStartBlock - AUCTION_GRACE_PERIOD;

  const start = currentBlockNumber && currentBlockNumber < candlePhaseStartBlock ? AUCTION_START_BLOCK : candlePhaseStartBlock;
  const end = currentBlockNumber && currentBlockNumber < candlePhaseStartBlock ? candlePhaseStartBlock : endingPeriod && candlePhaseStartBlock + endingPeriod;
  const stageInHuman = currentBlockNumber && currentBlockNumber < candlePhaseStartBlock ? t('auction stage') : t('ending stage');

  const currentTime = useMemo(() => {
    if (viewType === 'Block') {
      return;
    }

    const now = Date.now();

    setTimeout(() => setTime(now + 1000), 1000);

    return new Date(now).toLocaleDateString('en-US', { day: 'numeric', hour: '2-digit', hourCycle: 'h24', minute: '2-digit', month: 'short', second: '2-digit' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType, time]);

  const ShowAuction = () => (
    <Grid container direction='column' item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', mt: '-2px' }}>
      <Grid container item justifyContent='space-between' px='10px'>
        <Typography fontSize='16px' fontWeight={300} lineHeight='34px' width='fit-content'>
          {t<string>('Lease')}
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='34px' width='fit-content'>
          {firstLease} {' - '}{lastLease && firstLease + lastLease} {t<string>('Slot')}
        </Typography>
      </Grid>
      <Grid container item justifyContent='space-between' px='10px' sx={{ borderBlock: '1px solid', borderColor: 'secondary.light' }}>
        <Typography fontSize='16px' fontWeight={300} lineHeight='34px' width='fit-content'>
          {viewType === 'Block' ? t<string>('Current block') : t<string>('Current time')}
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='34px' width='fit-content'>
          {viewType === 'Block' ? String(currentBlockNumber) : currentTime && currentTime}
        </Typography>
      </Grid>
      <Grid container item justifyContent='space-between' px='10px'>
        <Typography fontSize='16px' fontWeight={300} lineHeight='34px' width='fit-content'>
          {t<string>('Auction stage')}
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='34px' width='fit-content'>
          {viewType === 'Block' && `${AUCTION_START_BLOCK} - ${candlePhaseStartBlock}`}
          {viewType === 'Date' && `${blockToDate(AUCTION_START_BLOCK, currentBlockNumber, { day: 'numeric', hour: '2-digit', hourCycle: 'h24', minute: '2-digit', month: 'short' })} - ${blockToDate(candlePhaseStartBlock, currentBlockNumber, { day: 'numeric', hour: '2-digit', hourCycle: 'h24', minute: '2-digit', month: 'short' })}`}
        </Typography>
      </Grid>
      <Grid container item justifyContent='space-between' px='10px' sx={{ borderBlock: '1px solid', borderColor: 'secondary.light' }}>
        <Typography fontSize='16px' fontWeight={300} lineHeight='34px' width='fit-content'>
          {t<string>('Ending stage')}
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='34px' width='fit-content'>
          {viewType === 'Block' && `${candlePhaseStartBlock} - ${endingPeriod && candlePhaseStartBlock + endingPeriod}`}
          {viewType === 'Date' && `${blockToDate(candlePhaseStartBlock, currentBlockNumber, { day: 'numeric', hour: '2-digit', hourCycle: 'h24', minute: '2-digit', month: 'short' })} - ${blockToDate(candlePhaseStartBlock + endingPeriod, currentBlockNumber, { day: 'numeric', hour: '2-digit', hourCycle: 'h24', minute: '2-digit', month: 'short' })}`}
        </Typography>
      </Grid>
      <Grid container item justifyContent='space-between' mt='20px' px='10px'>
        <Typography fontSize='16px' fontWeight={300} lineHeight='34px' width='fit-content'>
          {t<string>('Remaining Time')}
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='34px' width='fit-content'>
          {currentBlockNumber && end && remainingTime(end - currentBlockNumber)}
        </Typography>
      </Grid>
      <Grid container item>
        {end &&
          <LinearProgress
            color='success'
            sx={{ bgcolor: theme.palette.mode === 'light' ? 'action.disabledBackground' : 'white', border: '0.1px solid', borderColor: 'white', borderRadius: '5px', height: '20px', m: '10px auto 5px', width: '95%' }}
            value={100 * (Number(currentBlockNumber) - start) / (end - start)}
            variant='determinate'
          />
        }
      </Grid>
      <Grid container item justifyContent='center' mb='20px'>
        <Typography fontSize='16px' fontWeight={400} textAlign='center'>
          {t('In')} {stageInHuman}
        </Typography>
      </Grid>
    </Grid>
  );

  const onChangeView = useCallback(() => {
    setViewType(viewType === 'Block' ? 'Date' : 'Block');
  }, [viewType]);

  return (
    <>
      <BouncingSubTitle label={t<string>(`Auction #${auction.auctionCounter}`)} style={{ fontSize: '20px', fontWeight: 400 }} />
      {auction && !auction.auctionInfo &&
        <Grid container height='15px' item justifyContent='center' mt='30px'>
          <Warning
            fontWeight={400}
            theme={theme}
          >
            {t<string>('No available auction.')}
          </Warning>
        </Grid>
      }
      {auction && auction.auctionInfo &&
        <Grid container item m='auto' width='92%'>
          <Grid container item justifyContent='flex-end' mt='15px'>
            <Switch
              checkedLabel={t<string>('Block')}
              fontSize='15px'
              isChecked={viewType !== 'Date'}
              onChange={onChangeView}
              theme={theme}
              uncheckedLabel={t<string>('Date')}
            />
          </Grid>
          <ShowAuction />
        </Grid>
      }
    </>
  );
}
