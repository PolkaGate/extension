// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { Infotip, ShowValue } from '../../../components';
import { useCurrentBlockNumber, useTranslation } from '../../../hooks';
import { Track } from '../../../hooks/useTracks';
import { remainingTime } from '../../../util/utils';
import { ReferendumSubScan } from '../utils/types';
import { blockToUnit, blockToX, getPeriodScale } from '../utils/util';

interface Props {
  address: string | undefined;
  referendumInfoFromSubscan: ReferendumSubScan | undefined;
  track: Track | undefined;
}

export default function StatusInfo({ address, referendumInfoFromSubscan, track }: Props): React.ReactElement | null {
  const { t } = useTranslation();
  const [remainingBlocks, setRemainingBlocks] = useState<number>();
  const currentBlock = useCurrentBlockNumber(address);

  const status = useMemo(() => {
    switch (referendumInfoFromSubscan?.status) {
      case 'Decision':
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
  }, [referendumInfoFromSubscan, t]);

  const getUnitPassed = useCallback((timelineIndex: number, periodKey: string) => {
    if (track?.[1]?.[periodKey] && referendumInfoFromSubscan?.timeline[timelineIndex]?.block && currentBlock) {
      const startBlock = referendumInfoFromSubscan.timeline[timelineIndex].block;
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
  }, [currentBlock, referendumInfoFromSubscan, track]);

  const prepareUnitPassed = useMemo(() => getUnitPassed(0, 'preparePeriod'), [getUnitPassed]);
  const decisionUnitPassed = useMemo(() => getUnitPassed(1, 'decisionPeriod'), [getUnitPassed]);
  const confirmUnitPassed = useMemo(() => getUnitPassed(2, 'confirmPeriod'), [getUnitPassed]);

  const isOngoing = useMemo(() => !['Executed', 'Rejected'].includes(referendumInfoFromSubscan?.status), [referendumInfoFromSubscan]);

  if (!isOngoing) {
    return null;
  }

  return (
    <Grid alignItems={decisionUnitPassed || confirmUnitPassed ? 'center' : 'end'} container item justifyContent='space-between' sx={{ p: '10px 25px', bgcolor: 'background.paper', borderRadius: '10px', mb: '10px' }} xs={12}>
      <Grid item>
        <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
          {status || t('Status')}
        </Typography>
      </Grid>
      <Grid item>
        <Infotip iconLeft={2} iconTop={3} showQuestionMark text={remainingTime(remainingBlocks) || t('Calculating ...')}>
          <Grid item sx={{ pr: '5px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 400 }}>
              {status === t('Preparing') &&
                <ShowValue value={prepareUnitPassed && track?.[1]?.preparePeriod ? `${blockToUnit(track?.[1]?.preparePeriod)} ${prepareUnitPassed} of ${blockToX(track?.[1]?.preparePeriod, true)}` : undefined} />
              }
              {status === t('Deciding') &&
                <ShowValue value={decisionUnitPassed && track?.[1]?.decisionPeriod ? `${blockToUnit(track?.[1]?.decisionPeriod)} ${decisionUnitPassed} of ${blockToX(track?.[1]?.decisionPeriod, true)}` : undefined} />
              }
              {status === t('Confirming') &&
                <ShowValue value={confirmUnitPassed && track?.[1]?.confirmPeriod ? `${blockToUnit(track?.[1]?.confirmPeriod)} ${confirmUnitPassed} of ${blockToX(track?.[1]?.confirmPeriod, true)}` : undefined} />
              }
              {!status &&
                <ShowValue value={undefined} />
              }
            </Typography>
          </Grid>
        </Infotip>
      </Grid>
    </Grid>
  );
}
