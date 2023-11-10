// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, PButton } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';

function Reset(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const _goToRestoreFromJson = useCallback(
    (): void => {
      windowOpen('/account/restore-json').catch(console.error);
    }, []
  );

  const _goToImport = useCallback(
    (): void => {
      windowOpen('/account/import-seed').catch(console.error);
    }, []
  );

  const onClose = useCallback(async() => {
    onAction('/')
  }, [onAction]);

  return (
    <>
      <HeaderBrand
        showBrand
        showClose
        showMenu
        text={'Polkagate'}
      />
      <Typography component='p' sx={{ fontSize: '36px', fontWeight: theme.palette.mode === 'dark' ? 300 : 400, pb: '20px', pt: '25px', textAlign: 'center' }}>
        {t('Reset Wallet')}
      </Typography>
      <Typography component={'p'} sx={{ fontSize: '14px', fontWeight: 400, px: '24px' }}>
        {t<string>('If you\'re having trouble unlocking your wallet, reset it by importing a previously exported accounts JSON backup file or providing the secret recovery phrase used during setup. This action deletes your current wallet and associated accounts from this device. After resetting, you\'ll see a list of accounts based on your backup file or recovery phrase.')}
      </Typography>
      <PButton
        _mt='75px'
        _onClick={_goToRestoreFromJson}
        _variant={'contained'}
        startIcon={<vaadin-icon icon='vaadin:plus-circle' style={{ height: '18px', color: `${theme.palette.text.main}` }} />}
        text={t<string>('Restore from file')}
      />
      <Typography component={'p'} sx={{ fontSize: '18px', fontWeight: 300, py: '15px', textAlign: 'center' }}>
        {t<string>('Or')}
      </Typography>
      <PButton
        _mt='1px'
        _onClick={_goToImport}
        _variant={'outlined'}
        text={t<string>('Import from recovery phrase')}
      />
    </>
  );
}

export default (Reset);
