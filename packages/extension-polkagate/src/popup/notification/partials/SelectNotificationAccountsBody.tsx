// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext, GradientButton, GradientDivider } from '../../../components';
import { useIsExtensionPopup, useTranslation } from '../../../hooks';
import { MAX_ACCOUNT_COUNT_NOTIFICATION } from '../constant';
import AccountToggle from './AccountToggle';

interface Props {
  onAccounts: (addresses: string[]) => () => void;
  previousSelectedAccounts: string[] | undefined;
}

function SelectNotificationAccountsBody({ onAccounts, previousSelectedAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
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
    <Stack direction='column' sx={{ gap: '12px', position: 'relative', px: isExtension ? 0 : '5px', zIndex: 1 }}>
      <Typography color='text.secondary' variant='B-4'>
        {t('Select up to {{count}} accounts for activity notifications', {
          replace: { count: MAX_ACCOUNT_COUNT_NOTIFICATION }
        })}
      </Typography>
      <GradientDivider />
      <Stack direction='column' sx={{ gap: isExtension ? '10px' : '12px', height: isExtension ? '330px' : '385px', maxHeight: isExtension ? '330px' : '385px', overflowY: 'auto', px: '6px' }}>
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
  );
}

export default React.memo(SelectNotificationAccountsBody);
