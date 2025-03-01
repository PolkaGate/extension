// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
/* eslint-disable react/jsx-max-props-per-line */

import type { Timeline, Track } from '../utils/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { Infotip2, ShowValue } from '../../../components';
import { useCurrentBlockNumber, useTranslation } from '../../../hooks';
import { pgBoxShadow, remainingTime } from '../../../util/utils';
import { blockToUnit, blockToX, getPeriodScale } from '../utils/util';
import PayDecisionDeposit from './decisionDeposit/PayDecisionDeposit';
import DecisionDeposit from './decisionDeposit';

interface Props {
  address: string | undefined;
  isDecisionDepositPlaced: boolean
  isOngoing: boolean;
  status: string | undefined;
  timeline: Timeline[] | undefined;
  track: Track | undefined;
  refIndex: number | undefined;
}

export default function StatusInfo({ address, isDecisionDepositPlaced, isOngoing, refIndex, status, timeline, track }: Props): React.ReactElement | null {
  const { t } = useTranslation();
  const theme = useTheme();
  const [remainingBlocks, setRemainingBlocks] = useState<number>();
  const [openDecisionDeposit, setOpenDecisionDeposit] = useState<boolean>();
  const currentBlock = useCurrentBlockNumber(address);

  const _status = useMemo(() => {
    switch (status) {
      case 'Decision':
      case 'Deciding':
        return t('Deciding');
      case 'ConfirmStarted':
      case 'Confirm':
        return t('Confirming');
      case 'Submitted':
      case 'DecisionDepositPlaced':
        return t('Preparing');
      case 'Executed':
        return null;
      default:
        return null;
    }
  }, [status, t]);

  const getUnitPassed = useCallback((timelineIndex: number, periodKey: string): number | null | undefined => {
    if (track?.[1]?.[periodKey] && timeline?.[timelineIndex]?.block && currentBlock) {
      const startBlock = timeline[timelineIndex].block;
      const periodInBlock = Number(track[1][periodKey]);
      const endBlock = startBlock + periodInBlock;

      setRemainingBlocks(endBlock - currentBlock);

      if (currentBlock > endBlock) {
        return null; // finished
      }

      const diff = currentBlock - startBlock;
      const scale = getPeriodScale(periodInBlock);

      const unitToEndOfPeriod = scale ? Math.ceil(diff / scale) : 0;

      return unitToEndOfPeriod;
    }

    return undefined;
  }, [currentBlock, timeline, track]);

  const prepareUnitPassed = useMemo(() => getUnitPassed(0, 'preparePeriod'), [getUnitPassed]);
  const decisionUnitPassed = useMemo(() => getUnitPassed(1, 'decisionPeriod'), [getUnitPassed]);
  const confirmUnitPassed = useMemo(() => getUnitPassed(2, 'confirmPeriod'), [getUnitPassed]);

  if (!isOngoing || confirmUnitPassed === null) {
    return (<></>);
  }

  return (
    <Grid alignItems={decisionUnitPassed || confirmUnitPassed ? 'center' : 'end'} container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: theme.palette.mode === 'light' ? pgBoxShadow(theme) : undefined, mb: '10px', p: '10px 25px' }} xs={12}>
      <Grid item>
        <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
          {_status || t('Status')}
        </Typography>
      </Grid>
      <Grid item>
        <Infotip2 showQuestionMark text={remainingBlocks ? remainingTime(remainingBlocks) === 'finished' ? t('Preparation time is over. Please make the deposit.') : `${remainingTime(remainingBlocks)} remaining` : t('Fetching ...')}>
          <Grid item sx={{ pr: '5px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 400 }}>
              {_status === t('Preparing') && prepareUnitPassed !== null &&
                <ShowValue value={prepareUnitPassed && track?.[1]?.preparePeriod ? `${blockToUnit(track?.[1]?.preparePeriod)} ${prepareUnitPassed} of ${blockToX(track?.[1]?.preparePeriod, true)}` : undefined} />
              }
              {_status === t('Deciding') &&
                <ShowValue value={decisionUnitPassed && track?.[1]?.decisionPeriod ? `${blockToUnit(track?.[1]?.decisionPeriod)} ${decisionUnitPassed} of ${blockToX(track?.[1]?.decisionPeriod, true)}` : undefined} />
              }
              {_status === t('Confirming') &&
                <ShowValue value={confirmUnitPassed && track?.[1]?.confirmPeriod ? `${blockToUnit(track?.[1]?.confirmPeriod)} ${confirmUnitPassed} of ${blockToX(track?.[1]?.confirmPeriod, true)}` : undefined} />
              }
              {!_status &&
                <ShowValue value={undefined} />
              }
            </Typography>
          </Grid>
        </Infotip2>
      </Grid>
      {!isDecisionDepositPlaced &&
        <PayDecisionDeposit
          setOpenDecisionDeposit={setOpenDecisionDeposit}
        />
      }
      {openDecisionDeposit &&
        <DecisionDeposit
          address={address}
          open={openDecisionDeposit}
          refIndex={refIndex}
          setOpen={setOpenDecisionDeposit}
          track={track}
        />
      }
    </Grid>
  );
}
