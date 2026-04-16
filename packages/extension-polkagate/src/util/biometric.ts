// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestBiometricEnable, RequestBiometricUnlock } from '@polkadot/extension-base/utils/biometric';

const WEBAUTHN_CHALLENGE_LENGTH = 32;
const BIOMETRIC_PRF_UNAVAILABLE_ERROR = 'Biometric PRF is unavailable on this browser or platform authenticator.';

type PublicKeyCredentialWithPrf = PublicKeyCredential & {
  getClientExtensionResults: () => {
    prf?: {
      enabled?: boolean;
      results?: {
        first?: ArrayBuffer;
      };
    };
  };
};

type PublicKeyCredentialWithCapabilities = typeof PublicKeyCredential & {
  getClientCapabilities?: () => Promise<Record<string, boolean>>;
};

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

function randomBuffer(length: number): ArrayBuffer {
  return toArrayBuffer(crypto.getRandomValues(new Uint8Array(length)));
}

function bufferSourceToBytes(value: BufferSource): Uint8Array {
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
}

function bytesToBase64(value: BufferSource): string {
  const bytes = bufferSourceToBytes(value);

  return btoa(String.fromCharCode(...bytes));
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const decoded = atob(value);

  return toArrayBuffer(Uint8Array.from(decoded, (char) => char.charCodeAt(0)));
}

function getPrfOutput(credential: PublicKeyCredential | null): string | undefined {
  const results = (credential as PublicKeyCredentialWithPrf | null)?.getClientExtensionResults?.();
  const output = results?.prf?.results?.first;

  return output ? bytesToBase64(output) : undefined;
}

async function getPrfOutputFromAssertion(credentialId: string, prfSalt: string): Promise<string> {
  const assertion = await navigator.credentials.get({
    publicKey: {
      allowCredentials: [{
        id: base64ToArrayBuffer(credentialId),
        transports: ['internal'],
        type: 'public-key'
      }],
      challenge: randomBuffer(WEBAUTHN_CHALLENGE_LENGTH),
      extensions: {
        prf: {
          eval: {
            first: base64ToArrayBuffer(prfSalt)
          }
        }
      } as AuthenticationExtensionsClientInputs,
      timeout: 60000,
      userVerification: 'required'
    }
  }) as PublicKeyCredential | null;

  const prfOutput = getPrfOutput(assertion);

  if (!prfOutput) {
    throw new Error(BIOMETRIC_PRF_UNAVAILABLE_ERROR);
  }

  return prfOutput;
}

export async function isBiometricUnlockSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential || !navigator.credentials) {
    return false;
  }

  const hasPlatformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);

  if (!hasPlatformAuthenticator) {
    return false;
  }

  const capabilities = await (PublicKeyCredential as PublicKeyCredentialWithCapabilities).getClientCapabilities?.().catch(() => undefined);

  if (!capabilities) {
    return true;
  }

  return Boolean(capabilities['prf']);
}

export async function enrollBiometric(password: string): Promise<RequestBiometricEnable> {
  const prfSaltBytes = randomBuffer(32);
  const credential = await navigator.credentials.create({
    publicKey: {
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required'
      },
      attestation: 'none',
      challenge: randomBuffer(WEBAUTHN_CHALLENGE_LENGTH),
      extensions: {
        prf: {
          eval: {
            first: prfSaltBytes
          }
        }
      } as AuthenticationExtensionsClientInputs,
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      rp: {
        name: 'PolkaGate'
      },
      timeout: 60000,
      user: {
        displayName: 'PolkaGate Biometric Unlock',
        id: randomBuffer(32),
        name: 'PolkaGate Biometric Unlock'
      }
    }
  }) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Biometric enrollment was cancelled.');
  }

  const credentialId = bytesToBase64(credential.rawId);
  const prfSalt = bytesToBase64(prfSaltBytes);
  let prfOutput = getPrfOutput(credential);

  if (!prfOutput) {
    try {
      prfOutput = await getPrfOutputFromAssertion(credentialId, prfSalt);
    } catch (error) {
      throw new Error((error as Error).message || BIOMETRIC_PRF_UNAVAILABLE_ERROR);
    }
  }

  return {
    credentialId,
    password,
    prfOutput,
    prfSalt
  };
}

export async function unlockWithBiometric(cacheTime: number, credentialId: string, prfSalt: string): Promise<RequestBiometricUnlock> {
  const prfOutput = await getPrfOutputFromAssertion(credentialId, prfSalt);

  return {
    cacheTime,
    credentialId,
    lazy: true,
    prfOutput
  };
}
