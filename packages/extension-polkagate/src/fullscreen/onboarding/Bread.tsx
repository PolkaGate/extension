// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { UserOctagon } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useTranslation } from '../../hooks';

const enum STATUS {
  WELCOME,
  ALREADY_HAVE_A_WALLET,
  CREATE_A_NEW_WALLET,
  OTHERS
}

const DISABLED_LINK_COLOR = '#674394';
const ENABLED_LINK_COLOR = '#AA83DC';

function Bread(): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();


  console.log('pathname:', pathname);

  const status = useMemo(() => {
    switch (pathname) {
      case '/onboarding':
        return STATUS.WELCOME;
      case '/account/create':
        return STATUS.CREATE_A_NEW_WALLET;
      case '/account/have-wallet':
        return STATUS.ALREADY_HAVE_A_WALLET;
      default:
        return STATUS.OTHERS;
    }
  }, [pathname]);

  const onWelcomeClick = useCallback(() => {
    status !== STATUS.WELCOME && navigate('/onboarding');
  }, [navigate, status]);

  const onHaveWalletClick = useCallback(() => {
    status !== STATUS.ALREADY_HAVE_A_WALLET && navigate('/account/have-wallet');
  }, [navigate, status]);

  const onCreateClick = useCallback(() => {
    status !== STATUS.CREATE_A_NEW_WALLET && navigate('/account/create');
  }, [navigate, status]);

  const pathToHuman = useMemo(() => {
    switch (pathname) {
      case '/account/restore-json':
        return t('Restore from file');
      case '/account/import-seed':
        return t('Import from recovery seed');
      case '/account/import-raw-seed':
        return t('Import from raw seed');
      case '/import/attach-qr-full-screen':
        return t('Attach QR-signer');
      case '/account/import-ledger':
        return t('Attach ledger device');
      case '/import/add-watch-only-full-screen':
        return t('Add watch only account');
      default:
        return '';
    }
  }, [pathname, t]);

  return (
    <Grid columnGap='30px' container item sx={{ height: '50px', m: '8px 0 0 155px ' }}>
      <Stack columnGap='5px' direction='row' onClick={onWelcomeClick} sx={{ cursor: status === STATUS.WELCOME ? 'default' : 'pointer' }}>
        <UserOctagon color={status === STATUS.WELCOME ? DISABLED_LINK_COLOR : ENABLED_LINK_COLOR} size='18' variant='Bold' />
        <Typography color={status === STATUS.WELCOME ? DISABLED_LINK_COLOR : ENABLED_LINK_COLOR} fontSize='14px' variant='B-1'>
          {t('Welcome')}
        </Typography>
      </Stack>
      {[STATUS.ALREADY_HAVE_A_WALLET, STATUS.CREATE_A_NEW_WALLET, STATUS.OTHERS].includes(status) &&
        <Typography color={status === STATUS.ALREADY_HAVE_A_WALLET ? DISABLED_LINK_COLOR : ENABLED_LINK_COLOR} fontSize='14px' onClick={onHaveWalletClick} sx={{ cursor: status === STATUS.ALREADY_HAVE_A_WALLET ? 'default' : 'pointer' }} variant='B-1'>
          {t('Already have a wallet')}
        </Typography>
      }
      {[STATUS.ALREADY_HAVE_A_WALLET, STATUS.CREATE_A_NEW_WALLET].includes(status) &&
        <Typography color={status === STATUS.CREATE_A_NEW_WALLET ? DISABLED_LINK_COLOR : ENABLED_LINK_COLOR} fontSize='14px' onClick={onCreateClick} sx={{ cursor: status === STATUS.CREATE_A_NEW_WALLET ? 'default' : 'pointer' }} variant='B-1'>
          {t('Create a new account')}
        </Typography>
      }
      {[STATUS.OTHERS].includes(status) &&
        <Typography color={DISABLED_LINK_COLOR} fontSize='14px' sx={{ cursor: 'default' }} variant='B-1'>
          {pathToHuman}
        </Typography>
      }
    </Grid>
  );
}

export default React.memo(Bread);
