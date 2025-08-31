// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Link, Stack, Typography } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleRight2, BuyCrypto, Clock, Home3, Moon, Record, Setting } from 'iconsax-react';
import React, { useCallback } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import Socials from '@polkadot/extension-polkagate/src/popup/settings/partials/Socials';
import { ExtensionPopups, PRIVACY_POLICY_LINK } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { useAlerts, useManifest, useSelectedAccount, useStakingPositions, useTranslation } from '../../../hooks';
import NeedHelp from '../../onboarding/NeedHelp';
import GovernanceModal from '../GovernanceModal';
import Language from './Language';
import LogoWithText from './LogoWithText';
import MenuButton from './MenuButton';
import ReceiveGeneral from './ReceiveGeneral';

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

function ThemeToggle (): React.ReactElement {
   const { notify } = useAlerts();
    const { t } = useTranslation();

    const onClick = useCallback(() => {
      notify(t('Coming Soon!'), 'info');
    }, [notify, t]);

  return (
    <Box onClick={onClick} sx={{ alignItems: 'center', borderRadius: '16px', display: 'flex', height: '32px', position: 'relative', width: '48px' }}>
      <Box sx={{ backdropFilter: 'blur(8px)', bgcolor: '#2D1E4A80', borderRadius: '16px', boxShadow: '0px 0px 24px 8px #4E2B7259 inset', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Box sx={{ height: 28, position: 'relative', width: 28 }}>
        <Box
          sx={{
            background: '#9542FF4D',
            borderRadius: '50%',
            height: '100%',
            left: 0,
            position: 'absolute',
            top: 0,
            width: '100%'
          }}
        />
        <Box
          sx={{
            alignItems: 'center',
            background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
            borderRadius: '50%',
            display: 'flex',
            height: 24,
            justifyContent: 'center',
            left: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 24
          }}
        >
          <Moon color='#EAEBF1' size='16' variant='Bold' />
        </Box>
      </Box>
    </Box>
  );
}

function MainMenuColumn (): React.ReactElement {
  const { t } = useTranslation();
  const version = useManifest()?.version;
  const selectedAccount = useSelectedAccount();
  const selectedGenesisHash = useAccountSelectedChain(selectedAccount?.address);
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const { maxPosition, maxPositionType } = useStakingPositions(selectedAccount?.address, true);

  return (
    <Grid
      container
      direction='column'
      item
      justifyContent='start'
      sx={{
        height: '100%',
        maxHeight: '100vh',
        minHeight: '760px',
        position: 'relative',
        width: '196px'
      }}
    >
      <Shining />
      <Grid alignItems='center' container direction='row' sx={{ columnGap: '12px', marginBottom: '20px' }}>
        <LogoWithText style={{ zIndex: 10 }} />
        <ThemeToggle />
      </Grid>
      <MenuButton
        Icon={Home3}
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
        onClick={extensionPopupOpener(ExtensionPopups.RECEIVE)}
        text={t('Receive')}
      />
      <MenuButton
        Icon={BuyCrypto}
        path={`/fullscreen-stake/${maxPositionType ?? 'solo'}/${selectedAccount?.address}/${maxPosition?.genesisHash ?? selectedGenesisHash}`}
        text={t('Staking')}
      />
      <MenuButton
        Icon={Record}
        onClick={extensionPopupOpener(ExtensionPopups.GOVERNANCE)}
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
      <Stack direction='column' rowGap='20px' sx={{ pt: '190px' }}>
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
      {extensionPopup === ExtensionPopups.RECEIVE &&
        <ReceiveGeneral
          closePopup={extensionPopupCloser}
          openPopup={extensionPopupOpener}
        />}
      {extensionPopup === ExtensionPopups.GOVERNANCE &&
        <GovernanceModal
          setOpen={extensionPopupCloser}
        />}
    </Grid>
  );
}

export default React.memo(MainMenuColumn);
