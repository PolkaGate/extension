// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { useTranslation } from '../../components/translate';

interface Props {
  index: number;
  totalItems: number;
  onNextClick: () => void;
  onPreviousClick: () => void;
}

export default function TransactionIndex ({ index, onNextClick, onPreviousClick, totalItems }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const previousClickActive = index !== 0;
  const nextClickActive = index < totalItems - 1;

  const prevClick = useCallback((): void => {
    previousClickActive && onPreviousClick();
  }, [onPreviousClick, previousClickActive]);

  const nextClick = useCallback((): void => {
    nextClickActive && onNextClick();
  }, [nextClickActive, onNextClick]);

  return (
    <Grid alignItems='center' container justifyContent='space-between' m='0'>
      <Grid alignItems='center' container item justifyContent='flex-start' maxWidth='35%' onClick={prevClick} sx={{ cursor: index === 0 ? 'default' : 'pointer' }} width='fit_content'>
        <KeyboardDoubleArrowLeftIcon sx={{ color: index === 0 ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
        <Typography color={index === 0 ? 'secondary.contrastText' : 'secondary.light'} lineHeight='normal' variant='S-1'>
          {t('Previous')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' width='30%'>
        <Typography variant='S-1'>
          {`${index + 1} of ${totalItems}`}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' maxWidth='35%' onClick={nextClick} sx={{ cursor: index + 1 === totalItems ? 'default' : 'pointer' }} width='fit_content'>
        <Typography color={index + 1 === totalItems ? 'secondary.contrastText' : 'secondary.light'} lineHeight='normal' textAlign='left' variant='S-1'>
          {t('Next')}
        </Typography>
        <KeyboardDoubleArrowRightIcon sx={{ color: index + 1 === totalItems ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
      </Grid>
    </Grid>
  );
}
