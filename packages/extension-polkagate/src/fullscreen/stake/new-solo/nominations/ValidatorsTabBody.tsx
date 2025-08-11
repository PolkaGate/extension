// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId32 } from '@polkadot/types/interfaces';
//@ts-ignore
import type { SpStakingExposurePage } from '@polkadot/types/lookup';
import type { SoloStakingInfo } from '../../../../hooks/useSoloStakingInfo';

import { Collapse, Stack } from '@mui/material';
import { Menu, Star1, Timer } from 'iconsax-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';

import useNominatedValidatorsInfo from '@polkadot/extension-polkagate/src/hooks/useNominatedValidatorsInfo';

import { FadeOnScroll, GradientButton, Motion } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { NoValidatorBox } from '../../../components';
import TableToolbar from '../../partials/TableToolbar';
import { LabelBar, Line, Validators } from './partials';
import { getFilterValidators, getSortAndFilterValidators, VALIDATORS_SORTED_BY } from './util';
import { UndefinedItem } from './ValidatorItem';

interface Props {
  genesisHash: string | undefined;
  stakingInfo: SoloStakingInfo | undefined;
}

export default function ValidatorsTabBody ({ genesisHash, stakingInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [sortConfig, setSortConfig] = React.useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
  const [search, setSearch] = React.useState<string>('');
  const [notElectedCollapse, setNotElectedCollapse] = React.useState<boolean>(false);
  const [electedCollapse, setElectedCollapse] = React.useState<boolean>(true);

  const isNominated = useMemo(() => stakingInfo?.stakingAccount?.nominators && stakingInfo?.stakingAccount.nominators.length > 0, [stakingInfo?.stakingAccount?.nominators]);

  const { nominatedValidatorsInformation } = useNominatedValidatorsInfo(stakingInfo);

  const filteredValidators = useMemo(() => getFilterValidators(nominatedValidatorsInformation, search), [nominatedValidatorsInformation, search]);
  const sortedAndFilteredValidators = useMemo(() => getSortAndFilterValidators(filteredValidators, sortConfig), [filteredValidators, sortConfig]);

  const isLoading = useMemo(() => (stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo?.stakingAccount]);
  const isLoaded = useMemo(() => sortedAndFilteredValidators && sortedAndFilteredValidators.length > 0, [sortedAndFilteredValidators]);

  const { active, elected, nonElected } = useMemo(() => {
    const elected: typeof nominatedValidatorsInformation = [];
    const active: typeof nominatedValidatorsInformation = [];
    const nonElected: typeof nominatedValidatorsInformation = [];

    nominatedValidatorsInformation?.forEach((info) => {
      const others = (info.exposurePaged as unknown as SpStakingExposurePage | undefined)?.others;

      if (others?.length) {
        const isActive = others?.find(({ who }: { who: AccountId32 }) => who.toString() === stakingInfo?.stakingAccount?.accountId?.toString());

        isActive ? active.push(info) : elected.push(info);
      } else {
        nonElected.push(info);
      }
    });

    return { active, elected, nonElected };
  }, [nominatedValidatorsInformation, stakingInfo?.stakingAccount?.accountId]);

  const onSearch = useCallback((input: string) => setSearch(input), []);
  const openValidatorManagement = useCallback(() => navigate('/fullscreen-stake/solo/manage-validator/' + genesisHash) as void, [genesisHash, navigate]);

  return (
    <Motion variant='slide'>
      <Stack direction='column' sx={{ width: '100%' }}>
        <TableToolbar
          onSearch={onSearch}
          setSortBy={setSortConfig}
          sortBy={sortConfig}
          sortByObject={VALIDATORS_SORTED_BY}
          style={{ padding: '18px 18px 8px' }}
        >
          <GradientButton
            onClick={openValidatorManagement}
            startIconNode={<Menu color='#EAEBF1' size='18' style={{ marginRight: '6px', zIndex: 10 }} variant='Bulk' />}
            style={{ height: '44px', padding: 0, width: '180px' }}
            text={t('Manage Validators')}
          />
        </TableToolbar>
        <Stack direction='column' ref={refContainer} sx={{ maxHeight: 'calc(100vh - 531px)', minHeight: 'calc(100vh - 531px)', overflowY: 'auto', position: 'relative', width: '100%' }}>
          {isNominated && isLoaded &&
            <>
              <LabelBar
                Icon={Star1}
                color='#AA83DC'
                count={elected.length + active.length}
                isCollapsed
                label={t('Elected')}
                setCollapse={setElectedCollapse}
              />
              <Collapse easing={{ enter: '200ms', exit: '150ms' }} in={electedCollapse} style={{ minHeight: 'auto' }} sx={{ width: 'fit-content' }}>
                <Stack direction='column' sx={{ gap: '2px', height: 'fit-content', width: '100%' }}>
                  <Line
                    height={47 * (elected.length + active.length)}
                  />
                  <Validators
                    address={stakingInfo?.stakingAccount?.accountId?.toString()}
                    bgcolor='#2D1E4A'
                    genesisHash={genesisHash}
                    isActive={true}
                    validators={active}
                    withCurve
                  />
                  <Validators
                    bgcolor='#2D1E4A66'
                    genesisHash={genesisHash}
                    isActive={false}
                    validators={elected}
                    withCurve
                  />
                </Stack>
              </Collapse>
              <LabelBar
                Icon={Timer}
                color='#8E8E8E'
                count={nonElected?.length}
                isCollapsed={notElectedCollapse}
                label={t('Not Elected')}
                setCollapse={setNotElectedCollapse}
              />
              <Collapse easing={{ enter: '200ms', exit: '150ms' }} in={notElectedCollapse} sx={{ height: 'fit-content', minHeight: 'auto', width: 'fit-content' }}>
                <Validators
                  bgcolor='transparent'
                  genesisHash={genesisHash}
                  validators={nonElected}
                />
              </Collapse>
            </>
          }
          {isNominated !== false && isLoading &&
            Array.from({ length: 10 }).map((_, index) => (
              <UndefinedItem key={index} />
            ))
          }
          {isNominated === false &&
            <NoValidatorBox style={{ height: '275px', paddingTop: '10px' }} />
          }
        </Stack>
        <FadeOnScroll containerRef={refContainer} height='45px' ratio={0.3} style={{ borderRadius: '0 0 14px 14px' }} />
      </Stack>
    </Motion>
  );
}
