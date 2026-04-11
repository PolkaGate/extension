// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useNominatedValidatorsInfo from '@polkadot/extension-polkagate/src/hooks/useNominatedValidatorsInfo';

import { useSoloStakingInfo, useStakingConsts, useTranslation, useValidatorSuggestion } from '../../../../hooks';
import ManageValidatorsView from './ManageValidatorsView';
import ReviewPopup from './ReviewPopup';
import useManageValidators from './useManageValidators';

function ManageValidators() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { nominatedValidatorsInformation, validatorsInfo, validatorsInformation } = useNominatedValidatorsInfo(stakingInfo);

  const selectedBestValidators = useValidatorSuggestion(validatorsInfo, genesisHash);
  const stakingConsts = useStakingConsts(genesisHash);
  const maximum = useMemo(() => stakingConsts?.maxNominations ?? 0, [stakingConsts?.maxNominations]);
  const [review, setGoReview] = useState<boolean>(false);

  const { isAlreadySelected,
    isLoaded,
    isNextDisabled,
    isSelected,
    itemsPerPage,
    itemsToShow,
    newSelectedValidators,
    onReset,
    onSearch,
    onSelect,
    onSortChange,
    onSystemSuggestion,
    page,
    reachedMaximum,
    setItemsPerPagePage,
    setPage,
    sortConfig,
    sortedValidatorsInformation,
    systemSuggestion } = useManageValidators({
    maximum,
    nominatedValidatorsInformation,
    selectedBestValidators,
    validatorsInformation
  });

  const backToStakingHome = useCallback(() => navigate('/fullscreen-stake/solo/' + address + '/' + genesisHash) as void, [address, genesisHash, navigate]);
  const toggleReview = useCallback(() => setGoReview((isOnReview) => !isOnReview), []);
  const isLoading = useMemo(() => stakingConsts === undefined || stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined || validatorsInformation === undefined, [nominatedValidatorsInformation, stakingConsts, stakingInfo?.stakingAccount, validatorsInformation]);

  return (
    <>
      <ManageValidatorsView
        description={t('Manage your nominated validators by considering their properties, including their commission rates. You can even filter them based on your preferences.')}
        genesisHash={genesisHash}
        isAlreadySelected={isAlreadySelected}
        isLoaded={isLoaded}
        isLoading={isLoading}
        isNextDisabled={isNextDisabled}
        isSelected={isSelected}
        itemsPerPage={itemsPerPage}
        itemsToShow={itemsToShow}
        maximum={maximum}
        onBack={backToStakingHome}
        onNext={toggleReview}
        onReset={onReset}
        onSearch={onSearch}
        onSelect={onSelect}
        onSortChange={onSortChange}
        onSystemSuggestion={onSystemSuggestion}
        page={page}
        reachedMaximum={reachedMaximum}
        selectedCount={newSelectedValidators.length}
        setItemsPerPagePage={setItemsPerPagePage}
        setPage={setPage}
        sortConfig={sortConfig}
        systemSuggestion={systemSuggestion}
        totalItems={sortedValidatorsInformation?.length ?? 0}
      />
      {review &&
        <ReviewPopup
          address={address}
          genesisHash={genesisHash}
          maximum={maximum}
          newSelectedValidators={newSelectedValidators}
          onClose={toggleReview}
        />
      }
    </>
  );
}

export default memo(ManageValidators);
