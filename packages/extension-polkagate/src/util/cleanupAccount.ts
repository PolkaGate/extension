// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationSettingType } from '../popup/notification/hook/useNotificationSettings';

import { getAuthList, updateAuthorization } from '../messaging';
import { STORAGE_KEY } from './constants';
import { getStorage, setStorage } from '.';

/**
 * Removes a specified address from the notification settings accounts list.
 *
 * @param address - The address to remove from notification settings
 * @returns Promise that resolves when the cleanup operation completes
 */
export async function cleanupNotificationAccount (address: string): Promise<void> {
  const notificationSettings = await getStorage(STORAGE_KEY.NOTIFICATION_SETTINGS) as NotificationSettingType | null | undefined;

  // Early return if no settings exist
  if (!notificationSettings?.accounts) {
    return;
  }

  const { accounts } = notificationSettings;

  // Check if address exists in the accounts list
  if (!accounts.includes(address)) {
    return;
  }

  // Filter out the specified address
  const updatedAccounts = accounts.filter((account) => account !== address);
  const updatedSettings = { ...notificationSettings, accounts: updatedAccounts };

  // Persist updated settings
  try {
    await setStorage(STORAGE_KEY.NOTIFICATION_SETTINGS, updatedSettings);
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    throw error; // Re-throw to allow caller to handle the error
  }
}

/**
 * Removes a specific account address from all authorized dApp connections.
 *
 * This function iterates through all dApps that have been granted authorization
 * and removes the specified account address from their authorized accounts list.
 *
 * @param address - The account address to remove from all dApp authorizations.
 *
 * @returns A promise that resolves when the cleanup operation is complete.
 *          Returns immediately if no authorized dApps exist or address is not found.
 */
export async function cleanupAuthorizedAccount (address: string): Promise<void> {
  // Input validation
  if (!address || typeof address !== 'string') {
    return;
  }

  const authorizedDapps = await getAuthList();
  const authorizedDappsList = Object.values(authorizedDapps.list);

  if (authorizedDappsList.length === 0) {
    return;
  }

  // Filter dApps that contain the target address
  const dappsToUpdate = authorizedDappsList.filter(({ authorizedAccounts }) =>
    authorizedAccounts.some((account) => account === address)
  );

  if (dappsToUpdate.length === 0) {
    return;
  }

  // Update all affected dApps in parallel with error handling
  const updatePromises = dappsToUpdate.map(async ({ authorizedAccounts, id }) => {
    try {
      const filteredAccounts = authorizedAccounts.filter((account) => account !== address);

      await updateAuthorization(filteredAccounts, id);
    } catch (error) {
      console.error(`Failed to update authorization for dApp ${id}:`, error);
    }
  });

  await Promise.allSettled(updatePromises);
}
