// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SoloStakingInfo } from './useSoloStakingInfo';
import type { ValidatorInformation, ValidatorsInformation } from './useValidatorsInformation';

import { useMemo } from 'react';

import { getNominatedValidatorsIds, getNominatedValidatorsInformation } from '../fullscreen/stake/new-solo/nominations/util';
import useValidatorsInformation from './useValidatorsInformation';

interface Output{
  validatorsInfo: ValidatorsInformation | undefined;
  nominatedValidatorsIds: string[] | null | undefined;
  nominatedValidatorsInformation: ValidatorInformation[] | undefined;
  validatorsInformation: ValidatorInformation[] | undefined;
}

export default function useNominatedValidatorsInfo (stakingInfo: SoloStakingInfo | undefined): Output {
  const genesisHash = stakingInfo?.stakingAccount?.genesisHash;
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const nominatedValidatorsIds = useMemo(() =>
    getNominatedValidatorsIds(stakingInfo)
  , [stakingInfo]);

  const nominatedValidatorsInformation = useMemo(() =>
    getNominatedValidatorsInformation(validatorsInfo, nominatedValidatorsIds === null ? [] : nominatedValidatorsIds)
  , [nominatedValidatorsIds, validatorsInfo]);

  const validatorsInformation = useMemo(() => {
    const info = validatorsInfo?.validatorsInformation;

    return info
      ? [...info.elected, ...info.waiting]
      : undefined;
  }, [validatorsInfo]);

  return {
    nominatedValidatorsIds,
    nominatedValidatorsInformation,
    validatorsInfo,
    validatorsInformation,
  };
}
