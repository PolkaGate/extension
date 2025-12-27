// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography } from '@mui/material';
import { Data, Edit2, ExportCurve, ImportCurve, LogoutCurve, Notification, ShieldSecurity } from 'iconsax-react';
import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { windowOpen } from '@polkadot/extension-polkagate/src/messaging';
import { setStorage } from '@polkadot/extension-polkagate/src/util';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { ActionCard, BackWithLabel, Motion } from '../../../components';
import { useAccountSelectedChain, useTranslation } from '../../../hooks';
import { UserDashboardHeader, WebsitesAccess } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import RemoveAccount from '../../../partials/RemoveAccount';
import RenameAccount from '../../../partials/RenameAccount';
import { ExtensionPopups, STORAGE_KEY } from '../../../util/constants';

type State = { pathname: string } | undefined;

function AccountSettings (): React.ReactElement {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { address } = useParams<{ address: string }>();
  const selectedChain = useAccountSelectedChain(address);
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  useEffect(() => {
    if (!address) {
      return;
    }

    setStorage(STORAGE_KEY.SELECTED_ACCOUNT, address).catch(console.error);
  }, [address]);

  const isComingFromAccountsList = (location.state as State)?.pathname === '/accounts';
  const onBack = useCallback(() => navigate(isComingFromAccountsList ? (location.state as State)?.pathname ?? '' : '/settings') as void, [isComingFromAccountsList, location, navigate]);

  const onNotificationSettings = useCallback(() => navigate('/notification/settings') as void, [navigate]);
  const onExport = useCallback(() => navigate('/settings-account-export') as void, [navigate]);
  const onImport = useCallback(() => windowOpen('/account/have-wallet') as unknown as void, []);
  const onManageProxy = useCallback(() => windowOpen(`/proxyManagement/${address}/${selectedChain}`) as unknown as void, [address, selectedChain]);
  const onCloseRemove = useCallback(() => navigate('/') as void, [navigate]);

  const CARD_STYLE = { alignItems: 'center', height: '58px', mt: '5px' };

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader fullscreenURL='/settingsfs/account' homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('Account Settings')}
      />
      <Motion style={{ padding: ' 0 15px' }} variant='slide'>
        <ActionCard
          Icon={Notification}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={onNotificationSettings}
          style={{ ...CARD_STYLE }}
          title={t('Notifications')}
        />
        <ActionCard
          Icon={Data}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={onManageProxy}
          style={{ ...CARD_STYLE }}
          title={t('Manage Proxies')}
        />
        <ActionCard
          Icon={Edit2}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={extensionPopupOpener(ExtensionPopups.RENAME)}
          style={{ ...CARD_STYLE }}
          title={t('Rename Account')}
        />
        <ActionCard
          Icon={ImportCurve}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={onImport}
          style={{ ...CARD_STYLE }}
          title={t('Import Account')}
        />
        <ActionCard
          Icon={ExportCurve}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={onExport}
          style={{ ...CARD_STYLE }}
          title={t('Export Account')}
        />
        <ActionCard
          Icon={ShieldSecurity}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={extensionPopupOpener(ExtensionPopups.DAPPS)}
          style={{ ...CARD_STYLE }}
          title={t('Websites Access')}
        />
        <Stack alignItems='center' columnGap='5px' direction='row' onClick={extensionPopupOpener(ExtensionPopups.REMOVE)} sx={{ cursor: 'pointer', mt: '25px' }}>
          <LogoutCurve color='#AA83DC' size={18} variant='Bulk' />
          <Typography sx={{ '&:hover': { color: '#AA83DC' }, color: '#BEAAD8', transition: 'all 250ms ease-out' }} variant='B-1'>
            {t('Remove account')}
          </Typography>
        </Stack>
      </Motion>
      <HomeMenu />
      <RenameAccount
        onClose={extensionPopupCloser}
        open={extensionPopup === ExtensionPopups.RENAME}
      />
      <RemoveAccount
        onClose={extensionPopupCloser}
        open={extensionPopup === ExtensionPopups.REMOVE}
      />
      <WebsitesAccess
        onClose={extensionPopupCloser}
        open={extensionPopup === ExtensionPopups.DAPPS}
      />
    </Container>
  );
}

export default React.memo(AccountSettings);
