// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationSettingType } from '../popup/notification/hook/useNotificationSettings';

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
