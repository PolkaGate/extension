// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, PButton } from '../../components';
import { useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';

interface Props {
  className?: string;
}

function AddAccount({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const _goToRestoreFromJson = useCallback(
    (): void => {
      windowOpen('/account/restore-json').catch(console.error);
    }, []
  );

  const _goToImportLedger = useCallback(
    (): void => {
      windowOpen('/account/import-ledger').catch(console.error);
    }, []
  );

  const _goToCreate = useCallback(
    () => onAction('/account/create'),
    [onAction]
  );

  const _goToImport = useCallback(
    () => onAction('/account/import-seed'),
    [onAction]
  );

  const _goToAttachQR = useCallback(
    () => onAction('/account/attach-qr'),
    [onAction]
  );

  return (
    <>
      <HeaderBrand
        showMenu
        text={t<string>('Polkagate')}
      />
      <div>
        <Typography
          component='p'
          sx={{
            fontSize: '36px',
            fontWeight: theme.palette.mode === 'dark' ? 300 : 400,
            pb: '20px',
            pt: '25px',
            textAlign: 'center'
          }}
        >
          Welcome
        </Typography>
        <Typography
          component={'p'}
          sx={{ fontSize: '14px', fontWeight: 300, px: '24px' }}
        >
          {t<string>('You currently don’t have any account. Create your first account or import an existing one to get started.')}
        </Typography>
      </div>
      <PButton
        _mt='38px'
        _onClick={_goToCreate}
        _variant={'contained'}
        text={t<string>('Create a new account')}
      />
      <Typography
        component={'p'}
        sx={{ fontSize: '18px', fontWeight: 300, py: '25px', textAlign: 'center' }}
      >{t<string>('Or')}</Typography>
      <PButton
        _mt='0'
        _onClick={_goToRestoreFromJson}
        _variant={'outlined'}
        text={t<string>('Restore from JSON file')}
      />
      <PButton
        _mt='10px'
        _onClick={_goToImport}
        _variant={'outlined'}
        text={t<string>('Import from mnemonic')}
      />
      <PButton
        _mt='10px'
        _onClick={_goToAttachQR}
        _variant={'outlined'}
        text={t<string>('Attach QR signer')}
      />
      <PButton
        _mt='10px'
        _onClick={_goToImportLedger}
        _variant={'outlined'}
        text={t<string>('Attach ledger device')}
      />
    </>
  );
}

export default (AddAccount);
