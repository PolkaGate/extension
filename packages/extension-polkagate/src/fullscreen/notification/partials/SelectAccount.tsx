// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import SelectNotificationAccountsBody from '@polkadot/extension-polkagate/src/popup/notification/partials/SelectNotificationAccountsBody';

import { Motion } from '../../../components';

interface Props {
  onAccounts: (addresses: string[]) => () => void;
  previousSelectedAccounts: string[] | undefined;
}

/**
 * A component for selecting an account. It allows the user to choose
 * which accounts to see their notifications for.
 */
function SelectAccount({ onAccounts, previousSelectedAccounts }: Props): React.ReactElement {
  return (
    <Motion variant='slide'>
      <SelectNotificationAccountsBody
        onAccounts={onAccounts}
        previousSelectedAccounts={previousSelectedAccounts}
      />
    </Motion>
  );
}

export default React.memo(SelectAccount);
