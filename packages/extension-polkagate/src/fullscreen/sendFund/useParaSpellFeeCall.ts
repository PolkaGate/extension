// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Inputs } from './types';

import { Builder, type TNodeDotKsmWithRelayChains } from '@paraspell/sdk-pjs';
import { useEffect, useState } from 'react';

import { TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';
import { BN } from '@polkadot/util';

import { isOnSameChain, reorderAssetHubLabel } from './utils';

export default function useParaSpellFeeCall (address: string | undefined, amountAsBN: BN | undefined, genesisHash: string | undefined, inputs: Inputs | undefined, senderChainName: string | undefined, setError: React.Dispatch<React.SetStateAction<string | undefined>>) {
  const [paraSpellFee, setParaSpellFee] = useState<BN>();
  const [paraSpellTransaction, setParaSpellTransaction] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>>();

  useEffect(() => {
    const _recipientChainName = inputs?.recipientChain?.text;

    if (TEST_NETS.includes(genesisHash ?? '') || !senderChainName || !amountAsBN || !address || !inputs?.token || !_recipientChainName || !inputs?.recipientAddress || !inputs?.amount || !address) {
      return;
    }

    const _senderChainName = reorderAssetHubLabel(senderChainName);

    if (isOnSameChain(senderChainName, _recipientChainName)) {
      console.info('No need to PS, only use it for xcm ...');

      return;
    }

    const builder = Builder(/* node api/ws_url_string/ws_url_array - optional*/)
      .from(_senderChainName as TNodeDotKsmWithRelayChains)
      .to(_recipientChainName as TNodeDotKsmWithRelayChains)
      .currency({ amount: amountAsBN.toString(), symbol: inputs.token }) // Optional, to set fee asset
      /* .feeAsset(CURRENCY) - Optional parameter when origin === AssetHubPolkadot and TX is supposed to be paid in same fee asset as selected currency.*/
      .address(inputs.recipientAddress)
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
  }, [address, senderChainName, amountAsBN, genesisHash, setError, inputs?.token, inputs?.recipientChain?.text, inputs?.recipientAddress, inputs?.amount, inputs?.recipientChain?.value]);

  return {
    paraSpellFee,
    paraSpellTransaction
  };
}
