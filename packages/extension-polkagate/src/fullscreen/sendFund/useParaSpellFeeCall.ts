// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
import type React from 'react';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Inputs } from './types';

import { Builder } from '@paraspell/sdk-pjs';
import { useEffect, useState } from 'react';

import { TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';
import { BN } from '@polkadot/util';

import { reorderAssetHubLabel } from './utils';

export default function useParaSpellFeeCall (address: string | undefined, amountAsBN: BN | undefined, genesisHash: string | undefined, inputs: Inputs | undefined, senderChainName: string | undefined, setError: React.Dispatch<React.SetStateAction<string | undefined>>) {
  const [paraSpellFee, setParaSpellFee] = useState<BN>();
  const [paraSpellTransaction, setParaSpellTransaction] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>>();

  useEffect(() => {
    if (TEST_NETS.includes(genesisHash ?? '') || !senderChainName || !amountAsBN || !address || !inputs?.token || !inputs?.recipientChain?.text || !inputs?.recipientAddress || !inputs?.amount || !address) {
      return;
    }

    const _senderChainName = reorderAssetHubLabel(senderChainName);

    /** setting transaction and fee using paraSpell */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const builder = Builder(/* node api/ws_url_string/ws_url_array - optional*/)
      .from(_senderChainName)
      .to(inputs?.recipientChain?.text)
      .currency({ amount: amountAsBN.toString(), symbol: inputs.token }) // Optional, to set fee asset
      /* .feeAsset(CURRENCY) - Optional parameter when origin === AssetHubPolkadot and TX is supposed to be paid in same fee asset as selected currency.*/
      .address(inputs?.recipientAddress)
      .senderAddress(address);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    builder.build().then((tx) => {
      setParaSpellTransaction(tx);
    }).catch(console.error);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    builder
      .getTransferInfo()
      .then((info) => {
        const fee = info.origin.xcmFee.fee + info.destination.xcmFee.fee;

        setParaSpellFee(new BN(fee.toString()));
      }).catch((err) => {
        setError('Something went wrong while calculating estimated fee!');
        console.error('Something went wrong while getting fee', err);
      });
  }, [address, senderChainName, amountAsBN, inputs, genesisHash, setError]);

  return {
    paraSpellFee,
    paraSpellTransaction
  };
}
