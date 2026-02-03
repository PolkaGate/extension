// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { GenericExtrinsicPayload, Option, u16 } from '@polkadot/types';
import type { OpaqueMetadata } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';

import { useMemo, useState } from 'react';

import { BN, objectSpread, u8aToHex } from '@polkadot/util';
import { merkleizeMetadata } from '@polkadot-api/merkleize-metadata';

export interface MetadataProof {
  raw: GenericExtrinsicPayload,
  txMetadata: Uint8Array
}

export default function useMetadataProof(api: ApiPromise | undefined | null, payload: SignerPayloadJSON | undefined): MetadataProof | undefined {
  const [proof, setProof] = useState<MetadataProof>();

  const apiGenesisHash = api?.genesisHash.toHex();

  useMemo(() => {
    const getProof = async () => {
      if (!apiGenesisHash || !payload || !api) {
        return;
      }

      const signedExtensions = payload.signedExtensions.includes('CheckMetadataHash')
        ? payload.signedExtensions
        : [...payload.signedExtensions, 'CheckMetadataHash'];

      const maybeMetadataV15 = await api.call['metadata']['metadataAtVersion']<Option<OpaqueMetadata>>(new BN(15));

      if (maybeMetadataV15.isNone) {
        throw new Error('metadata not found');
      }

      const { specName, specVersion } = api.runtimeVersion;

      const merkleizedMetadata = merkleizeMetadata(
        maybeMetadataV15.unwrap().toHex(),
        {
          base58Prefix: (api.consts['system']['ss58Prefix'] as u16).toNumber(),
          decimals: api.registry.chainDecimals[0],
          specName: specName.toString(),
          specVersion: specVersion.toNumber(),
          tokenSymbol: api.registry.chainTokens[0]
        }
      );

      const metadataHash = u8aToHex(merkleizedMetadata.digest());
      const newPayload = objectSpread({}, payload, {
        metadataHash,
        mode: 1,
        signedExtensions
      });

      const raw = api.registry.createType('ExtrinsicPayload', newPayload);

      const txMetadata = merkleizedMetadata.getProofForExtrinsicPayload(u8aToHex(raw.toU8a(true)));

      setProof({ raw, txMetadata });
    };

    getProof().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiGenesisHash, payload?.address]);

  return proof;
}
