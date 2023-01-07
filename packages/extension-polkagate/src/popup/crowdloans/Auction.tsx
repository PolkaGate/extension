// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

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

import { Infotip, Switch, Warning } from '../../components';
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

  const firstLease = auction?.auctionInfo && Number(auction?.auctionInfo[0]);
  const candlePhaseStartBlock = auction?.auctionInfo && Number(auction?.auctionInfo[1]);
  const lastLease = api && Number(api.consts.auctions.leasePeriodsPerSlot.toString()) - 1;
  const endingPeriod = api && Number(api.consts.auctions?.endingPeriod.toString());
  const auctionStartBlock = candlePhaseStartBlock - AUCTION_GRACE_PERIOD;

  const start = currentBlockNumber && currentBlockNumber < candlePhaseStartBlock ? auctionStartBlock : candlePhaseStartBlock;
  const end = currentBlockNumber && currentBlockNumber < candlePhaseStartBlock ? candlePhaseStartBlock : endingPeriod && candlePhaseStartBlock + endingPeriod;

  const dateFormat = useMemo(() => ({ day: 'numeric', hour: '2-digit', hourCycle: 'h23', minute: '2-digit', month: 'short' }), []);

  const currentTime = useMemo(() => {
    if (viewType === 'Block') {
      return;
    }

    const now = Date.now();

    return new Date(now).toLocaleDateString('en-US', { ...dateFormat });
  }, [dateFormat, viewType]);

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
          {viewType === 'Block' && `${auctionStartBlock} - ${candlePhaseStartBlock}`}
          {viewType === 'Date' && `${blockToDate(auctionStartBlock, currentBlockNumber, dateFormat)} - ${blockToDate(candlePhaseStartBlock, currentBlockNumber, dateFormat)}`}
        </Typography>
      </Grid>
      <Grid container item justifyContent='space-between' px='10px' sx={{ borderBlock: '1px solid', borderColor: 'secondary.light' }}>
        <Typography fontSize='16px' fontWeight={300} lineHeight='34px' width='fit-content'>
          {t<string>('Ending stage')}
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='34px' width='fit-content'>
          {viewType === 'Block' && `${candlePhaseStartBlock} - ${endingPeriod && candlePhaseStartBlock + endingPeriod}`}
          {viewType === 'Date' && `${blockToDate(candlePhaseStartBlock, currentBlockNumber, dateFormat)} - ${blockToDate(candlePhaseStartBlock + endingPeriod, currentBlockNumber, dateFormat)}`}
        </Typography>
      </Grid>
      <Grid container item justifyContent='space-between' mt='20px' px='10px'>
        <Typography fontSize='16px' fontWeight={300} lineHeight='34px' width='fit-content'>
          {viewType === 'Block' ? t<string>('Remaining block') : t<string>('Remaining time')}
        </Typography>
      </Grid>
      <Grid container item m='auto' width='95%'>
        {end && currentBlockNumber &&
          <>
            <Grid container item sx={{ width: '30%' }}>
              <Infotip placement='bottom' text={
                currentBlockNumber > candlePhaseStartBlock
                  ? t('Done')
                  : viewType === 'Date'
                    ? remainingTime(candlePhaseStartBlock - currentBlockNumber) + 'left'
                    : t<string>('{{blocks}} blocks left', { replace: { blocks: candlePhaseStartBlock - currentBlockNumber } })}
              >
                <LinearProgress
                  color='inherit'
                  sx={{
                    bgcolor: theme.palette.mode === 'light' ? 'background.paper' : 'white',
                    border: '0.1px solid',
                    borderBottomLeftRadius: '5px',
                    borderColor: 'rgba(255, 255, 255, 0.65)',
                    borderRight: 'none',
                    borderTopLeftRadius: '5px',
                    color: '#1F7720',
                    height: '20px',
                    width: '93px'
                  }}
                  value={
                    currentBlockNumber > candlePhaseStartBlock
                      ? 100
                      : 100 * (Number(currentBlockNumber) - auctionStartBlock) / (candlePhaseStartBlock - auctionStartBlock)
                  }
                  variant='determinate'
                />
              </Infotip>
            </Grid>
            <Grid container item width='70%'>
              <Infotip placement='bottom' text={
                currentBlockNumber >= candlePhaseStartBlock
                  ? viewType === 'Date'
                    ? remainingTime(end - currentBlockNumber) + 'left'
                    : t('{{blocks}} blocks left', { replace: { blocks: end - currentBlockNumber } })
                  : t('Not started yet')}
              >
                <LinearProgress
                  color='inherit'
                  sx={{
                    bgcolor: theme.palette.mode === 'light' ? 'background.paper' : 'white',
                    border: '0.1px solid',
                    borderBottomRightRadius: '5px',
                    borderColor: 'rgba(255, 255, 255, 0.65)',
                    borderLeft: 'none',
                    borderTopRightRadius: '5px',
                    color: '#629460',
                    height: '20px',
                    width: '217px'
                  }}
                  value={
                    currentBlockNumber < candlePhaseStartBlock
                      ? 0
                      : 100 * (Number(currentBlockNumber) - candlePhaseStartBlock) / (endingPeriod || 1)
                  }
                  variant='determinate'
                />
              </Infotip>
            </Grid>
          </>
        }
      </Grid>
      <Grid container item justifyContent='center' m='0 auto 20px' width='95%'>
        <Typography fontSize='12px' fontWeight={300} textAlign='center' width='30%'>
          {t('Auction Stage')}
        </Typography>
        <Typography fontSize='12px' fontWeight={300} textAlign='center' width='70%'>
          {t('Ending stage')}
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
