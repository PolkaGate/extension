// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Check as CheckIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React from 'react';

import { PButton } from '../../components';
import { useTranslation } from '../../hooks';
import { STEPS } from './constants';

interface Props {
  step: number | undefined;
  onBackClick: () => void
}

function Confirmation({ onBackClick, step }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <Grid container justifyContent='center' sx={{ mt: '50px' }}>
        <CheckIcon
          sx={{
            bgcolor: 'success.main',
            borderRadius: '50%',
            color: 'white',
            fontSize: 50,
            stroke: 'white'
          }}
        />
        <Grid container justifyContent='center' pt='10px'>
          <Typography variant='body1'>
            {step === STEPS.NEW_PASSWORD_SET
              ? t('Password has been set successfully!')
              : t('Password has been REMOVED successfully!')
            }
          </Typography>
        </Grid>
      </Grid>
      <Grid container justifyContent='center' sx={{ display: 'block', px: '10%', pt: '180px' }}>
        <PButton
          _ml={0}
          _onClick={onBackClick}
          _width={80}
          text={t('Done')}
        />
      </Grid>
    </>
  );
}

export default Confirmation;
