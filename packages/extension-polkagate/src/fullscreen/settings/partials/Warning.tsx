// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React from 'react';

import { DecisionButtons } from '../../../components';
import { useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
  onConfirm: () => void
}

function Warning ({ onClose, onConfirm, open }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <DraggableModal
      dividerStyle={{ margin: '5px 0 0' }}
      onClose={onClose}
      open={open}
      showBackIconAsClose
      style={{ minHeight: '200px' }}
      title={t('Warning')}
    >
      <Stack direction='column' sx={{ alignItems: 'center', position: 'relative', px: '15px', py: '5px', zIndex: 1 }}>
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
