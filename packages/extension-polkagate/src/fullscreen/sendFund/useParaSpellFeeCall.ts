// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Inputs } from './types';

import { Builder, Native, type TDestination, type TSubstrateChain } from '@paraspell/sdk-pjs';
import { useEffect, useState } from 'react';

import { useChainInfo } from '@polkadot/extension-polkagate/src/hooks';
import { BN } from '@polkadot/util';

import { isNativeAsset, normalizeChainName } from './utils';

export default function useParaSpellFeeCall (address: string | undefined, amountAsBN: BN | undefined, genesisHash: string | undefined, inputs: Inputs | undefined, senderChainName: string | undefined, setError: React.Dispatch<React.SetStateAction<string | undefined>>) {
  const { api } = useChainInfo(genesisHash);
  const [paraSpellFee, setParaSpellFee] = useState<BN>();
  const [paraSpellTransaction, setParaSpellTransaction] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>>();

  useEffect(() => {
    if (!api || !inputs || amountAsBN?.isZero()) {
      return;
    }

    const { assetId, recipientAddress, recipientChain, token } = inputs;
    const _recipientChainName = recipientChain?.text;

    if (!senderChainName || !amountAsBN || !address || !token || !_recipientChainName || !recipientAddress || !address) {
      return;
    }

    const fromChain = normalizeChainName(senderChainName);
    const toChain = normalizeChainName(_recipientChainName);

    const symbolOrId = assetId !== undefined
      ? isNativeAsset(api, token, assetId)
        ? { symbol: Native(token) }
        : { id: assetId }
      : { symbol: token };

    const builder = Builder({ abstractDecimals: false }/* node api/ws_url_string/ws_url_array - optional*/)
      .from(fromChain as TSubstrateChain)
      .to(toChain as TDestination)
      .currency({ amount: amountAsBN.toString(), ...symbolOrId })
      /* .feeAsset(CURRENCY) - Optional parameter when origin === AssetHubPolkadot and TX is supposed to be paid in same fee asset as selected currency.*/
      .address(recipientAddress)
      .senderAddress(address);

    builder.build().then((tx) => {
      setParaSpellTransaction(tx);
    }).catch(console.error);

    builder
      .getTransferInfo()
      .then((info) => {
        const fee = info.origin.xcmFee.fee + info.destination.xcmFee.fee;

        setParaSpellFee(new BN(fee.toString()));
      }).catch((err) => {
        setError('Something went wrong while calculating estimated fee!');
        console.error('Something went wrong while getting fee', err);
      });
  }, [api, address, senderChainName, amountAsBN, genesisHash, setError, inputs?.assetId, inputs?.token, inputs?.recipientChain?.text, inputs?.recipientAddress]);

  return {
    paraSpellFee,
    paraSpellTransaction
  };
}
