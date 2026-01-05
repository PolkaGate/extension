// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React from 'react';

import { SharePopup } from '@polkadot/extension-polkagate/src/partials';

import { DecisionButtons } from '../../../components';
import { useIsExtensionPopup, useTranslation } from '../../../hooks';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
  onConfirm: () => void
}

function Warning ({ onClose, onConfirm, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  return (
    <SharePopup
      modalProps={{
        dividerStyle: { margin: '5px 0 o' },
        showBackIconAsClose: true,
        style: { minHeight: '200px' }
      }}
      modalStyle={{ minHeight: '200px' }}
      onClose={onClose}
      open={open}
      popupProps={{
        TitleIcon: Warning2,
        iconColor: '#FFCE4F',
        iconSize: 48,
        pt: 170,
        titleDirection: 'column',
        titleStyle: { pt: '12px' },
        titleVariant: 'H-2',
        withGradientBorder: true,
        withoutTopBorder: true
      }}
      title={t('Warning')}
    >
      <Stack direction='column' sx={{ alignItems: 'center', position: 'relative', px: '15px', py: '5px', zIndex: 1 }}>
        {!isExtension &&
          <Warning2 color='#FFCE4F' size='80' style={{ margin: '15px 0' }} variant='Bold' />
        }
        <Typography color='#BEAAD8' sx={{ width: '84%' }} variant='B-4'>
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
    </SharePopup>
  );
}

export default Warning;
