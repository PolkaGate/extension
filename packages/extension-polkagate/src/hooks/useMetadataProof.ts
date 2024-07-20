// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import { useMemo, useState } from 'react';
import { objectSpread, u8aToHex } from '@polkadot/util';
import { GenericExtrinsicPayload, Option, u32 } from "@polkadot/types";
import type { OpaqueMetadata } from "@polkadot/types/interfaces";
import type { SignerPayloadJSON } from '@polkadot/types/types';
import { merkleizeMetadata } from '@polkadot-api/merkleize-metadata';

export interface MetadataProof {
  raw: GenericExtrinsicPayload,
  txMetadata: Uint8Array
}

export default function useMetadataProof(api: ApiPromise | undefined, payload: SignerPayloadJSON | undefined): MetadataProof | undefined {
  const [proof, setProof] = useState<MetadataProof>();

  const apiGenesisHash = api?.genesisHash.toHex();

  useMemo(async () => {
    if (!api || !payload) {
      return;
    }

    if (!payload.signedExtensions.includes('CheckMetadataHash')) {
      payload.signedExtensions.push('CheckMetadataHash');
    }
    // payload.assetId = null // TODO: add asset id later

    const versions = await api.call['metadata']['metadataVersions']() as u32[];

    const latestMetadataVersion = !!versions && versions[versions.length - 1];
    if (!latestMetadataVersion || latestMetadataVersion.toNumber() < 15) throw new Error('Cant fetch the latest version of the chain metadata')

    const maybeHexMetadata = await api.call['metadata']['metadataAtVersion']<Option<OpaqueMetadata>>(latestMetadataVersion);
    if (maybeHexMetadata.isNone) throw new Error("metadata not found");

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

    const txMetadata = merkleizedMetadata.getProofForExtrinsicPayload(u8aToHex(raw.toU8a(true)))

    setProof({ raw, txMetadata });
  }, [apiGenesisHash, payload?.address]);

  return proof;
}
