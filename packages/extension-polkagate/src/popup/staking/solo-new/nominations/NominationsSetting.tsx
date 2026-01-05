// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { Refresh } from 'iconsax-react';
import React, { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import useNominatedValidatorsStatus from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/nominations/useNominatedValidatorsStatus';

import { EmptyWarning } from '../../../../assets/icons/index';
import { FadeOnScroll, GradientDivider, Motion, MySkeleton, NeonButton } from '../../../../components';
import { useBackground, useSelectedAccount, useSoloStakingInfo, useTranslation } from '../../../../hooks';
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

const DoubleSkeleton = ({ width1, width2 }: { width1: string, width2: string }) => (
  <Stack direction='column' rowGap='4px' sx={{ my: '5px', width: 'fit-content' }}>
    <MySkeleton bgcolor='#809acb24' style={{ borderRadius: '20px', width: width1 }} />
    <MySkeleton bgcolor='#809ACB40' style={{ borderRadius: '20px', width: width2 }} />
  </Stack>
);

const UndefinedItem = () => (
  <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', mb: '8px', p: '8px', width: '100%' }}>
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px' }}>
      <MySkeleton bgcolor='#809ACB40' style={{ borderRadius: '20px', width: '125px' }} />
      <MySkeleton bgcolor='#809acb24' height={22} style={{ width: '22px' }} variant='rounded' />
    </Container>
    <GradientDivider style={{ my: '4px' }} />
    <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <DoubleSkeleton width1='70px' width2='40px' />
      <DoubleSkeleton width1='25px' width2='70px' />
      <DoubleSkeleton width1='25px' width2='60px' />
    </Container>
  </Stack>
);

export default function NominationsSetting(): React.ReactElement {
  useBackground('staking');

  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const refContainer = useRef(null);

  const [refresh, setRefresh] = useState<boolean>(false);

  const stakingInfo = useSoloStakingInfo(address, genesisHash, refresh, setRefresh);
  const { active,
    elected,
    isLoaded,
    isLoading,
    isNominated,
    nonElected } = useNominatedValidatorsStatus(stakingInfo);

  return (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + address + '/' + genesisHash} homeType='default' />
      <Motion variant='slide'>
        <NominationsBackButton
          address={address}
          genesisHash={genesisHash}
          style={{ mt: '8px' }}
        />
        <Stack direction='column' ref={refContainer} sx={{ maxHeight: '500px', mt: '12px', overflowY: 'auto', px: '15px', width: '100%' }}>
          {isNominated !== false && isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <UndefinedItem key={index} />
            ))
          }
          {isNominated && isLoaded &&
            <NominatorsTable
              genesisHash={genesisHash ?? ''}
              selected={active.map(({ accountId }) => accountId.toString())}
              validatorsInformation={[...active, ...elected, ...nonElected]}
            />}
          {isNominated === false &&
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
