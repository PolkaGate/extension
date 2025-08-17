// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, Typography } from '@mui/material';
import { Refresh } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { EmptyWarning } from '../../../../assets/icons/index';
import { FadeOnScroll, Motion, NeonButton, Progress } from '../../../../components';
import { useBackground, useSoloStakingInfo, useTranslation, useValidatorsInformation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import NominationsBackButton from '../../partial/NominationsBackButton';
import NominatorsTable from '../../partial/NominatorsTable';
import StakingMenu from '../../partial/StakingMenu';

interface EmptyNominationProps {
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>
}

export const EmptyNomination = ({ setRefresh }: EmptyNominationProps) => {
  const { t } = useTranslation();

  const onClick = useCallback(() => setRefresh?.(true), [setRefresh]);

  return (
    <Stack direction='column'>
      <Box
        component='img'
        src={EmptyWarning as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '150px' }}
      />
      <Typography color='text.secondary' mb='30px' variant='B-2'>
        {t('No validator found')}
      </Typography>
      {setRefresh &&
        <NeonButton
          StartIcon={Refresh}
          contentPlacement='center'
          onClick={onClick}
          style={{
            height: '44px',
            width: '345px'
          }}
          text={t('Refresh')}
        />}
    </Stack>
  );
};

export default function NominationsSetting (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();
  const refContainer = useRef(null);

  const [refresh, setRefresh] = useState<boolean>(false);

  const stakingInfo = useSoloStakingInfo(address, genesisHash, refresh, setRefresh);
  const validatorsInfo = useValidatorsInformation(genesisHash);

  const nominatedValidatorsIds = useMemo(() =>
    stakingInfo.stakingAccount === null || stakingInfo.stakingAccount?.nominators?.length === 0
      ? null
      : stakingInfo.stakingAccount?.nominators.map((item) => item.toString())
  , [stakingInfo.stakingAccount]);

  const nominatedValidatorsInformation = useMemo(() => {
    if (!validatorsInfo || !nominatedValidatorsIds) {
      return undefined;
    }

    return [...validatorsInfo.validatorsInformation.elected, ...validatorsInfo.validatorsInformation.waiting]
      .filter(({ accountId }) => nominatedValidatorsIds.includes(accountId.toString()));
  }, [nominatedValidatorsIds, validatorsInfo]);

  const isLoading = useMemo(() => (stakingInfo.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo.stakingAccount]);
  const isLoaded = useMemo(() => nominatedValidatorsInformation && nominatedValidatorsInformation.length > 0, [nominatedValidatorsInformation]);
  const nothingToShow = useMemo(() => stakingInfo.stakingAccount?.nominators && stakingInfo.stakingAccount.nominators.length === 0, [stakingInfo.stakingAccount?.nominators]);

  return (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + genesisHash} homeType='default' />
      <Motion variant='slide'>
        <NominationsBackButton style={{ mt: '8px' }} />
        <Stack direction='row' ref={refContainer} sx={{ maxHeight: '500px', mt: '12px', overflowY: 'auto', px: '15px', width: '100%' }}>
          {isLoading &&
            <Progress
              style={{ marginTop: '90px' }}
              title={t("Loading the validators' list")}
            />
          }
          {isLoaded &&
            <NominatorsTable
              genesisHash={genesisHash ?? ''}
              validatorsInformation={nominatedValidatorsInformation ?? []}
            />}
          {nothingToShow &&
            <EmptyNomination
              setRefresh={setRefresh}
            />
          }
          <FadeOnScroll containerRef={refContainer} height='75px' ratio={0.6} />
        </Stack>
      </Motion>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        type='solo'
      />
    </Grid>
  );
}
