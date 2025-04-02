// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Typography, useTheme } from '@mui/material';
import { AddCircle, Wallet } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { handWave } from '../../assets/gif';
import { ActionButton, GradientButton } from '../../components';
import { useFullscreen, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import Framework from './Framework';

export const ICON_BOX_WIDTH = '300px';

function Onboarding (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();


  useFullscreen();

  // useEffect(() => {
  //   if (accounts?.length > 0) {
  //     onAction('/');
  //   }
  // }, [accounts?.length, onAction]);

  const onCreate = useCallback((): void => openOrFocusTab('/account/create', true), []);

  const onAddAccount = useCallback((): void => { windowOpen('/account/create').catch(console.error); }, []);

  return (
    <Framework>
      <Stack alignItems='center' direction='column' justifyContent='flex-start' sx={{ width: '396px', zIndex: 1 }}>
        <Stack alignContent='start' columnGap='10px' direction='row' justifyContent='start' width='100%'>
          <Box
            component='img'
            src={handWave as string}
            sx={{ height: '48px', width: '48px' }}
          />
          <Typography textAlign='left' textTransform='uppercase' variant='H-1' width='100%'>
            {t('Welcome')}<span style={{ color: '#BEAAD8' }}>!</span>
          </Typography>
        </Stack>
        <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1'>
          {t('Currently, you do not have any accounts. To begin, you may create your first account or import existing accounts to get started.')}
        </Typography>
        <GradientButton
          StartIcon={AddCircle}
          contentPlacement='start'
          onClick={onCreate}
          style={{
            borderRadius: '18px',
            height: '48px',
            width: '100%',
            mt: '25px',
            pl: '100px'
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
            width: '100%',
            mt: '20px',
            pl: '100px'
          }}
          text={{
            firstPart: t('Already'),
            secondPart: t('have an account')
          }}
          variant='contained'
        />
      </Stack>
    </Framework>
  );
}

export default React.memo(Onboarding);
