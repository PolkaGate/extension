// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useValidatorsInformation from '@polkadot/extension-polkagate/src/hooks/useValidatorsInformation';

import { usePoolStakingInfo, useStakingConsts, useTranslation, useValidatorSuggestion } from '../../../../hooks';
import ManageValidatorsView from '../../new-solo/nominations/ManageValidatorsView';
import useManageValidators from '../../new-solo/nominations/useManageValidators';
import { getNominatedValidatorsInformation } from '../../new-solo/nominations/util';
import ReviewPopup from './ReviewPopup';

function ManageValidators() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const validatorsInfo = useValidatorsInformation(genesisHash);
  const validatorsInformation = useMemo(() => {
    const info = validatorsInfo?.validatorsInformation;

    return info
      ? [...info.elected, ...info.waiting]
      : undefined;
  }, [validatorsInfo]);
  const nominatedValidatorsIds = useMemo(
    () => stakingInfo.pool === undefined
      ? undefined
      : stakingInfo.pool?.stashIdAccount?.nominators?.map((item) => item.toString()) ?? []
    , [stakingInfo.pool]
  );
  const nominatedValidatorsInformation = useMemo(() => getNominatedValidatorsInformation(validatorsInfo, nominatedValidatorsIds), [nominatedValidatorsIds, validatorsInfo]);

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

  const backToStakingHome = useCallback(() => {
    if (!address || !genesisHash) {
      navigate(-1) as void;

      return;
    }

    navigate('/fullscreen-stake/pool/' + address + '/' + genesisHash) as void;
  }, [address, genesisHash, navigate]);
  const canReview = useMemo(() => stakingInfo.pool?.poolId !== undefined, [stakingInfo.pool?.poolId]);
  const toggleReview = useCallback(() => {
    setGoReview((isOnReview) => (isOnReview ? false : canReview));
  }, [canReview]);
  const isLoading = useMemo(() => stakingConsts === undefined || stakingInfo.pool === undefined || nominatedValidatorsIds === undefined || nominatedValidatorsInformation === undefined || validatorsInformation === undefined, [nominatedValidatorsIds, nominatedValidatorsInformation, stakingConsts, stakingInfo.pool, validatorsInformation]);

  return (
    <>
      <ManageValidatorsView
        description={t('Manage your pool nominated validators by considering their properties, including their commission rates. You can even filter them based on your preferences.')}
        genesisHash={genesisHash}
        isAlreadySelected={isAlreadySelected}
        isLoaded={isLoaded}
        isLoading={isLoading}
        isNextDisabled={isNextDisabled || !canReview}
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
          poolId={stakingInfo.pool?.poolId}
        />
      }
    </>
  );
}

export default memo(ManageValidators);
