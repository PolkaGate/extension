// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { Check, ColorSwatch, Eye, FolderOpen, Key, ScanBarcode } from 'iconsax-react';
import React from 'react';

import { useTranslation } from '../../hooks';
import { OnboardTitle } from '../components';
import AdaptiveLayout from '../components/layout/AdaptiveLayout';
import CreationButton from './CreationButton';

function HaveWallet (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <AdaptiveLayout style={{ maxWidth: '622px', width: '622px' }}>
      <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ zIndex: 1 }}>
        <OnboardTitle
          label={t('Already have accounts')}
          labelPartInColor={t('have accounts')}
          url='/onboarding'
        />
        <Typography color={theme.palette.text.secondary} py='15px' textAlign='left' variant='B-1' width='480px'>
          {t('If you already have accounts, you can import them using your preferred method. For batch imports, you can restore multiple accounts from a file.')}
        </Typography>
        <Grid columnGap='10px' container item rowGap='10px' sx={{ mb: '20px', mt: '10px' }}>
          <CreationButton
            Icon={FolderOpen}
            label={t('Restore from File')}
            labelPartInColor='Restore from'
            url='/account/restore-json'
          />
          <CreationButton
            Icon={Check}
            label={t('Import from Recovery Phrase')}
            labelPartInColor='Import from'
            url='/account/import-seed'
          />
          <CreationButton
            Icon={Key}
            label={t('Import from Raw Seed')}
            labelPartInColor='Import from'
            url='/account/import-raw-seed'
          />
          <CreationButton
            Icon={ScanBarcode}
            label={t('Attach QR-Signer')}
            labelPartInColor='Attach'
            url='/import/attach-qr-full-screen'
          />
          <CreationButton
            Icon={ColorSwatch}
            label={t('Attach Ledger Device')}
            labelPartInColor='Attach'
            url='/account/import-ledger'
          />
          <CreationButton
            Icon={Eye}
            label={t('Add Watch-only Account')}
            labelPartInColor='Add'
            url='/import/add-watch-only-full-screen'
          />
        </Grid>
      </Stack>
    </AdaptiveLayout>
  );
}

export default React.memo(HaveWallet);
