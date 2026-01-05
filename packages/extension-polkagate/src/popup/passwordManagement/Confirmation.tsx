// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import { Check as CheckIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React from 'react';

import { PButton } from '../../components';
import { useIsExtensionPopup, useTranslation } from '../../hooks';
import { STEPS } from './constants';

interface Props {
  step: number | undefined;
  onBackClick: () => void
}

function Confirmation({ onBackClick, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtensionMode = useIsExtensionPopup();

  return (
    <>
      <Grid container justifyContent='center' sx={{ mt: '50px' }}>
        <CheckIcon
          sx={{
            bgcolor: 'success.main',
            borderRadius: '50%',
            color: 'white',
            fontSize: isExtensionMode ? 50 : 80,
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
      <Grid container justifyContent='center' sx={{ bottom: '15px', height: '40px', ml: isExtensionMode ? '8%' : 0, position: 'absolute', width: isExtensionMode ? '84%' : '87%' }}>
        <PButton
          _ml={0}
          _mt='1px'
          _onClick={onBackClick}
          _width={100}
          text={t('Done')}
        />
      </Grid>
    </>
  );
}

export default Confirmation;
