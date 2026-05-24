// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Collapse, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { ArrowRight2, Discover } from 'iconsax-react';
import React, { useMemo } from 'react';

import { useTranslation } from '../../../../hooks';
import { LoadingPoolInformation } from './LoadingPoolInformation';

interface SelectedValidatorsInformationProps {
  validators: string[] | undefined;
  onClick: (event: React.MouseEvent) => void;
  open: boolean;
  isRecommended: boolean;
  isExtension: boolean;
}

export const SelectedValidatorsInformation = ({ isExtension, isRecommended, onClick, open, validators }: SelectedValidatorsInformationProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const textColor = useMemo(() => isExtension ? (isDark ? theme.palette.text.highlight : '#745D8B') : '#AA83DC', [isDark, isExtension, theme.palette.text.highlight]);
  const rowBg = isDark ? '#1B133C' : '#F1ECFA';
  const actionBg = isDark ? '#2D1E4A' : '#E4D9F2';
  const recommendedColor = isDark ? '#82FFA5' : theme.palette.success.main;

  return (
    <Collapse in={open}>
      {validators
        ? (
          <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', bgcolor: rowBg, borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'row', p: '2px', pl: '16px' }}>
            <Discover color={textColor} size='24' variant='Bulk' />
            <Stack direction='column' sx={{ ml: '10px', mr: 'auto', width: 'fit-content' }}>
              <Typography color='text.primary' sx={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'noWrap' }} variant='B-2'>
                {`${validators.length} ` + t('Validators')}
              </Typography>
              {isRecommended &&
                <Typography color={recommendedColor} textAlign='left' variant='B-5'>
                  {t('Recommended')}
                </Typography>}
            </Stack>
            <Grid container item sx={{ bgcolor: actionBg, borderRadius: '6px', p: '20px 10px', width: 'fit-content' }}>
              <ArrowRight2 color={textColor} size='18' variant='Bold' />
            </Grid>
          </Container>)
        : <LoadingPoolInformation />}
    </Collapse>
  );
};
