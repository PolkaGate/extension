// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '../../../util/handleExtensionPopup';

import { Stack, Typography } from '@mui/material';
import { UserOctagon } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext, ExtensionPopup, GradientButton, GradientDivider } from '../../../components';
import { useTranslation } from '../../../hooks';
import { MAX_ACCOUNT_COUNT_NOTIFICATION } from '../constant';
import AccountToggle from './AccountToggle';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
  onAccounts: (addresses: string[]) => () => void;
  previousState: string[] | undefined;
}

/**
 * A component for selecting an account. It allows the user to choose
 * which accounts to see their notifications for.
 *
 * Only has been used in extension mode!
 */
function SelectAccount ({ onAccounts, onClose, open, previousState }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(previousState ?? []);

  // Ensure state updates when previousState changes
  useEffect(() => {
    if (previousState) {
      setSelectedAccounts(previousState);
    }
  }, [previousState]);

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
      <Stack direction='column' sx={{ gap: '12px', position: 'relative', zIndex: 1 }}>
        <Typography color='text.secondary' variant='B-4'>
          {t('Select up to 3 accounts to be notified when account activity')}
        </Typography>
        <GradientDivider />
        <Stack direction='column' sx={{ gap: '10px', height: '330px', maxHeight: '330px', overflowY: 'auto', px: '6px' }}>
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
    </ExtensionPopup>
  );
}

export default React.memo(SelectAccount);
