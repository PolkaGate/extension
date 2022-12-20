// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { useTranslation } from '../../components/translate';

interface Props {
  index: number;
  totalItems: number;
  onNextClick: () => void;
  onPreviousClick: () => void;
}

export default function TransactionIndex({ index, onNextClick, onPreviousClick, totalItems }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const previousClickActive = index !== 0;
  const nextClickActive = index < totalItems - 1;

  const prevClick = useCallback(
    (): void => {
      previousClickActive && onPreviousClick();
    },
    [onPreviousClick, previousClickActive]
  );

  const nextClick = useCallback(
    (): void => {
      nextClickActive && onNextClick();
    },
    [nextClickActive, onNextClick]
  );

  return (
    <Grid container justifyContent='space-between' m='15px auto 10px' width='92%'>
      <Grid alignItems='center' container item justifyContent='flex-start' maxWidth='35%' onClick={prevClick} sx={{ cursor: index === 0 ? 'default' : 'pointer' }} width='fit_content'>
        <KeyboardDoubleArrowLeftIcon sx={{ color: index === 0 ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
        <Divider orientation='vertical' sx={{ bgcolor: index === 0 ? 'secondary.contrastText' : 'text.primary', height: '22px', ml: '3px', mr: '7px', my: 'auto', width: '1px' }} />
        <Grid container item xs={7}>
          <Typography color={index === 0 ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400}>{t<string>('Previous')}</Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' width='30%'>
        <Typography fontSize='16px' fontWeight={400}>{`${index + 1} of ${totalItems}`}</Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' maxWidth='35%' onClick={nextClick} sx={{ cursor: index + 1 === totalItems ? 'default' : 'pointer' }} width='fit_content'>
        <Grid container item justifyContent='right' xs={7}>
          <Typography color={index + 1 === totalItems ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400} textAlign='left'>{t<string>('Next')}</Typography>
        </Grid>
        <Divider orientation='vertical' sx={{ bgcolor: index + 1 === totalItems ? 'secondary.contrastText' : 'text.primary', height: '22px', ml: '7px', mr: '3px', my: 'auto', width: '1px' }} />
        <KeyboardDoubleArrowRightIcon sx={{ color: index + 1 === totalItems ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
      </Grid>
    </Grid>
  );
}
