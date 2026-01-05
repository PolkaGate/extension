// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import saveAs from 'file-saver';
import { Import } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { noop } from '@polkadot/util';

import { user } from '../../../assets/gif/index';
import { AccountContext, ActionButton, ActionContext, Address2, BackWithLabel, GradientBox2, GradientButton, Motion, MySnackbar, PasswordInput } from '../../../components';
import MySwitch from '../../../components/MySwitch';
import { useIsExtensionPopup, useSelectedAccount, useTranslation } from '../../../hooks';
import { exportAccount, exportAccounts } from '../../../messaging';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';

/**
 * AccountSettings component allows users to export their accounts as encrypted JSON files.
 * Users can choose to export a single account or all accounts at once.
 *
 * @component
 * @returns {React.ReactElement} The rendered account settings page.
 *
 * Features:
 * - Displays the selected account.
 * - Allows entering a password for encryption.
 * - Supports exporting either a single account or all accounts.
 * - Uses a snackbar to show export completion.
 */
export function ExportAccountsBody({ address, isExternal, name, onBack }: { address: string | undefined, isExternal?: boolean | undefined, name: string | undefined, onBack?: () => void }): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const isExtension = useIsExtensionPopup();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [password, setPassword] = useState<string>();
  const [incorrectPassword, setPasswordIncorrect] = useState<boolean>();
  const [isExportAll, setExportAll] = useState<boolean>(!!isExternal);

  const onExportAll = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    !isExternal && setExportAll(checked);
  }, [isExternal]);

  const onCurrentPasswordChange = useCallback((pass: string | null): void => {
    setPasswordIncorrect(false);
    setPassword(pass || '');
  }, []);

  const onSnackbarClose = useCallback(() => {
    setShowSnackbar(false);
  }, []);

  const onExport = useCallback(async (): Promise<void> => {
    if (!address || !password) {
      return;
    }

    try {
      const { exportedJson } = isExportAll
        ? await exportAccounts(accounts.map((acc) => acc.address), password)
        : await exportAccount(address, password);

      const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json; charset=utf-8' });

      setShowSnackbar(true);

      saveAs(blob, isExportAll ? `batch_exported_account_${Date.now()}.json` : `${address}.json`);
    } catch (err) {
      console.error(err);
      setPasswordIncorrect(true);
    }
  }, [address, accounts, isExportAll, password, setShowSnackbar, setPasswordIncorrect]);

  const content = (
    <>
      <Stack columnGap='15px' direction='column' sx={{ p: isExtension ? '15px' : 0, position: 'relative', pt: 0, zIndex: 1 }}>
        <Box component='img' src={user as string} sx={{ alignSelf: 'center', width: '76px' }} />
        <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px' }} textAlign='start' variant='B-4'>
          {t('Your account(s) will be encrypted with your password and saved as a JSON file in your browser’s downloads. You can later import them into the extension using the same password.')}
        </Typography>
        <Grid container item sx={{ my: '10px', position: 'relative' }}>
          <Stack columnGap='8px' direction='row' justifyContent='end' sx={{ alignItems: 'center', position: 'absolute', right: 0, top: '14px' }}>
            <Typography color='#AA83DC' variant='B-4'>
              {t('Export All Accounts')}
            </Typography>
            <MySwitch
              checked={isExternal ? true : isExportAll}
              onChange={onExportAll}
            />
          </Stack>
          {address &&
            <Address2
              address={address}
              label={t('Account')}
              labelMarginTop='15px'
              name={name}
              style={{
                bgcolor: '#1B133C',
                border: '1px solid #BEAAD833',
                borderRadius: '12px',
                height: '44px'
              }}
            />}
        </Grid>
        <PasswordInput
          focused
          hasError={!!incorrectPassword}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onEnterPress={onExport}
          onPassChange={onCurrentPasswordChange}
          style={{ marginBottom: '18px' }}
          title={isExportAll ? t('Password') : t('Your Password')}
        />
        <GradientButton
          StartIcon={Import}
          disabled={!password}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={onExport}
          startIconSize={18}
          style={{ flex: 'none', height: '48px', width: '100%' }}
          text={t('Export')}
        />
        {!isExtension && onBack &&
          <ActionButton
            contentPlacement='center'
            onClick={onBack}
            style={{ height: '44px', margin: '20px 0 0' }}
            text={t('Cancel')}
          />
        }
        <MySnackbar
          onClose={onSnackbarClose}
          open={showSnackbar}
          text={t('Account export is completed!')}
        />
      </Stack>
    </>
  );

  return (
    <Motion style={{ borderRadius: '14px', margin: isExtension ? '15px 15px 0' : '15px 5px 0', overflow: 'hidden', width: 'auto' }} variant={isExtension ? 'slide' : 'fade'}>
      {isExtension
        ? <GradientBox2 style={{ border: '4px solid #1B133C', borderRadius: '14px', boxShadow: 'none', overflow: 'none' }} withGradientTopBorder={false}>
          {content}
        </GradientBox2>
        : content
      }
    </Motion>
  );
}

function Export(): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const onAction = useContext(ActionContext);

  const onBack = useCallback(() => account?.address ? onAction(`/settings-account/${account?.address}`) : noop, [account?.address, onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('Export Account')}
      />
      <ExportAccountsBody
        address={account?.address}
        isExternal={account?.isExternal}
        name={account?.name}
      />
      <HomeMenu />
    </Container>
  );
}

export default React.memo(Export);
