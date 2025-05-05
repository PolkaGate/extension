// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import saveAs from 'file-saver';
import { Import } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { user } from '../../../assets/gif/index';
import { AccountContext, ActionContext, Address2, BackWithLabel, GradientBox2, GradientButton, Motion, PasswordInput } from '../../../components';
import { useSelectedAccount, useTranslation } from '../../../hooks';
import { exportAccount, exportAccounts } from '../../../messaging';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import MySnackbar from '../extensionSettings/components/MySnackbar';
import MySwitch from '../extensionSettings/components/Switch';

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
function AccountSettings (): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const { accounts } = useContext(AccountContext);

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [password, setPassword] = useState<string>();
  const [incorrectPassword, setPasswordIncorrect] = useState<boolean>();
  const [isExportAll, setExportAll] = useState<boolean>();

  const onExportAll = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setExportAll(checked);
  }, []);

  const onCurrentPasswordChange = useCallback((pass: string | null): void => {
    setPasswordIncorrect(false);
    setPassword(pass || '');
  }, []);

  const onAction = useContext(ActionContext);

  const onBack = useCallback(() => onAction('/settings-account'), [onAction]);
  const onSnackbarClose = useCallback(() => {
    setShowSnackbar(false);
  }, []);

  const onExport = useCallback(async (): Promise<void> => {
    if (!account || !password) {
      return;
    }

    try {
      const exportedJson = isExportAll
        ? await exportAccounts(accounts.map((account) => account.address), password)
        : await exportAccount(account.address, password);

      const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json; charset=utf-8' });

      setShowSnackbar(true);

      saveAs(blob, isExportAll ? `batch_exported_account_${Date.now()}.json` : `${account.address}.json`);
    } catch (err) {
      console.error(err);
      setPasswordIncorrect(true);
    }
  }, [account, accounts, isExportAll, password, setShowSnackbar, setPasswordIncorrect]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('Export Accounts')}
      />
      <Motion style={{ borderRadius: '14px', margin: '15px 15px 0', overflow: 'hidden', width: 'auto' }} variant='slide'>
        <GradientBox2 style={{ border: '4px solid #1B133C', borderRadius: '14px', boxShadow: 'none', overflow: 'none' }} withGradientTopBorder={false}>
          <Stack columnGap='15px' direction='column' sx={{ p: '15px', pt: 0 }}>
            <Box component='img' src={user as string} sx={{ alignSelf: 'center', width: '76px' }} />
            <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px' }} textAlign='start' variant='B-4'>
              {t('Your account(s) will be encrypted with your password and saved as a JSON file in your browser’s downloads. You can later import them into the extension using the same password.')}
            </Typography>
            <Grid container item sx={{ position: 'relative', my: '10px' }}>
              <Stack columnGap='8px' direction='row' justifyContent='end' sx={{ alignItems: 'center', position: 'absolute', right: 0, top: '14px' }}>
                <Typography color='#AA83DC' variant='B-4'>
                  {t('Export All Accounts')}
                </Typography>
                <MySwitch
                  checked={Boolean(isExportAll)}
                  onChange={onExportAll}
                />
              </Stack>
              {account &&
                <Address2
                  address={account?.address}
                  label={t('Account')}
                  labelMarginTop='15px'
                  name={account?.name}
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
          </Stack>
          <MySnackbar
            onClose={onSnackbarClose}
            open={showSnackbar}
            text={t('Account export is completed!')}
          />
        </GradientBox2>
      </Motion>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(AccountSettings);
