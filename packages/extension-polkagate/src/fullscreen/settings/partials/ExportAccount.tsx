// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Edit2 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks/index';
import { SharePopup } from '@polkadot/extension-polkagate/src/partials/index';
import { ExportAccountsBody } from '@polkadot/extension-polkagate/src/popup/settings/accountSettings/Export';

interface Props {
  address: string | undefined;
  name: string | undefined;
  onClose: ExtensionPopupCloser;
}

/**
 * Displays a popup modal for exporting an account, showing account details and export options.
 *
 * Only has been used in full-screen mode!
 */
function ExportAccount({ address, name, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <SharePopup
      modalProps={{ showBackIconAsClose: true }}
      modalStyle={{ minHeight: '200px' }}
      onClose={handleClose}
      open
      popupProps={{ TitleIcon: Edit2, iconSize: 24, pt: 185 }}
      title={t('Export Account')}
    >
      <ExportAccountsBody
        address={address}
        name={name}
        onBack={handleClose}
      />
    </SharePopup>
  );
}

export default React.memo(ExportAccount);
