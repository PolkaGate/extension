// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Edit2 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks/index';
import { SharePopup } from '@polkadot/extension-polkagate/src/partials/index';
import { ExportAccountsBody } from '@polkadot/extension-polkagate/src/popup/settings/accountSettings/Export';

interface Props {
  address: string | undefined;
  name: string | undefined;
  setPopup: React.Dispatch<React.SetStateAction<any | undefined>>;
  open: any | undefined;
}

function ExportAccount ({ address, name, open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    setPopup(undefined);
  }, [setPopup]);

  return (
    <SharePopup
      modalProps={{ showBackIconAsClose: true }}
      modalStyle={{ minHeight: '200px' }}
      onClose={handleClose}
      open={open !== undefined}
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
