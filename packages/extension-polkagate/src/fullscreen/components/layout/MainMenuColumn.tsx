// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Link, Stack } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleRight2, BuyCrypto, Clock, Home3, Record, Setting } from 'iconsax-react';
import React, { useMemo } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { Version } from '@polkadot/extension-polkagate/src/partials';
import Socials from '@polkadot/extension-polkagate/src/popup/settings/partials/Socials';
import { ExtensionPopups, PRIVACY_POLICY_LINK } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';
import { mapRelayToSystemGenesisIfMigrated } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { useSelectedAccount, useStakingPositions, useTranslation } from '../../../hooks';
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

function MainMenuColumn (): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const selectedGenesisHash = useAccountSelectedChain(selectedAccount?.address);
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const { maxPosition, maxPositionType } = useStakingPositions(selectedAccount?.address, true);

  const stakingPath = useMemo(() => {
    if (maxPosition && maxPositionType) {
      return `/fullscreen-stake/${maxPositionType}/${selectedAccount?.address}/${maxPosition.genesisHash}`;
    }

    const stakingGenesisHash = mapRelayToSystemGenesisIfMigrated(selectedGenesisHash);

    return `/fullscreen-stake/solo/${selectedAccount?.address}/${stakingGenesisHash}`;
  }, [maxPosition, maxPositionType, selectedAccount?.address, selectedGenesisHash]);

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
      <LogoWithText style={{ marginBottom: '20px', zIndex: 10 }} />
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
        path={stakingPath}
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
          <Version style={{ padding: 0, textAlign: 'left', width: '20%' }} variant='B-5' />
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
