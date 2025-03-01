// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faWallet } from '@fortawesome/free-solid-svg-icons';
import { Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import FullScreenHeader from '@polkadot/extension-polkagate/src/fullscreen/governance/FullScreenHeader';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { PButton, VaadinIcon } from '../../components';
import { useFullscreen, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';

function ResetFS(): React.ReactElement {
  const { t } = useTranslation();

  useFullscreen();

  const _goToRestoreFromJson = useCallback((): void => {
    windowOpen('/account/restore-json').catch(console.error);
  }, []);

  const _goToImport = useCallback((): void => {
    windowOpen('/account/import-seed').catch(console.error);
  }, []);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader noAccountDropDown noChainSwitch />
      <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '6%' }}>
        <Title
          icon={faWallet}
          text={t('Reset Wallet')}
        />
        <Typography sx={{ fontSize: '14px', mb: '25px', px: '15px' }}>
          {t('Resetting your wallet is a last resort option that will erase your current wallet data. Please make sure you have a backup JSON File or a Recovery Phrase before proceeding. To reset your wallet, you can choose one of the following methods:')}
        </Typography>
        <Grid container item sx={{ backgroundColor: 'background.paper', border: 1, borderColor: 'secondary.light', borderRadius: '5px', m: '10px', mt: '40px', p: '10px', width: '95%' }}>
          <Typography sx={{ fontSize: '14px' }}>
            {t('Restore from a previously exported accounts JSON backup file. This file contains the encrypted data of your accounts and can be used to restore them.')}
          </Typography>
          <PButton
            _mt='15px'
            _onClick={_goToRestoreFromJson}
            _variant={'contained'}
            startIcon={
              <VaadinIcon icon='vaadin:file-text' style={{ height: '18px' }} />
            }
            text={t('Restore from JSON File')}
          />
        </Grid>
        <Grid container item sx={{ backgroundColor: 'background.paper', border: 1, borderColor: 'secondary.light', borderRadius: '5px', m: '10px', mt: '20px', p: '10px', width: '95%' }}>
          <Typography sx={{ fontSize: '14px' }}>
            {t('Import from the secret Recovery Phrase. This phrase is a sequence of 12 words that can be used to generate your account.')}
          </Typography>
          <PButton
            _mt='15px'
            _onClick={_goToImport}
            _variant={'contained'}
            startIcon={
              <VaadinIcon icon='vaadin:book' style={{ height: '18px' }} />
            }
            text={t('Import from Recovery Phrase')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default (ResetFS);
