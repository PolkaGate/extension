// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography } from '@mui/material';
import { Check, DocumentText } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { Lock } from '../../assets/gif';
import { ActionCard, ActionContext, BackWithLabel } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { Version } from '../../partials';
import Header from './Header';

function Reset(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const goToRestoreFromJson = useCallback((): void => {
    windowOpen('/account/restore-json').catch(console.error);
  }, []);

  const back = useCallback((): void => {
    updateStorage('loginInfo', { status: 'set' })
      .finally(() => onAction('/'))
      .catch(console.error);
  }, [onAction]);

  const goToImport = useCallback((): void => {
    windowOpen('/account/import-seed').catch(console.error);
  }, []);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <Header />
      <BackWithLabel
        onClick={back}
      />
      <Grid container item justifyContent='center' sx={{ px: '15px' }}>
        <Box
          component='img'
          src={Lock as string}
          sx={{ height: '55px', mt: '-3px', width: '55px' }}
        />
        <Typography fontFamily='OdibeeSans' fontSize='29px' fontWeight={400} sx={{ mb: '10px', mt: '10px', width: '100%' }} textAlign='center' textTransform='uppercase'>
          {t('Reset Wallet')}
        </Typography>
        <Typography sx={{ color: 'text.secondary', px: '15px', width: '100%' }} textAlign='center' variant='B-4'>
          {t('Resetting your wallet is a last resort option that will erase your current wallet data. Please make sure you have a backup JSON File or a Recovery Phrase before proceeding. To reset your wallet, you can choose one of the following methods:')}
        </Typography>
        <ActionCard
          Icon={DocumentText}
          description={t('Restore from a previously exported accounts JSON backup file. This file contains the encrypted data of your accounts and can be used to restore them.')}
          iconWithBackground
          onClick={goToRestoreFromJson}
          style={{
            mt: '12px'
          }}
          title={t('Restore from JSON File')}
        />
        <ActionCard
          Icon={Check}
          description={t('Import from the secret Recovery Phrase. This phrase is sequence of 12 words that can be used to generate your account.')}
          iconWithBackground
          onClick={goToImport}
          style={{
            height: '122px',
            mt: '10px'
          }}
          title={t('Import from Recovery Phrase')}
        />
      </Grid>
      <Version />
    </Container>
  );
}

export default (Reset);
