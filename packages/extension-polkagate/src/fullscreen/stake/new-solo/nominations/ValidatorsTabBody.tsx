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
import { getFilterValidators, getSortAndFilterValidators, VALIDATORS_SORTED_BY } from './util';
import { UndefinedItem, ValidatorInfo } from './ValidatorItem';

interface ValidatorToolbarProps {
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  onSearch: (input: string) => void;
  children: React.ReactNode;
}

export const ValidatorToolbar = ({ children, onSearch, setSortBy, sortBy }: ValidatorToolbarProps) => {
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
          sortOptions={Object.values(VALIDATORS_SORTED_BY)}
        />
      </Container>
      {children}
    </Container>
  );
};

interface Props {
  genesisHash: string | undefined;
  stakingInfo: SoloStakingInfo | undefined;
}

export default function ValidatorsTabBody ({ genesisHash, stakingInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const [sortConfig, setSortConfig] = React.useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
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

  const filteredValidators = useMemo(() => getFilterValidators(nominatedValidatorsInformation, search), [nominatedValidatorsInformation, search]);
  const sortedAndFilteredValidators = useMemo(() => getSortAndFilterValidators(filteredValidators, sortConfig), [filteredValidators, sortConfig]);

  const isLoading = useMemo(() => (stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo?.stakingAccount]);
  const isLoaded = useMemo(() => sortedAndFilteredValidators && sortedAndFilteredValidators.length > 0, [sortedAndFilteredValidators]);
  const nothingToShow = useMemo(() => stakingInfo?.stakingAccount?.nominators && stakingInfo?.stakingAccount.nominators.length === 0, [stakingInfo?.stakingAccount?.nominators]);

  const onSearch = useCallback((input: string) => {
    setSearch(input);
  }, []);

  const openValidatorManagement = useCallback(() => navigate('/fullscreen-stake/solo/manage-validator/' + genesisHash) as void, [genesisHash, navigate]);

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <ValidatorToolbar
        onSearch={onSearch}
        setSortBy={setSortConfig}
        sortBy={sortConfig}
      >
        <GradientButton
          onClick={openValidatorManagement}
          startIconNode={<Menu color='#EAEBF1' size='18' style={{ marginRight: '6px', zIndex: 10 }} variant='Bulk' />}
          style={{ height: '44px', padding: 0, width: '180px' }}
          text={t('Manage Validators')}
        />
      </ValidatorToolbar>
      <Stack direction='column' sx={{ gap: '2px', width: '100%' }}>
        {isLoaded &&
          sortedAndFilteredValidators?.map((validator, index) => (
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
