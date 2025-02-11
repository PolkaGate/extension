// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid, Stack } from '@mui/material';
import { Check, Trade } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { ActionContext, BackWithLabel } from '../../../components';
import { useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import TopMenuItem from './components/TopMenuItem';
import AutoLockTimer from './partials/AutoLockTimer';
import ChainsToViewAssets from './partials/ChainsToViewAssets';
import EnableCamera from './partials/EnableCamera';
import EnableTestNet from './partials/EnableTestNet';
import Language from './partials/Language';

function ExtensionSettings (): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const onBack = useCallback(() => onAction('/settings'), [onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('Extension Settings')}
      />
      <Grid container item sx={{ px: '10px' }}>
        <Stack columnGap='20px' direction='row' ml='7px' mt='12px'>
          <TopMenuItem
            Icon={Trade}
            isSelected
            label={t('Main')}
          />
          <TopMenuItem
            Icon={Check}
            label={t('Password')}
          />
        </Stack>
        <Grid container height='397px' item sx={{ overflow: 'scroll', p: '4px', bgcolor: '#1B133C', borderRadius: '14px', my: '10px' }}>
          <Grid alignItems='flex-start' container item justifyContent='flex-start' py='5px' sx={{ bgcolor: '#05091C', borderRadius: '14px', display: 'block', height: '390px', px: '10px' }}>
            <EnableTestNet />
            <EnableCamera />
            <AutoLockTimer />
            <Language />
          </Grid>
          <ChainsToViewAssets />
        </Grid>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(ExtensionSettings);
