// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container } from '@mui/material';
import { Category, DocumentDownload, Edit2, LogoutCurve, Notification, People } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { ActionCard, ActionContext, BackWithLabel, Motion } from '../../../components';
import { useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import RemoveAccount from '../../../partials/RemoveAccount';
import RenameAccount from '../../../partials/RenameAccount';
import { ExtensionPopups } from '../../../util/constants';

function AccountSettings (): React.ReactElement {
  const { t } = useTranslation();
  const location = useLocation();
  const [popup, setPopup] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  const onAction = useContext(ActionContext);

  const isComingFromAccountsList = location.state?.pathname === '/accounts';
  const onBack = useCallback(() => onAction(isComingFromAccountsList ? location.state.pathname as string : '/settings'), [isComingFromAccountsList, location, onAction]);
  const onRename = useCallback(() => setPopup(ExtensionPopups.RENAME), []);
  const onForget = useCallback(() => setPopup(ExtensionPopups.FORGET), []);
  const onExport = useCallback(() => onAction('/settings-account-export'), [onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
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
          onClick={noop}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Notifications')}
        />
        <ActionCard
          Icon={Edit2}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={onRename}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Rename Account')}
        />
        <ActionCard
          Icon={People}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={noop}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Manage Profile')}
        />
        <ActionCard
          Icon={Category}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={noop}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Connected dApps')}
        />
        <ActionCard
          Icon={DocumentDownload}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={onExport}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Export Accounts')}
        />
        <ActionCard
          Icon={LogoutCurve}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={onForget}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Remove Account')}
        />
      </Motion>
      <HomeMenu />
      <RenameAccount
        open={popup === ExtensionPopups.RENAME}
        setPopup={setPopup}
      />
      <RemoveAccount
        open={popup === ExtensionPopups.FORGET}
        setPopup={setPopup}
      />
    </Container>
  );
}

export default React.memo(AccountSettings);
