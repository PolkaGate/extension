// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';

import ManagePassword from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/ManagePassword';

import { DraggableModal } from '../../../fullscreen/components/DraggableModal';
import { useTranslation } from '../../../hooks';
import { ExtensionPopups } from '../../../util/constants';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  openMenu: boolean;
}

function SetPassword ({ openMenu, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();

  const handleClose = useCallback(() => setPopup(ExtensionPopups.NONE), [setPopup]);

  return (
    <DraggableModal
      onClose={handleClose}
      open={openMenu}
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px' }}
      title={t('Change password')}
    >
      <ManagePassword onBack={handleClose} />
    </DraggableModal>
  );
}

export default SetPassword;
