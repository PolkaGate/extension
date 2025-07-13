// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SoloStakingInfo } from '../../../../hooks/useSoloStakingInfo';

import { Container, Stack } from '@mui/material';
import { Firstline, Menu } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { noop } from '@polkadot/util';

import { GradientButton, SearchField } from '../../../../components';
import { useTranslation, useValidatorsInformation } from '../../../../hooks';
import SortBy from '../../../../popup/staking/partial/SortBy';
import { EmptyNomination } from '../../../../popup/staking/solo-new/nominations/NominationsSetting';
import { UndefinedItem, ValidatorInfo } from './ValidatorItem';

enum SORTED_BY {
  DEFAULT = 'Default',
  MOST_STAKED = 'Most Staked',
  LEAST_COMMISSION = 'Least Commission',
  MOST_NOMINATORS = 'Most Nominators'
}

interface ValidatorToolbarProps {
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  onSearch: (input: string) => void;
  genesisHash: string | undefined;
}

const ValidatorToolbar = ({ genesisHash, onSearch, setSortBy, sortBy }: ValidatorToolbarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const openValidatorManagement = useCallback(() => navigate('/fullscreen-stake/solo/manage-validator/' + genesisHash) as void, [genesisHash, navigate]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '18px' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '18px', m: 0, width: 'fit-content' }}>
        <SearchField
          onInputChange={onSearch}
          placeholder='🔍 Search'
          style={{
            height: '44px',
            minWidth: '380px',
            width: '380px'
          }}
        />
        <SortBy
          SortIcon={<Firstline color='#AA83DC' size='18' variant='Bold' />}
          setSortBy={setSortBy}
          sortBy={sortBy}
          sortOptions={Object.values(SORTED_BY)}
        />
      </Container>
      <GradientButton
        onClick={openValidatorManagement}
        startIconNode={<Menu color='#EAEBF1' size='18' style={{ marginRight: '6px', zIndex: 10 }} variant='Bulk' />}
        style={{ height: '44px', padding: 0, width: '180px' }}
        text={t('Manage Validators')}
      />
    </Container>
  );
};

interface Props {
  genesisHash: string | undefined;
  stakingInfo: SoloStakingInfo | undefined;
}

export default function ValidatorsTable ({ genesisHash, stakingInfo }: Props): React.ReactElement {
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const [sortConfig, setSortConfig] = React.useState<string>(SORTED_BY.DEFAULT);
  const [search, setSearch] = React.useState<string>('');

  const nominatedValidatorsIds = useMemo(() =>
    stakingInfo?.stakingAccount === null || stakingInfo?.stakingAccount?.nominators?.length === 0
      ? null
      : stakingInfo?.stakingAccount?.nominators.map((item) => item.toString())
  , [stakingInfo?.stakingAccount]);

  const nominatedValidatorsInformation = useMemo(() => {
    if (!validatorsInfo || !nominatedValidatorsIds) {
      return undefined;
    }

    return [...validatorsInfo.validatorsInformation.elected, ...validatorsInfo.validatorsInformation.waiting]
      .filter(({ accountId }) => nominatedValidatorsIds.includes(accountId.toString()));
  }, [nominatedValidatorsIds, validatorsInfo]);

  // New filtered validators based on search
  const filteredValidators = useMemo(() => {
    if (!nominatedValidatorsInformation || search.trim() === '') {
      return nominatedValidatorsInformation;
    }

    const searchLower = search.toLowerCase().trim();

    return nominatedValidatorsInformation.filter((validator) => {
      // Search by account ID
      if (validator.accountId.toString().toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search by display name if available
      if (validator.identity?.display &&
        validator.identity.display.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search by parent display name if available
      if (validator.identity?.displayParent &&
        validator.identity.displayParent.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search by judgements (like "Reasonable", "KnownGood", etc.)
      if (validator.identity?.judgements &&
        validator.identity.judgements.some(([, judgement]) =>
          judgement.toString().toLowerCase().includes(searchLower))) {
        return true;
      }

      return false;
    });
  }, [nominatedValidatorsInformation, search]);

  const isLoading = useMemo(() => (stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo?.stakingAccount]);
  const isLoaded = useMemo(() => filteredValidators && filteredValidators.length > 0, [filteredValidators]);
  const nothingToShow = useMemo(() => (stakingInfo?.stakingAccount?.nominators && stakingInfo?.stakingAccount.nominators.length === 0) || !filteredValidators?.length, [filteredValidators?.length, stakingInfo?.stakingAccount?.nominators]);

  const onSearch = useCallback((input: string) => {
    setSearch(input);
  }, []);

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <ValidatorToolbar
        genesisHash={genesisHash}
        onSearch={onSearch}
        setSortBy={setSortConfig}
        sortBy={sortConfig}
      />
      <Stack direction='column' sx={{ gap: '2px', px: '4px', width: '100%' }}>
        {isLoaded &&
          nominatedValidatorsInformation?.map((validator, index) => (
            <ValidatorInfo
              genesisHash={genesisHash}
              key={index}
              onDetailClick={noop}
              validatorInfo={validator}
            />
          ))}
        {isLoading && Array.from({ length: 10 }).map((_, index) => (<UndefinedItem key={index} />))}
        {nothingToShow && <EmptyNomination />}
      </Stack>
    </Stack>
  );
}
