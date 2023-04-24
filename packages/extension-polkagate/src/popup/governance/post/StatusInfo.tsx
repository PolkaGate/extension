// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';

import { Infotip, ShowValue } from '../../../components';
import { useCurrentBlockNumber, useTranslation } from '../../../hooks';
import { Track } from '../../../hooks/useTracks';
import { ReferendumSubScan } from '../utils/types';
import { blockToUnit, blockToX, getPeriodScale } from '../utils/util';
import { remainingTime } from '../../../util/utils';

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
    if (referendumInfoFromSubscan?.status === 'Decision') {
      return t('Deciding');
    }

    if (referendumInfoFromSubscan?.status === 'ConfirmStarted') {
      return t('Confirming');
    }

    if (referendumInfoFromSubscan?.status === 'Executed') {
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

  const confirmUnitPassed = useMemo(() => {
    if (track?.[1]?.confirmPeriod && referendumInfoFromSubscan?.timeline[2]?.block && currentBlock) {
      const confirmStartBlock = referendumInfoFromSubscan.timeline[1].block;
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

  return (
    <Grid alignItems={decisionUnitPassed || confirmUnitPassed ? 'center' : 'end'} container item justifyContent='space-between' sx={{ p: '10px 25px', bgcolor: 'background.paper', borderRadius: '10px', mt: '10px' }} xs={12}>
      <Grid item>
        <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>
          {status || t('Status')}
        </Typography>
      </Grid>
      <Grid item sx={{ pr: '5px' }}>
        <Infotip iconLeft={1} iconTop={0} showQuestionMark text={remainingTime(remainingBlocks)}>
          <Typography sx={{ fontSize: '18px', fontWeight: 400 }}>
            {status === t('Deciding')
              ? <ShowValue value={decisionUnitPassed && track?.[1]?.decisionPeriod ? `${blockToUnit(track?.[1]?.decisionPeriod)} ${decisionUnitPassed} of ${blockToX(track?.[1]?.decisionPeriod, true)}` : undefined} />
              : <ShowValue value={confirmUnitPassed && track?.[1]?.confirmPeriod ? `${blockToUnit(track?.[1]?.confirmPeriod)} ${confirmUnitPassed} of ${blockToX(track?.[1]?.confirmPeriod, true)}` : undefined} />
            }
          </Typography>
        </Infotip>
      </Grid>
    </Grid>
  );
}
