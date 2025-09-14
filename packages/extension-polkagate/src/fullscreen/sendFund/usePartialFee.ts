// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AnyNumber } from '@polkadot/types-codec/types';
import type { Inputs } from './types';

import { useEffect, useState } from 'react';

import { BN, nextTick } from '@polkadot/util';

export default function usePartialFee (
  api: ApiPromise | undefined,
  inputs: Inputs | undefined,
  formatted: string | undefined,
  assetId: object | AnyNumber | undefined
): BN | undefined | null {
  const [partialFee, setPartialFee] = useState<BN | null>();

  const inputTransaction = inputs?.paraSpellTransaction ?? inputs?.transaction;

  useEffect((): void => {
    assetId && api && formatted && inputTransaction && inputTransaction.hasPaymentInfo &&
      nextTick(async (): Promise<void> => {
        setPartialFee(undefined);

        const signerOptions = { assetId };

        try {
          const info = await inputTransaction.paymentInfo(formatted, signerOptions);

          if (signerOptions?.assetId) {
            try {
              if (!api.call['assetConversionApi']?.['quotePriceTokensForExactTokens']) {
                console.warn('Asset conversion API not available');
                setPartialFee(info.partialFee);

                return;
              }

              const assetLocation = {
                interior: 'Here',
                parents: 1
              };

              const result = await api.call['assetConversionApi']['quotePriceTokensForExactTokens'](
                signerOptions.assetId,
                assetLocation,
                info.partialFee,
                true
              );

              if (!result) {
                console.error('No conversion result received');
                setPartialFee(null);

                return;
              }

              const convertedFee = new BN(result.toString());

              setPartialFee(convertedFee);
            } catch (conversionError) {
              console.error('Asset conversion failed:', conversionError);
              // Fall back to native fee display
              setPartialFee(info.partialFee);
            }
          } else {
            setPartialFee(info.partialFee);
          }
        } catch (error) {
          console.error(error);
        }
      });
  }, [api, assetId, formatted, inputTransaction]);

  return partialFee;
}
