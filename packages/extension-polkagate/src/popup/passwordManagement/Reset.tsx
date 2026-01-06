// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { Check, DocumentText } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useExtensionLockContext } from '@polkadot/extension-polkagate/src/context/ExtensionLockContext';
import CreationButton from '@polkadot/extension-polkagate/src/fullscreen/haveWallet/CreationButton';
import { updateStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { switchToOrOpenTab } from '@polkadot/extension-polkagate/src/util/switchToOrOpenTab';

import { Lock } from '../../assets/gif';
import { ActionButton, ActionCard, BackWithLabel } from '../../components';
import { useBackground, useIsExtensionPopup, useTranslation } from '../../hooks';
import { lockExtension, windowOpen } from '../../messaging';
import { Version } from '../../partials';
import Header from './Header';

export function ResetContent(): React.ReactElement {
  const isExtension = useIsExtensionPopup();

  const { t } = useTranslation();

  const goToRestoreFromJson = useCallback((): void => {
    windowOpen('/account/restore-json').catch(console.error);
  }, []);

  const goToImport = useCallback((): void => {
    windowOpen('/account/import-seed').catch(console.error);
  }, []);

  const onClick = useCallback((): void => {
    switchToOrOpenTab('/', true);
  }, []);

  return (
    <Grid container item justifyContent='center' sx={{ px: isExtension ? '15px' : '25px' }}>
      <Box
        component='img'
        src={Lock as string}
        sx={{ height: isExtension ? '55px' : '65px', mt: isExtension ? '-3px' : '20px', width: isExtension ? '55px' : '65px' }}
      />
      <Typography sx={{ m: isExtension ? '10px 0' : '40px 0 15px', width: '100%' }} textAlign='center' textTransform='uppercase' variant={isExtension ? 'H-2' : 'H-1'}>
        {t('Reset Wallet')}
      </Typography>
      <Typography sx={{ color: 'text.secondary', px: '15px', width: '100%' }} textAlign='center' variant='B-4'>
        {t('Resetting your wallet is a last resort option that will erase your current wallet data. Please make sure you have a backup JSON File or a Recovery Phrase before proceeding. To reset your wallet, you can choose one of the following methods:')}
      </Typography>
      {isExtension
        ? <>
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
        </>
        : <Stack direction='column' rowGap='25px'>
          <Stack columnGap='10px' direction='row' margin='30px 0 50px'>
            <CreationButton
              Icon={DocumentText}
              label={t('Restore from JSON File')}
              labelPartInColor={t('Restore from JSON File')}
              style={{ width: '180px' }}
              url='/account/restore-json'
            />
            <CreationButton
              Icon={Check}
              label={t('Import from Recovery Phrase')}
              labelPartInColor={t('Import from Recovery Phrase')}
              style={{ width: '180px' }}
              url='/account/import-seed'
            />
          </Stack>
          <ActionButton
            contentPlacement='center'
            onClick={onClick}
            text={t('Back')}
            variant='contained'
          />
        </Stack>
      }

    </Grid>
  );
}

function Reset(): React.ReactElement {
  useBackground('drops') as void;
  const { setExtensionLock } = useExtensionLockContext();

  const navigate = useNavigate();

  const back = useCallback((): void => {
    updateStorage(STORAGE_KEY.IS_FORGOTTEN, { status: false })
      .finally(() => {
        setExtensionLock(true);
        navigate('/') as void;
        lockExtension().catch(console.error);
      })
      .catch(console.error);
  }, [navigate, setExtensionLock]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <Header />
      <BackWithLabel
        onClick={back}
      />
      <ResetContent />
      <Version />
    </Container>
  );
}

export default (Reset);
