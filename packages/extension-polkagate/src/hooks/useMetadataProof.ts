// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { GenericExtrinsicPayload, Option } from '@polkadot/types';
import type { OpaqueMetadata } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';

import { useMemo, useState } from 'react';

import { BN, objectSpread, u8aToHex } from '@polkadot/util';
import { merkleizeMetadata } from '@polkadot-api/merkleize-metadata';

export interface MetadataProof {
  raw: GenericExtrinsicPayload,
  txMetadata: Uint8Array
}

export default function useMetadataProof(api: ApiPromise | undefined, payload: SignerPayloadJSON | undefined): MetadataProof | undefined {
  const [proof, setProof] = useState<MetadataProof>();

  const apiGenesisHash = api?.genesisHash.toHex();

  useMemo(() => {
    const getProof = async () => {
      if (!apiGenesisHash || !payload || !api) {
        return;
      }

      if (!payload.signedExtensions.includes('CheckMetadataHash')) {
        payload.signedExtensions.push('CheckMetadataHash');
      }

      // const versions = await api.call['metadata']['metadataVersions']() as unknown as u32[]; // returns: [14, 15, 4294967295] not on all chains
      // if (!latestMetadataVersion || latestMetadataVersion.toNumber() < 15) {
      //   throw new Error('Cant fetch the latest version of the chain metadata');
      // }

      const latestMetadataVersion = new BN(15);
      const maybeHexMetadata = await api.call['metadata']['metadataAtVersion']<Option<OpaqueMetadata>>(latestMetadataVersion);

      if (maybeHexMetadata.isNone) {
        throw new Error('metadata not found');
      }

      const { specName, specVersion } = api.runtimeVersion;

      const merkleizedMetadata = merkleizeMetadata(
        maybeHexMetadata.toHex(),
        {
          base58Prefix: (api.consts['system']['ss58Prefix'] as any).toNumber(),
          decimals: api.registry.chainDecimals[0],
          specName: specName.toString(),
          specVersion: specVersion.toNumber(),
          tokenSymbol: api.registry.chainTokens[0]
        }
      );

      const metadataHash = u8aToHex(merkleizedMetadata.digest());
      const newPayload = objectSpread({}, payload, { metadataHash, mode: 1 });
      const raw = api.registry.createType('ExtrinsicPayload', newPayload);

      const txMetadata = merkleizedMetadata.getProofForExtrinsicPayload(u8aToHex(raw.toU8a(true)));

      setProof({ raw, txMetadata });
    };

    getProof().catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiGenesisHash, payload?.address]);

  return proof;
}
