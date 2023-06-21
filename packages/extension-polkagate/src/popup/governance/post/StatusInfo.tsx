// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { Infotip2, ShowValue } from '../../../components';
import { useCurrentBlockNumber, useTranslation } from '../../../hooks';
import { remainingTime } from '../../../util/utils';
import { Timeline, Track } from '../utils/types';
import { blockToUnit, blockToX, getPeriodScale } from '../utils/util';
import PayDecisionDeposit from './decisionDeposit/PayDecisionDeposit';
import DecisionDeposit from './decisionDeposit';

interface Props {
  address: string | undefined;
  timeline: Timeline[] | undefined;
  status: string | undefined;
  track: Track | undefined;
  isOngoing: boolean;
  refIndex: number | undefined;
}

export default function StatusInfo({ address, isOngoing, refIndex, status, timeline, track }: Props): React.ReactElement | null {
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
        return t('Preparing');
      case 'Executed':
        return null;
      default:
        return null;
    }
  }, [status, t]);

  const getUnitPassed = useCallback((timelineIndex: number, periodKey: string) => {
    if (track?.[1]?.[periodKey] && timeline?.[timelineIndex]?.block && currentBlock) {
      const startBlock = timeline[timelineIndex].block;
      const periodInBlock = Number(track[1][periodKey]);
      const endBlock = startBlock + periodInBlock;

      if (currentBlock > endBlock) {
        return null; // finished
      }

      const diff = currentBlock - startBlock;

      setRemainingBlocks(endBlock - currentBlock);
      const unitToEndOfPeriod = Math.ceil(diff / getPeriodScale(periodInBlock));

      return unitToEndOfPeriod;
    }
  }, [currentBlock, timeline, track]);

  const prepareUnitPassed = useMemo(() => getUnitPassed(0, 'preparePeriod'), [getUnitPassed]);
  const decisionUnitPassed = useMemo(() => getUnitPassed(1, 'decisionPeriod'), [getUnitPassed]);
  const confirmUnitPassed = useMemo(() => getUnitPassed(2, 'confirmPeriod'), [getUnitPassed]);

  if (!isOngoing) {
    return (<></>);
  }

  return (
    <Grid alignItems={decisionUnitPassed || confirmUnitPassed ? 'center' : 'end'} container item justifyContent='space-between' sx={{ p: '10px 25px', bgcolor: 'background.paper', borderRadius: '10px', mb: '10px', border: 1, borderColor: theme.palette.mode === 'light' ? 'background.paper' : 'secondary.main' }} xs={12}>
      <Grid item>
        <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
          {_status || t('Status')}
        </Typography>
      </Grid>
      <Grid item>
        <Infotip2 iconLeft={2} iconTop={3} showQuestionMark text={remainingTime(remainingBlocks) || t('Fetching ...')}>
          <Grid item sx={{ pr: '5px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 400 }}>
              {_status === t('Preparing') &&
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
      {_status === t('Preparing') &&
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
