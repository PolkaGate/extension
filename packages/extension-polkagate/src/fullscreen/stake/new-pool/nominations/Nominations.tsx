// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '@polkadot/extension-polkagate/hooks/useValidatorsInformation';
import type { MyPoolInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
// @ts-ignore
import type { SpStakingExposurePage } from '@polkadot/types/lookup';

import { Collapse, Stack } from '@mui/material';
import { Menu, Star1, Timer } from 'iconsax-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useValidatorsInformation from '@polkadot/extension-polkagate/src/hooks/useValidatorsInformation';
import { FadeOnScroll, GradientButton } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { NoValidatorBox } from '@polkadot/extension-polkagate/src/fullscreen/components';
import TableToolbar from '@polkadot/extension-polkagate/src/fullscreen/stake/partials/TableToolbar';
import { LabelBar } from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/nominations/partials/LabelBar';
import Line from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/nominations/partials/Line';
import { Validators } from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/nominations/partials/Validators';
import { VALIDATORS_SORTED_BY, getFilterValidators, getNominatedValidatorsInformation, getSortAndFilterValidators } from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/nominations/util';
import { UndefinedItem } from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/nominations/ValidatorItem';

interface Props {
  genesisHash: string | undefined;
  poolInfo: MyPoolInfo | null | undefined;
}

export default function Nominations({ genesisHash, poolInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { address } = useParams<{ address: string; genesisHash: string }>();
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const [sortConfig, setSortConfig] = React.useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
  const [search, setSearch] = React.useState<string>('');
  const [notElectedCollapse, setNotElectedCollapse] = React.useState<boolean>(false);
  const [electedCollapse, setElectedCollapse] = React.useState<boolean>(true);

  const nominatedValidatorsIds = useMemo(() =>
    poolInfo?.stashIdAccount?.nominators?.map((item) => item.toString()) ?? []
  , [poolInfo?.stashIdAccount?.nominators]);

  const nominatedValidatorsInformation = useMemo(() =>
    getNominatedValidatorsInformation(validatorsInfo, nominatedValidatorsIds)
  , [nominatedValidatorsIds, validatorsInfo]);

  const filteredValidators = useMemo(() => getFilterValidators(nominatedValidatorsInformation, search), [nominatedValidatorsInformation, search]);
  const sortedAndFilteredValidators = useMemo(() => getSortAndFilterValidators(filteredValidators, sortConfig), [filteredValidators, sortConfig]);

  const isNominated = useMemo(() => nominatedValidatorsIds.length > 0, [nominatedValidatorsIds.length]);
  const isLoading = useMemo(() => poolInfo !== null && nominatedValidatorsInformation === undefined, [nominatedValidatorsInformation, poolInfo]);
  const stashAddress = poolInfo?.stashIdAccount?.accountId?.toString();

  const { active, elected, nonElected } = useMemo(() => {
    const active: ValidatorInformation[] = [];
    const elected: ValidatorInformation[] = [];
    const nonElected: ValidatorInformation[] = [];

    sortedAndFilteredValidators?.forEach((info) => {
      const others = (info.exposurePaged as unknown as SpStakingExposurePage | undefined)?.others;

      if (others?.length) {
        const isActive = others.find(({ who }: { who: AccountId32 }) => who.toString() === stashAddress);

        isActive ? active.push(info) : elected.push(info);
      } else {
        nonElected.push(info);
      }
    });

    return { active, elected, nonElected };
  }, [sortedAndFilteredValidators, stashAddress]);

  const onSearch = useCallback((input: string) => setSearch(input), []);
  const openValidatorManagement = useCallback(() => navigate('/fullscreen-stake/pool/manage-validator/' + address + '/' + genesisHash) as void, [address, genesisHash, navigate]);

  return (
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
        {isNominated &&
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
                  address={stashAddress}
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
              count={nonElected.length}
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
        {isLoading &&
          Array.from({ length: 10 }).map((_, index) => (
            <UndefinedItem key={index} mb='2px' />
          ))
        }
        {!isLoading && !isNominated &&
          <NoValidatorBox style={{ height: '275px', paddingTop: '10px' }} />
        }
      </Stack>
      <FadeOnScroll containerRef={refContainer} height='45px' ratio={0.3} style={{ borderRadius: '0 0 14px 14px' }} />
    </Stack>
  );
}
