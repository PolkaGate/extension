// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '../../../util/handleExtensionPopup';

import { UserOctagon } from 'iconsax-react';
import React from 'react';

import { ExtensionPopup } from '../../../components';
import { useTranslation } from '../../../hooks';
import SelectNotificationAccountsBody from './SelectNotificationAccountsBody';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
  onAccounts: (addresses: string[]) => () => void;
  previousSelectedAccounts: string[] | undefined;
}

/**
 * A component for selecting an account. It allows the user to choose
 * which accounts to see their notifications for.
 *
 * Only has been used in extension mode!
 */
function SelectAccount({ onAccounts, onClose, open, previousSelectedAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <ExtensionPopup
      TitleIcon={UserOctagon}
      handleClose={onClose}
      iconSize={24}
      openMenu={open}
      pt={20}
      style={{ '> div#container': { pt: '8px' } }}
      title={t('Accounts')}
      withoutTopBorder
    >
      <SelectNotificationAccountsBody
        onAccounts={onAccounts}
        previousSelectedAccounts={previousSelectedAccounts}
      />
    </ExtensionPopup>
  );
}

export default React.memo(SelectAccount);
