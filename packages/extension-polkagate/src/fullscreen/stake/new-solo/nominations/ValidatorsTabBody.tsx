// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId32 } from '@polkadot/types/interfaces';
//@ts-ignore
import type { SpStakingExposurePage } from '@polkadot/types/lookup';
import type { SoloStakingInfo } from '../../../../hooks/useSoloStakingInfo';

import { Collapse, Stack } from '@mui/material';
import { Menu, Star1, Timer } from 'iconsax-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useNominatedValidatorsInfo from '@polkadot/extension-polkagate/src/hooks/useNominatedValidatorsInfo';

import { FadeOnScroll, GradientButton, Motion } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { NoValidatorBox } from '../../../components';
import TableToolbar from '../../partials/TableToolbar';
import { LabelBar } from './partials/LabelBar';
import Line from './partials/Line';
import { Validators } from './partials/Validators';
import { getFilterValidators, getSortAndFilterValidators, VALIDATORS_SORTED_BY } from './util';
import { UndefinedItem } from './ValidatorItem';

interface Props {
  stakingInfo: SoloStakingInfo | undefined;
}

export default function ValidatorsTabBody ({ stakingInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();
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

    sortedAndFilteredValidators?.forEach((info) => {
      const others = (info.exposurePaged as unknown as SpStakingExposurePage | undefined)?.others;

      if (others?.length) {
        const isActive = others?.find(({ who }: { who: AccountId32 }) => who.toString() === stakingInfo?.stakingAccount?.accountId?.toString());

        isActive ? active.push(info) : elected.push(info);
      } else {
        nonElected.push(info);
      }
    });

    return { active, elected, nonElected };
  }, [sortedAndFilteredValidators, stakingInfo?.stakingAccount?.accountId]);

  const onSearch = useCallback((input: string) => setSearch(input), []);
  const openValidatorManagement = useCallback(() => navigate('/fullscreen-stake/solo/manage-validator/' + address + '/' + genesisHash) as void, [address, genesisHash, navigate]);

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
            style={{ height: '44px', minWidth: '160px', padding: '0 10px', width: 'fit-content' }}
            text={t('Edit Nominations')}
          />
        </TableToolbar>
        <Stack direction='column' ref={refContainer} sx={{ maxHeight: 'calc(100vh - 531px)', maxWidth: '1050px', minHeight: 'calc(100vh - 531px)', overflowY: 'auto', position: 'relative' }}>
          {isNominated && isLoaded &&
            <>
              <LabelBar
                Icon={Star1}
                color='#AA83DC'
                count={elected.length + active.length}
                isCollapsed={electedCollapse}
                label={t('Elected')}
                setCollapse={setElectedCollapse}
              />
              <Collapse easing={{ enter: '200ms', exit: '150ms' }} in={electedCollapse} style={{ minHeight: 'auto' }}>
                <Stack direction='column' sx={{ gap: '2px', height: 'fit-content', position: 'relative', width: '100%' }}>
                  <Line
                    height={46 * (elected.length + active.length)}
                  />
                  <Validators
                    address={stakingInfo?.stakingAccount?.accountId?.toString()}
                    bgcolor='#2D1E4A'
                    genesisHash={genesisHash}
                    isActive={true}
                    validators={active} // to show possible active validators
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
                description={t('Waiting')}
                isCollapsed={notElectedCollapse}
                label={t('Not Elected')}
                setCollapse={setNotElectedCollapse}
              />
              <Collapse easing={{ enter: '200ms', exit: '150ms' }} in={notElectedCollapse} sx={{ height: 'fit-content', minHeight: 'auto' }}>
                <Stack direction='column' sx={{ gap: '2px', height: 'fit-content', position: 'relative', width: '100%' }}>
                  <Line
                    height={44 * nonElected.length}
                  />
                  <Validators
                    bgcolor='transparent'
                    genesisHash={genesisHash}
                    validators={nonElected}
                    withCurve
                  />
                </Stack>
              </Collapse>
            </>
          }
          {isNominated !== false && isLoading &&
            Array.from({ length: 10 }).map((_, index) => (
              <UndefinedItem key={index} mb='2px' />
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
