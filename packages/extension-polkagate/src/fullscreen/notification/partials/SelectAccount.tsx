// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { MAX_ACCOUNT_COUNT_NOTIFICATION } from '@polkadot/extension-polkagate/src/popup/notification/constant';
import AccountToggle from '@polkadot/extension-polkagate/src/popup/notification/partials/AccountToggle';

import { AccountContext, GradientButton, GradientDivider, Motion } from '../../../components';
import { useTranslation } from '../../../hooks';

interface Props {
  onAccounts: (addresses: string[]) => () => void;
  previousSelectedAccounts: string[] | undefined;
}

/**
 * A component for selecting an account. It allows the user to choose
 * which accounts to see their notifications for.
 *
 * Only has been used in extension mode!
 */
function SelectAccount ({ onAccounts, previousSelectedAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(previousSelectedAccounts ?? []);

  // Ensure state updates when previousSelectedAccounts changes
  useEffect(() => {
    if (previousSelectedAccounts) {
      const validSelectedAccounts = previousSelectedAccounts.filter((selectedAddress) => accounts.find(({ address }) => selectedAddress === address));

      setSelectedAccounts(validSelectedAccounts);
    }
  }, [accounts, previousSelectedAccounts]);

  // Handles selecting or deselecting an account
  const handleSelect = useCallback((newSelect: string) => {
    setSelectedAccounts((prev) => {
      const alreadySelected = prev.includes(newSelect);

      if (alreadySelected) {
        // If the account is already selected, remove it
        return prev.filter((address) => address !== newSelect);
      }

      // Prevent adding more than the max allowed
      if (prev.length >= MAX_ACCOUNT_COUNT_NOTIFICATION) {
        return prev; // return unchanged state
      }

      // Otherwise, add the new account
      return [...prev, newSelect];
    });
  }, [setSelectedAccounts]);

  return (
    <Motion variant='slide'>
      <Stack direction='column' sx={{ gap: '12px', position: 'relative', px: '5px', zIndex: 1 }}>
        <Typography color='text.secondary' variant='B-4'>
          {t('Select up to {{count}} accounts for activity notifications', {
            replace: { count: MAX_ACCOUNT_COUNT_NOTIFICATION }
          })}      </Typography>
        <GradientDivider />
        <Stack direction='column' sx={{ gap: '12px', height: '385px', maxHeight: '385px', overflowY: 'auto', px: '6px' }}>
          {accounts.map(({ address }) => {
            const isSelected = selectedAccounts.includes(address);

            return (
              <AccountToggle
                address={address}
                checked={isSelected}
                key={address}
                onSelect={handleSelect}
              />
            );
          })}
        </Stack>
        <GradientButton
          disabled={selectedAccounts.length === 0}
          onClick={onAccounts(selectedAccounts)}
          style={{ marginTop: '10px' }}
          text={t('Apply')}
        />
      </Stack>
    </Motion>
  );
}

export default React.memo(SelectAccount);
