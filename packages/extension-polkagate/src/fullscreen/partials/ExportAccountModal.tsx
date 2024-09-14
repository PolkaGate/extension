// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import { saveAs } from 'file-saver';
import React, { useCallback, useState } from 'react';

import { ButtonWithCancel, NewAddress, Password, Warning, WrongPasswordAlert } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { exportAccount } from '../../messaging';
import { DraggableModal } from '../governance/components/DraggableModal';
import SimpleModalTitle from './SimpleModalTitle';

interface Props {
  address: string;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function ExportAccountModal ({ address, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [pass, setPass] = useState<string>('');
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);

  const backToAccount = useCallback(() => setDisplayPopup(undefined), [setDisplayPopup]);

  const onPassChange = useCallback((password: string | null) => {
    setPass(password || '');
    setIsPasswordError(false);
  }, []);

  const _onExportButtonClick = useCallback((): void => {
    setIsBusy(true);

    exportAccount(address, pass)
      .then(({ exportedJson }) => {
        const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json; charset=utf-8' });

        saveAs(blob, `${address}.json`);

        backToAccount();
      })
      .catch((err: Error) => {
        console.error(err);
        setIsPasswordError(true);
        setIsBusy(false);
      });
  }, [address, backToAccount, pass]);

  return (
    <DraggableModal onClose={backToAccount} open>
      <>
        <SimpleModalTitle
          icon='vaadin:download-alt'
          onClose={backToAccount}
          title={t('Export Account')}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <NewAddress
          address={address}
          style={{ my: '25px' }}
        />
        <Grid alignItems='center' container height='45px' textAlign='left'>
          <Warning
            iconDanger
            marginTop={0}
            theme={theme}
          >
            {t('You are exporting your account. Keep it safe and don’t share it with anyone.')}
          </Warning>
        </Grid>
        <Grid container item sx={{ '> div': { width: '87.5%' }, bottom: '75px', position: 'absolute' }}>
          <Password
            isError={isPasswordError}
            label={t('Password for this account')}
            onChange={onPassChange}
            onEnter={_onExportButtonClick}
          />
        </Grid>
        <Grid container item sx={{ '> div': { ml: 'auto', width: '87.5%' }, bottom: 0, height: '36px', position: 'absolute' }}>
          <ButtonWithCancel
            _isBusy={isBusy}
            _onClick={_onExportButtonClick}
            _onClickCancel={backToAccount}
            disabled={pass.length === 0 || !!isPasswordError}
            text={t('Export')}
          />
        </Grid>
      </>
    </DraggableModal>
  );
}
