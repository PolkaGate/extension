// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { ExtensionPopup, GradientButton, NeonButton } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { WelcomeHeaderPopups } from '../../../../partials/WelcomeHeader';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<WelcomeHeaderPopups>>;
  open: boolean;
  onConfirm: () => void
}

function Warning ({ onConfirm, open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();

  const handleClose = useCallback(() => setPopup(WelcomeHeaderPopups.NONE), [setPopup]);

  return (
    <ExtensionPopup
      TitleIcon={Warning2}
      handleClose={handleClose}
      iconColor='#FFCE4F'
      iconSize={48}
      openMenu={open}
      pt={150}
      title={t('Warning')}
      titleDirection='column'
      titleStyle={{ pt: '12px' }}
      titleVariant='H-2'
      withGradientBorder
      withoutTopBorder
    >
      <Grid container item justifyContent='center' sx={{ position: 'relative', py: '5px', px: '15px', zIndex: 1 }}>
        <Typography variant='B-4'>
          {t('Enabling testnet chains may cause instability or crashes since they`re meant for testing. Proceed with caution. If issues arise, return here to disable the option.')}
        </Typography>
        <GradientButton
          contentPlacement='center'
          onClick={onConfirm}
          style={{
            height: '44px',
            marginTop: '20px',
            width: '278px'
          }}
          text={t('Confirm')}
        />
        <NeonButton
          contentPlacement='center'
          onClick={handleClose}
          style={{
            height: '44px',
            marginTop: '15px',
            width: '278px'
          }}
          text={t('Reject')}
        />
      </Grid>
    </ExtensionPopup>
  );
}

export default Warning;
