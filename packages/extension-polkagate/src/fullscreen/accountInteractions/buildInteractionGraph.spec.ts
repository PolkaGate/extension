// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../util/types';

import { buildInteractionGraph, normalizeAddress } from './buildInteractionGraph';

const SELECTED = '0x0000000000000000000000000000000000000000000000000000000000000001';
const BOB = '0x0000000000000000000000000000000000000000000000000000000000000002';
const CHARLIE = '0x0000000000000000000000000000000000000000000000000000000000000003';

const tx = (partial: Partial<TransactionDetail>): TransactionDetail => ({
  action: 'balances',
  amount: '1',
  date: 1,
  forAccount: SELECTED,
  from: { address: SELECTED, name: 'Selected' },
  success: true,
  to: { address: BOB, name: 'Bob' },
  token: 'DOT',
  ...partial
} as TransactionDetail);

describe('buildInteractionGraph', () => {
  it('builds a send-only edge', () => {
    const graph = buildInteractionGraph([tx({ amount: '2.5' })], SELECTED);
    const bobId = normalizeAddress(BOB);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.links).toHaveLength(1);
    expect(graph.links[0]).toMatchObject({
      direction: 'sent',
      failedCount: 0,
      receivedCount: 0,
      sentCount: 1,
      target: bobId,
      txCount: 1
    });
    expect(graph.links[0].tokens).toEqual([{ amount: 2.5, genesisHash: undefined, token: 'DOT' }]);
  });

  it('builds a receive-only edge', () => {
    const graph = buildInteractionGraph([
      tx({
        from: { address: BOB, name: 'Bob' },
        to: { address: SELECTED, name: 'Selected' }
      })
    ], SELECTED);

    expect(graph.links[0]).toMatchObject({
      direction: 'received',
      receivedCount: 1,
      sentCount: 0
    });
  });

  it('merges the same counterparty into a mixed edge', () => {
    const graph = buildInteractionGraph([
      tx({ amount: '2' }),
      tx({
        amount: '3',
        from: { address: BOB, name: 'Bob' },
        to: { address: SELECTED, name: 'Selected' }
      })
    ], SELECTED);

    expect(graph.links).toHaveLength(1);
    expect(graph.links[0]).toMatchObject({
      direction: 'mixed',
      receivedCount: 1,
      sentCount: 1,
      txCount: 2
    });
    expect(graph.links[0].tokens).toEqual([{ amount: 5, genesisHash: undefined, token: 'DOT' }]);
  });

  it('keeps token totals separate', () => {
    const graph = buildInteractionGraph([
      tx({ amount: '2', token: 'DOT' }),
      tx({ amount: '4', token: 'USDT' })
    ], SELECTED);

    expect(graph.links[0].tokens).toEqual([
      { amount: 2, genesisHash: undefined, token: 'DOT' },
      { amount: 4, genesisHash: undefined, token: 'USDT' }
    ]);
  });

  it('includes failed transactions in metadata', () => {
    const graph = buildInteractionGraph([
      tx({ success: false })
    ], SELECTED);

    expect(graph.nodes.find(({ id }) => id === normalizeAddress(BOB))?.failedCount).toBe(1);
    expect(graph.links[0].failedCount).toBe(1);
  });

  it('skips missing counterparties and malformed addresses', () => {
    const graph = buildInteractionGraph([
      tx({ to: undefined }),
      tx({ to: { address: 'not-an-address', name: 'Invalid' } }),
      tx({ to: { address: CHARLIE, name: 'Charlie' } })
    ], SELECTED);

    expect(graph.links).toHaveLength(1);
    expect(graph.links[0].target).toBe(normalizeAddress(CHARLIE));
  });

  it('filters by direction, status, and type', () => {
    const graph = buildInteractionGraph([
      tx({ subAction: 'send' }),
      tx({
        from: { address: CHARLIE, name: 'Charlie' },
        subAction: 'receive',
        success: false,
        to: { address: SELECTED, name: 'Selected' }
      })
    ], SELECTED, {
      direction: 'received',
      status: 'failed',
      type: 'receive'
    });

    expect(graph.links).toHaveLength(1);
    expect(graph.links[0]).toMatchObject({
      counterparty: normalizeAddress(CHARLIE),
      direction: 'received',
      failedCount: 1
    });
  });
});
