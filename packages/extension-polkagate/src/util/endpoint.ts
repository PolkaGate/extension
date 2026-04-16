// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const isRateLimitedNumericWsEndpoint = (value: string): boolean => /^wss:\/\/\d+$/.test(value);

export const isOnFinalityEndpoint = (value: string): boolean => value.includes('onfinality');

export const isLightClientEndpoint = (value: string): boolean => value.startsWith('light');

export const shouldSkipEndpointOption = (value: string): boolean =>
  isRateLimitedNumericWsEndpoint(value) ||
  isOnFinalityEndpoint(value) ||
  isLightClientEndpoint(value);
