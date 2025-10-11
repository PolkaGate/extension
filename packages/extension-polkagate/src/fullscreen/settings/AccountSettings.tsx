// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { Broom, Edit2, ExportCurve, type Icon, ImportCurve, LogoutCurve, Notification as NotificationIcon, ShieldSecurity } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import RemoveAccount from '@polkadot/extension-polkagate/src/partials/RemoveAccount';
import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { Motion } from '../../components';
import { useSelectedAccount, useTranslation } from '../../hooks';
import { WebsitesAccess } from '../../partials';
import { VelvetBox } from '../../style';
import DeriveAccount from '../home/DeriveAccount';
import ExportAllAccounts from '../home/ExportAllAccounts';
import RenameAccount from '../home/RenameAccount';
import NotificationSettingsFS from '../notification/NotificationSettingsFS';

interface ActionBoxProps {
  Icon: Icon;
  label: string;
  path?: string;
  onClick?: () => void;
}

function ActionBox ({ Icon, label, onClick, path }: ActionBoxProps): React.ReactElement {
  const navigate = useNavigate();

  const _onClick = useCallback(() => {
    onClick
      ? onClick()
      : path && navigate(path) as void;
  }, [navigate, onClick, path]);

  return (
    <Stack direction='column' justifyContent='start' onClick={_onClick} rowGap='8px' sx={{ '&:hover': { bgcolor: '#2D1E4A', transform: 'translateY(-4px)' }, bgcolor: '#05091C', borderRadius: '14px', cursor: 'pointer', height: '86px', minWidth: '141px', px: '10px', transition: 'all 250ms ease-out', width: 'fit-content' }}>
      <Icon color='#AA83DC' size='24' style={{ marginTop: '17px' }} variant='Bulk' />
      <Typography sx={{ display: 'flex', fontWeight: 700, width: 'fit-content' }} variant='B-2'>
        {label}
      </Typography>
    </Stack>
  );
}

function AccountSettings (): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const popups = useMemo(() => {
    switch (extensionPopup) {
      case ExtensionPopups.NOTIFICATION:
        return (
          <NotificationSettingsFS
            handleClose={extensionPopupCloser}
          />
        );

        case ExtensionPopups.RENAME:
        return (
          <RenameAccount
            address={selectedAccount?.address}
            onClose={extensionPopupCloser}
          />
        );

      case ExtensionPopups.EXPORT:
        return (
          <ExportAllAccounts
            onClose={extensionPopupCloser}
          />
        );

      case ExtensionPopups.REMOVE:
        return (
          <RemoveAccount
            onClose={extensionPopupCloser}
            open
          />
        );

      case ExtensionPopups.DAPPS:
        return (
          <WebsitesAccess
            onClose={extensionPopupCloser}
            open
          />
        );

      case ExtensionPopups.DERIVE:
        return (
          <DeriveAccount
            closePopup={extensionPopupCloser}
          />
        );

      default:
        return null;
    }
  }, [extensionPopup, extensionPopupCloser, selectedAccount?.address]);

  return (
    <Motion variant='slide'>
      <VelvetBox>
        <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ backgroundColor: 'background.paper', borderRadius: '14px', height: 'calc(100vh - 305px)', minHeight: '600px', pl: '20px', position: 'relative', width: '100%' }}>
          <Typography color='text.primary' fontSize='22px' mt='30px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
            {t('Actions')}
          </Typography>
          <VelvetBox childrenStyle={{ columnGap: '4px', display: 'flex', flexDirection: 'row' }} style={{ margin: '20px 0', width: 'fit-content' }}>
            <ActionBox
              Icon={NotificationIcon}
              label={t('Notification')}
              onClick={extensionPopupOpener(ExtensionPopups.NOTIFICATION)}
            />
            <ActionBox
              Icon={Edit2}
              label={t('Rename Account')}
              onClick={extensionPopupOpener(ExtensionPopups.RENAME)}
            />
            <ActionBox
              Icon={ExportCurve}
              label={t('Export Accounts')}
              onClick={extensionPopupOpener(ExtensionPopups.EXPORT)}
            />
            <ActionBox
              Icon={ImportCurve}
              label={t('Import Accounts')}
              path='/account/have-wallet'
            />
            <ActionBox
              Icon={ShieldSecurity}
              label={t('Manage Website Access')}
              onClick={extensionPopupOpener(ExtensionPopups.DAPPS)}
            />
            {!selectedAccount?.isExternal &&
              <ActionBox
                Icon={Broom}
                label={t('Derive from Account')}
                onClick={extensionPopupOpener(ExtensionPopups.DERIVE)}
              />}
          </VelvetBox>
          <Stack alignItems='center' columnGap='5px' direction='row' onClick={extensionPopupOpener(ExtensionPopups.REMOVE)} sx={{ bottom: '20px', cursor: 'pointer', position: 'absolute' }}>
            <LogoutCurve color='#AA83DC' size={18} variant='Bulk' />
            <Typography sx={{ '&:hover': { color: '#AA83DC' }, color: '#BEAAD8', transition: 'all 250ms ease-out' }} variant='B-1'>
              {t('Remove account')}
            </Typography>
          </Stack>
        </Stack>
        {popups}
      </VelvetBox>
    </Motion>
  );
}

export default React.memo(AccountSettings);
