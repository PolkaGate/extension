// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { Infotip2 } from '../../../../components';
import { useTranslation } from '../../../../hooks';

interface Props {
  setOpenDecisionDeposit: React.Dispatch<React.SetStateAction<boolean | undefined>>
  style?: SxProps;

}

export default function PayDecisionDeposit({ setOpenDecisionDeposit, style }: Props): React.ReactElement | null {
  const { t } = useTranslation();
  const theme = useTheme();
  const onDecisionDeposit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDecisionDeposit(true);
  }, [setOpenDecisionDeposit]);

  return (
    <Grid container item sx={{ pb: '10px', pt: '20px', ...style }}>
      <Infotip2 showQuestionMark text={t('A decision deposit is required to advance to the deciding state, and it is refundable once the referendum concludes.')}>
        <Typography onClick={onDecisionDeposit} sx={{ color: theme.palette.mode === 'light' ? 'secondary.main' : 'text.primary', cursor: 'pointer', textDecorationLine: 'underline' }}>
          {t('Pay Deposit')}
        </Typography>
      </Infotip2>
    </Grid>
  );
}
