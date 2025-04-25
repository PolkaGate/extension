// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { TwoButtons, Warning } from '../../../components';
import { setStorage } from '../../../components/Loading';
import { useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';

interface Props {
  open: boolean;
  setDisplayPopup: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTestnetEnabled: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

export default function EnableTestNetsModal({ open, setDisplayPopup, setIsTestnetEnabled }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const backToAccount = useCallback(() => setDisplayPopup(false), [setDisplayPopup]);

  const onEnableTestnetConfirm = useCallback(() => {
    setDisplayPopup(false);
    setIsTestnetEnabled(true);
    setStorage('testnet_enabled', true).catch(console.error);
  }, [setDisplayPopup, setIsTestnetEnabled]);

  return (
    <DraggableModal minHeight={200} onClose={backToAccount} open={open}>
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Warning')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={backToAccount} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Grid container sx={{ '> div': { pl: 0, pt: '50px' }, textAlign: 'justify' }}>
          <Warning
            fontSize='16px'
            iconDanger
            isBelowInput
            marginTop={0}
            theme={theme}
          >
            {t('Enabling testnet chains may cause instability or crashes since they\'re meant for testing. Proceed with caution. If issues arise, return here to disable the option.')}
          </Warning>
        </Grid>
        <Grid container item sx={{ '> button': { m: 'auto', position: 'initial' }, mt: '15px' }}>
          <TwoButtons
            mt='55px'
            onPrimaryClick={onEnableTestnetConfirm}
            onSecondaryClick={backToAccount}
            primaryBtnText={t<string>('Confirm')}
            secondaryBtnText={t<string>('Reject')}
          />
        </Grid>
      </>
    </DraggableModal>
  );
}
