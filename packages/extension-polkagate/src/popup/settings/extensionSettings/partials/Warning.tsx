// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { DecisionButtons, ExtensionPopup } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { ExtensionPopups } from '../../../../util/constants';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  open: boolean;
  onConfirm: () => void
}

function Warning ({ onConfirm, open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();

  const onClose = useCallback(() => setPopup(ExtensionPopups.NONE), [setPopup]);

  return (
    <ExtensionPopup
      TitleIcon={Warning2}
      handleClose={onClose}
      iconColor='#FFCE4F'
      iconSize={48}
      openMenu={open}
      pt={170}
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
        <DecisionButtons
          direction='vertical'
          onPrimaryClick={onConfirm}
          onSecondaryClick={onClose}
          primaryBtnText={t('Confirm')}
          secondaryBtnText={t('Reject')}
          style={{ marginTop: '30px', width: '92%' }}
        />
      </Grid>
    </ExtensionPopup>
  );
}

export default Warning;
