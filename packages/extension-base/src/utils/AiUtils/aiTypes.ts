// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface EnrichedTx {
  type: 'KNOWN' | 'GENERIC';
  summaryHint?: string;
  data: Record<string, any>;
}

export type AiTxAnyJson = Record<string, any>;

export type TxHandler = (tx: AiTxAnyJson) => EnrichedTx | null;
