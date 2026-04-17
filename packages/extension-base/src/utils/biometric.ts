// Copyright 2019-2026 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const BIOMETRIC_STORAGE_KEY = 'biometricUnlock';
export const BIOMETRIC_PENDING_CREDENTIAL_ID_STORAGE_KEY = 'biometricUnlockPendingCredentialId';
export const BIOMETRIC_USER_ID_STORAGE_KEY = 'biometricUnlockUserId';
export const BIOMETRIC_PRF_INFO = 'polkagate-biometric-unlock';

export interface BiometricEnrollmentData {
  credentialId: string;
  createdAt: number;
  encryptedPassword: string;
  iv: string;
  prfSalt: string;
  version: 1;
}

export interface ResponseBiometricStatus {
  credentialId?: string;
  enabled: boolean;
  prfSalt?: string;
}

export interface RequestBiometricEnable {
  credentialId: string;
  password: string;
  prfOutput: string;
  prfSalt: string;
}

export interface RequestBiometricUnlock {
  cacheTime: number;
  credentialId: string;
  lazy?: boolean;
  prfOutput: string;
}
