// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { Infotip2 } from '../../../../components';
import { useTranslation } from '../../../../hooks';

interface Props {
  setOpenDecisionDeposit: React.Dispatch<React.SetStateAction<boolean | undefined>>
  style?: SxProps;

}

export default function PayDecisionDeposit({ setOpenDecisionDeposit, style }: Props): React.ReactElement | null {
  const { t } = useTranslation();
  const onDecisionDeposit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('openDecisionDeposit::::::');

    setOpenDecisionDeposit(true);
  }, [setOpenDecisionDeposit]);

  return (
    <Grid container item sx={{ pt: '20px', pb: '10px', ...style }}>
      <Infotip2 iconLeft={2} iconTop={3} showQuestionMark text={t('A decision deposit is required to advance to the deciding state, and it is refundable once the referendum concludes.')}>
        <Typography onClick={onDecisionDeposit} sx={{ color: 'primary.main', cursor: 'pointer', textDecorationLine: 'underline' }}>
          {t('Pay Decision Deposit')}
        </Typography>
      </Infotip2>
    </Grid>
  );
}
