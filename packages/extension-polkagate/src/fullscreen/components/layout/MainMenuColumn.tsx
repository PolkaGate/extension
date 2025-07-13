// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Link, Stack, Typography } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleRight2, BuyCrypto, Clock, Home, MedalStar, Setting } from 'iconsax-react';
import React from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import Socials from '@polkadot/extension-polkagate/src/popup/settings/partials/Socials';
import { PRIVACY_POLICY_LINK } from '@polkadot/extension-polkagate/src/util/constants';

import { logoTransparent, polkagateVector } from '../../../assets/logos';
import { useManifest, useSelectedAccount, useTranslation } from '../../../hooks';
import NeedHelp from '../../onboarding/NeedHelp';
import Language from './Language';
import MenuButton from './MenuButton';

function Shining (): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', top: '-100px', width: '100%' }}>
      <Box sx={{
        bgcolor: '#FF59EE',
        borderRadius: '50%',
        filter: 'blur(50px)',
        height: '128px',
        mixBlendMode: 'hard-light',
        width: '100px'
      }}
      />
    </Box>
  );
}

function MainMenuColumn (): React.ReactElement {
  const { t } = useTranslation();
  const version = useManifest()?.version;
  const selectedAccount = useSelectedAccount();
  const selectedGenesisHash = useAccountSelectedChain(selectedAccount?.address);

  return (
    <Grid alignContent='start' container item sx={{ height: '760px', overflow: 'hidden', position: 'relative', width: '196px' }}>
      <Shining />
      <Stack alignItems='center' direction='row' sx={{ mb: '20px', zIndex: 10 }}>
        <Box
          component='img'
          src={(logoTransparent) as string}
          sx={{ width: '38px' }}
        />
        <Box
          component='img'
          src={(polkagateVector) as string}
          sx={{ width: '84px' }}
        />
      </Stack>
      <MenuButton
        Icon={Home}
        path='/'
        text={t('Home')}
      />
      <MenuButton
        Icon={ArrowCircleRight2}
        path={`/send/${selectedAccount?.address}/${selectedGenesisHash}/0`}
        text={t('Send')}
      />
      <MenuButton
        Icon={ArrowCircleDown2}
        text={t('Receive')}
      />
      <MenuButton
        Icon={BuyCrypto}
        path={'/fullscreen-stake/solo/' + selectedGenesisHash}
        text={t('Staking')}
      />
      <MenuButton
        Icon={MedalStar}
        text={t('Governance')}
      />
      <MenuButton
        Icon={Setting}
        path='/settingsfs/'
        text={t('Settings')}
      />
      <MenuButton
        Icon={Clock}
        path='/historyfs'
        text={t('History')}
      />
      <Stack direction='column' rowGap='20px' sx={{ bottom: '15px', position: 'absolute' }}>
        <Grid container item justifyContent='start' width='fit-content'>
          <Typography color='#674394' sx={{ textAlign: 'left', width: '20%' }} variant='B-5'>
            {`v.${version}`}
          </Typography>
          <NeedHelp style={{ columnGap: '4px', marginLeft: '10px' }} />
          <Link href={PRIVACY_POLICY_LINK} rel='noreferrer' sx={{ '&:hover': { color: '#AA83DC' }, color: '#674394', cursor: 'pointer', mt: '7px' }} target='_blank' underline='none' variant='B-5'>
            {t('Privacy & Security')}
          </Link>
        </Grid>
        <Language />
        <Socials buttonSize={24} columnGap='4px' iconSize={13.5} style={{ flexWrap: 'nowrap', width: 'fit-content' }} />
      </Stack>
    </Grid>
  );
}

export default React.memo(MainMenuColumn);
