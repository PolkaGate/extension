// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '@polkadot/extension-polkagate/hooks/useValidatorsInformation';
import type { AccountId32 } from '@polkadot/types/interfaces';
// @ts-ignore
import type { SpStakingExposurePage, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';

import { Stack } from '@mui/material';
import React from 'react';

import { toBN } from '@polkadot/extension-polkagate/src/util';

import { ValidatorInfo } from '../ValidatorItem';
import Curve from './Curve';

interface Props {
  address?: string | undefined,
  bgcolor?: string | undefined,
  genesisHash: string | undefined,
  isActive?: boolean | undefined,
  validators: ValidatorInformation[],
  withCurve?: boolean
}

export const Validators = React.memo(function Validators ({ address, bgcolor, genesisHash, isActive, validators, withCurve }: Props): React.ReactElement {
  return (
    <>
      {
        validators?.map((validator, index) => {
          let myShare;

          if (isActive && address) {
            const mySupport = (validator.exposurePaged as unknown as SpStakingExposurePage).others.find(({ who }: { who: AccountId32 }) => who.toString() === address)?.value;

            if (mySupport) {
              const PRECISION = 1_00;
              const myShareBN = toBN(mySupport).muln(100 * PRECISION).div(toBN((validator.exposureMeta as unknown as SpStakingPagedExposureMetadata).total));

              myShare = myShareBN.toNumber() / PRECISION;
            }
          }

          return (
            <Stack direction='row' key={index} sx={{ position: 'relative' }}>
              {
                withCurve &&
                <Curve />
              }
              <ValidatorInfo
                bgcolor={bgcolor}
                genesisHash={genesisHash}
                isActive={isActive}
                key={index}
                myShare={myShare}
                style={{ marginLeft: '2.5%', width: '95.5%' }}
                validatorInfo={validator}
              />
            </Stack>
          );
        })
      }
    </>
  );
});
