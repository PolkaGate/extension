// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SoloStakingInfo } from '../../../../hooks/useSoloStakingInfo';

import { Stack } from '@mui/material';
import { Menu } from 'iconsax-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';

import { FadeOnScroll, GradientButton, Motion } from '../../../../components';
import { useTranslation, useValidatorsInformation } from '../../../../hooks';
import { NoValidatorBox } from '../../../components';
import TableToolbar from '../../partials/TableToolbar';
import { getFilterValidators, getNominatedValidatorsIds, getNominatedValidatorsInformation, getSortAndFilterValidators, VALIDATORS_SORTED_BY } from './util';
import { UndefinedItem, ValidatorInfo } from './ValidatorItem';

interface Props {
  genesisHash: string | undefined;
  stakingInfo: SoloStakingInfo | undefined;
}

export default function ValidatorsTabBody ({ genesisHash, stakingInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const isNominated = useMemo(() => stakingInfo?.stakingAccount?.nominators && stakingInfo?.stakingAccount.nominators.length > 0, [stakingInfo?.stakingAccount?.nominators]);

  const validatorsInfo = useValidatorsInformation(isNominated ? genesisHash : undefined);

  const [sortConfig, setSortConfig] = React.useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
  const [search, setSearch] = React.useState<string>('');

  const nominatedValidatorsIds = useMemo(() => getNominatedValidatorsIds(stakingInfo), [stakingInfo]);
  const nominatedValidatorsInformation = useMemo(() => getNominatedValidatorsInformation(validatorsInfo, nominatedValidatorsIds), [nominatedValidatorsIds, validatorsInfo]);

  const filteredValidators = useMemo(() => getFilterValidators(nominatedValidatorsInformation, search), [nominatedValidatorsInformation, search]);
  const sortedAndFilteredValidators = useMemo(() => getSortAndFilterValidators(filteredValidators, sortConfig), [filteredValidators, sortConfig]);

  const isLoading = useMemo(() => (stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo?.stakingAccount]);
  const isLoaded = useMemo(() => sortedAndFilteredValidators && sortedAndFilteredValidators.length > 0, [sortedAndFilteredValidators]);

  const onSearch = useCallback((input: string) => {
    setSearch(input);
  }, []);

  const openValidatorManagement = useCallback(() => navigate('/fullscreen-stake/solo/manage-validator/' + genesisHash) as void, [genesisHash, navigate]);

  return (
    <Motion variant='slide'>
      <Stack direction='column' sx={{ width: '100%' }}>
        <TableToolbar
          onSearch={onSearch}
          setSortBy={setSortConfig}
          sortBy={sortConfig}
          sortByObject={VALIDATORS_SORTED_BY}
        >
          <GradientButton
            onClick={openValidatorManagement}
            startIconNode={<Menu color='#EAEBF1' size='18' style={{ marginRight: '6px', zIndex: 10 }} variant='Bulk' />}
            style={{ height: '44px', padding: 0, width: '180px' }}
            text={t('Manage Validators')}
          />
        </TableToolbar>
        <Stack direction='column' ref={refContainer} sx={{ gap: '2px', maxHeight: 'calc(100vh - 531px)', mixHeight: 'calc(100vh - 531px)', overflowY: 'auto', width: '100%' }}>
          {isNominated && isLoaded &&
            sortedAndFilteredValidators?.map((validator, index) => (
              <ValidatorInfo
                genesisHash={genesisHash}
                key={index}
                validatorInfo={validator}
              />
            ))}
          {isNominated && isLoading &&
            Array.from({ length: 10 }).map((_, index) => (
              <UndefinedItem key={index} />
            ))
          }
          {!isNominated &&
            <NoValidatorBox style={{ height: '275px', paddingTop: '10px' }} />
          }
          <FadeOnScroll containerRef={refContainer} height='24px' ratio={0.3} />
        </Stack>
      </Stack>
    </Motion>
  );
}
