// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Text } from '@polkadot/types';

import { sanitizeChainName } from './chain';

interface Meta {
  docs: Text[];
}

function splitSingle(value: string[], sep: string): string[] {
  return value.reduce((result: string[], value: string): string[] => {
    return value.split(sep).reduce((result: string[], value: string) => result.concat(value), result);
  }, []);
}

function splitParts(value: string): string[] {
  return ['[', ']'].reduce((result: string[], sep) => splitSingle(result, sep), [value]);
}

export function prepareMetaData(chain: Chain | null | string, label: string, metaData: unknown): string {
  const chainName = sanitizeChainName((chain as Chain)?.name) ?? chain;

  if (label === 'balances') {
    const { balances, decimals, tokens } = metaData as { balances: DeriveBalancesAll, tokens: string[], decimals: number[] };

    metaData = {
      availableBalance: balances.availableBalance.toString(),
      decimals,
      freeBalance: balances.freeBalance.toString(),
      // frozenFee: balances.frozenFee.toString(),
      // frozenMisc: balances.frozenMisc.toString(),
      lockedBalance: balances.lockedBalance.toString(),
      reservedBalance: balances.reservedBalance.toString(),
      tokens,
      vestedBalance: balances.vestedBalance.toString(),
      vestedClaimable: balances.vestedClaimable.toString(),
      votingBalance: balances.votingBalance.toString()
    };
  }

  return JSON.stringify({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    [label]: JSON.stringify({ chainName, metaData })
  });
}

export function formatMeta(meta?: Meta): string[] | null {
  if (!meta?.docs.length) {
    return null;
  }

  const strings = meta.docs.map((d) => d.toString().trim());
  const firstEmpty = strings.findIndex((d) => !d.length);
  const combined = (
    firstEmpty === -1
      ? strings
      : strings.slice(0, firstEmpty)
  ).join(' ').replace(/#(<weight>| <weight>).*<\/weight>/, '');
  const parts = splitParts(combined.replace(/\\/g, '').replace(/`/g, ''));

  return parts;
}
