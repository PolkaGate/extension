// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';

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

export default function StatusInfo({ address, referendumInfoFromSubscan, track }: Props): React.ReactElement {
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
    }
  }, [referendumInfoFromSubscan, t]);

  const decisionUnitPassed = useMemo(() => {
    if (track?.[1]?.decisionPeriod && referendumInfoFromSubscan?.timeline[1]?.block && currentBlock) {
      const decisionStartBlock = referendumInfoFromSubscan.timeline[1].block;
      const decisionPeriodInBlock = Number(track[1].decisionPeriod);
      const decisionEndBlock = decisionStartBlock + decisionPeriodInBlock;

      if (currentBlock > decisionEndBlock) {
        return null; // finished
      }

      const diff = currentBlock - decisionStartBlock;

      setRemainingBlocks(decisionEndBlock - currentBlock);
      const unitToEndOfDecision = Math.ceil(diff / getPeriodScale(decisionPeriodInBlock));

      return unitToEndOfDecision;
    }
  }, [track, referendumInfoFromSubscan, currentBlock]);

  const prepareUnitPassed = useMemo(() => {
    if (track?.[1]?.preparePeriod && referendumInfoFromSubscan?.timeline[0]?.block && currentBlock) {
      const prepareStartBlock = referendumInfoFromSubscan.timeline[0].block;
      const preparePeriodInBlock = Number(track[1].preparePeriod);
      const prepareEndBlock = prepareStartBlock + preparePeriodInBlock;

      if (currentBlock > prepareEndBlock) {
        return null; // finished
      }

      const diff = currentBlock - prepareStartBlock;

      setRemainingBlocks(prepareEndBlock - currentBlock);
      const unitToEndPrepare = Math.ceil(diff / getPeriodScale(preparePeriodInBlock));

      return unitToEndPrepare;
    }
  }, [track, referendumInfoFromSubscan, currentBlock]);

  const confirmUnitPassed = useMemo(() => {
    if (track?.[1]?.confirmPeriod && referendumInfoFromSubscan?.timeline[2]?.block && currentBlock) {
      const confirmStartBlock = referendumInfoFromSubscan.timeline[2].block;
      const confirmPeriodInBlock = Number(track[1].confirmPeriod);
      const confirmEndBlock = confirmStartBlock + confirmPeriodInBlock;

      if (currentBlock > confirmEndBlock) {
        return null; // finished
      }

      const diff = currentBlock - confirmStartBlock;

      setRemainingBlocks(confirmEndBlock - currentBlock);
      const unitToEndOfConfirm = Math.ceil(diff / getPeriodScale(confirmPeriodInBlock));

      return unitToEndOfConfirm;
    }
  }, [track, referendumInfoFromSubscan, currentBlock]);

  const isOngoing = useMemo(() => !['Executed', 'Rejected'].includes(referendumInfoFromSubscan?.status), [referendumInfoFromSubscan]);

  return (
    <>
      {isOngoing &&
        <Grid alignItems={decisionUnitPassed || confirmUnitPassed ? 'center' : 'end'} container item justifyContent='space-between' sx={{ p: '10px 25px', bgcolor: 'background.paper', borderRadius: '10px' }} xs={12}>
          <Grid item>
            <Infotip iconLeft={2} iconTop={10} showQuestionMark text={remainingTime(remainingBlocks) || t('Calculating ...')}>
              <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
                {status || t('Status')}
              </Typography>
            </Infotip>
          </Grid>
          <Grid item sx={{ pr: '5px' }}>
            {status === t('Preparing') &&
              <ShowValue value={prepareUnitPassed && track?.[1]?.preparePeriod ? `${blockToUnit(track?.[1]?.preparePeriod)} ${prepareUnitPassed} of ${blockToX(track?.[1]?.preparePeriod, true)}` : undefined} />
            }
            <Typography sx={{ fontSize: '18px', fontWeight: 400 }}>
              {status === t('Deciding') &&
                <ShowValue value={decisionUnitPassed && track?.[1]?.decisionPeriod ? `${blockToUnit(track?.[1]?.decisionPeriod)} ${decisionUnitPassed} of ${blockToX(track?.[1]?.decisionPeriod, true)}` : undefined} />
              }
              {status === t('Confirming') &&
                <ShowValue value={confirmUnitPassed && track?.[1]?.confirmPeriod ? `${blockToUnit(track?.[1]?.confirmPeriod)} ${confirmUnitPassed} of ${blockToX(track?.[1]?.confirmPeriod, true)}` : undefined} />
              }
            </Typography>
          </Grid>
        </Grid>
      }
    </>
  );
}
