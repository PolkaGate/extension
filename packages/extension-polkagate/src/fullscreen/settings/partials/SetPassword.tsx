// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import React from 'react';

import ManagePassword from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/ManagePassword';

import { DraggableModal } from '../../../fullscreen/components/DraggableModal';
import { useTranslation } from '../../../hooks';

interface Props {
  onClose: ExtensionPopupCloser;
  openMenu: boolean;
}

function SetPassword ({ onClose, openMenu }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <DraggableModal
      onClose={onClose}
      open={openMenu}
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px' }}
      title={t('Change password')}
    >
      <ManagePassword onBack={onClose} />
    </DraggableModal>
  );
}

export default SetPassword;
