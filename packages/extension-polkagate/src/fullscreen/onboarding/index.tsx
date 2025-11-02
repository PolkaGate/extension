// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Typography, useTheme } from '@mui/material';
import { AddCircle, Convertshape2, Wallet } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { handWave } from '../../assets/gif';
import { ActionButton, GradientButton } from '../../components';
import { useTranslation } from '../../hooks';
import { createAccountExternal } from '../../messaging';
import { setStorage } from '../../util';
import { DEMO_ACCOUNT, PROFILE_TAGS } from '../../util/constants';
import OnboardingLayout from './OnboardingLayout';

export const ICON_BOX_WIDTH = '300px';

function OrSeparator (): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Stack alignItems='center' columnGap='20px' direction='row' sx={{ my: '20px' }}>
      <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '144px' }} />
      <Typography color='#BEAAD8' textTransform='uppercase' variant='H-5'>
        {t('or')}
      </Typography>
      <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '144px' }} />
    </Stack>
  );
}

function Onboarding (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const onCreate = useCallback(() => navigate('/account/create'), [navigate]);

  const onAddAccount = useCallback(() => navigate('/account/have-wallet'), [navigate]);

  const onExploreDemo = useCallback((): void => {
    createAccountExternal('Demo account', DEMO_ACCOUNT, undefined)
      .then(() => {
        setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.WATCH_ONLY).catch(console.error);
        navigate('/') as void;
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }, [navigate]);

  return (
    <OnboardingLayout>
      <Stack alignItems='center' direction='column' justifyContent='flex-start' sx={{ width: '396px', zIndex: 1 }}>
        <Stack alignContent='start' columnGap='10px' direction='row' justifyContent='start' width='100%'>
          <Box
            component='img'
            src={handWave as string}
            sx={{ height: '48px', width: '48px' }}
          />
          <Typography sx={{ whiteSpace: 'nowrap' }} textAlign='left' textTransform='uppercase' variant='H-1' width='100%'>
            {t('Welcome')}<span style={{ color: '#BEAAD8' }}>!</span>
          </Typography>
        </Stack>
        <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1'>
          {t('At present, you do not have any accounts. To begin your journey, you can create your first account, import existing accounts, or explore the demo option to get started.')}
        </Typography>
        <GradientButton
          StartIcon={AddCircle}
          contentPlacement='start'
          onClick={onCreate}
          style={{
            borderRadius: '18px',
            height: '48px',
            marginTop: '5px',
            paddingLeft: '100px',
            width: '100%'
          }}
          text={t('Create a new account')}
        />
        <ActionButton
          StartIcon={Wallet}
          contentPlacement='start'
          onClick={onAddAccount}
          style={{
            borderRadius: '18px',
            height: '44px',
            mt: '20px',
            pl: '100px',
            width: '100%'
          }}
          text={{
            text: t('Already have accounts'),
            textPartInColor: t('have accounts')
          }}
          variant='contained'
        />
        <OrSeparator />
        <ActionButton
          StartIcon={Convertshape2}
          contentPlacement='start'
          onClick={onExploreDemo}
          style={{
            borderRadius: '18px',
            height: '44px',
            pl: '100px',
            width: '100%'
          }}
          text={{
            text: t('Demo account import'),
            textPartInColor: t('account import')
          }}
          variant='contained'
        />
      </Stack>
    </OnboardingLayout>
  );
}

export default React.memo(Onboarding);
