// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { DecisionButtons } from '../../../components';
import { useTranslation } from '../../../hooks';
import { ExtensionPopups } from '../../../util/constants';
import { DraggableModal } from '../../components/DraggableModal';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  open: boolean;
  onConfirm: () => void
}

function Warning ({ onConfirm, open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();

  const onClose = useCallback(() => setPopup(ExtensionPopups.NONE), [setPopup]);

  return (
    <DraggableModal
      dividerStyle={{ margin: '5px 0 0' }}
      onClose={onClose}
      open={open}
      showBackIconAsClose
      style={{ minHeight: '200px' }}
      title={t('Warning')}
    >
      <Stack direction='column' sx={{ alignItems: 'center', position: 'relative', py: '5px', px: '15px', zIndex: 1 }}>
        <Warning2 color='#FFCE4F' size='80' style={{ margin: '15px 0' }} variant='Bold' />
        <Typography color='#BEAAD8' sx={{ width: '72%' }} variant='B-4'>
          {t('Enabling testnet chains may cause instability or crashes since they`re meant for testing. Proceed with caution. If issues arise, return here to disable the option.')}
        </Typography>
        <DecisionButtons
          direction='vertical'
          onPrimaryClick={onConfirm}
          onSecondaryClick={onClose}
          primaryBtnText={t('Confirm')}
          secondaryBtnText={t('Reject')}
          style={{ marginTop: '25px', width: '92%' }}
        />
      </Stack>
    </DraggableModal>
  );
}

export default Warning;
