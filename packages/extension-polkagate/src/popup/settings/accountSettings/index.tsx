// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography } from '@mui/material';
import { Category, DocumentDownload, Edit2, LogoutCurve, Notification, People } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';
import { noop } from '@polkadot/util';

import { AccountContext, ActionCard, ActionContext, BackWithLabel, Motion } from '../../../components';
import { useTranslation } from '../../../hooks';
import { UserDashboardHeader, WebsitesAccess } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import RemoveAccount from '../../../partials/RemoveAccount';
import RenameAccount from '../../../partials/RenameAccount';
import { ExtensionPopups } from '../../../util/constants';

function AccountSettings (): React.ReactElement {
  const { t } = useTranslation();
  const location = useLocation();
  const { accounts } = useContext(AccountContext);
  const { address } = useParams<{ address: string }>();

  const [popup, setPopup] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  useEffect(() => {
    if (!address) {
      return;
    }

    const accountToUnselect = accounts.find(({ address: addr, selected }) => selected && address !== addr);

    Promise.all([
      updateMeta(address, JSON.stringify({ selected: true })),
      ...(accountToUnselect ? [updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))] : [])
    ])
      .catch(console.error);
  }, [accounts, address]);

  const onAction = useContext(ActionContext);

  const isComingFromAccountsList = location.state?.pathname === '/accounts';
  const onBack = useCallback(() => onAction(isComingFromAccountsList ? location.state.pathname as string : '/settings'), [isComingFromAccountsList, location, onAction]);

  const onRename = useCallback(() => setPopup(ExtensionPopups.RENAME), []);
  const onDapps = useCallback(() => setPopup(ExtensionPopups.DAPPS), []);
  const onForget = useCallback(() => setPopup(ExtensionPopups.REMOVE), []);
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
          onClick={onDapps}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Websites Access')}
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
          title={t('Export Account')}
        />
        <Stack alignItems='center' columnGap='5px' direction='row' onClick={onForget} sx={{ cursor: 'pointer', mt: '25px' }}>
          <LogoutCurve color='#AA83DC' size={18} variant='Bulk' />
          <Typography sx={{ '&:hover': { color: '#AA83DC' }, color: '#BEAAD8', transition: 'all 250ms ease-out' }} variant='B-1'>
            {t('Remove account')}
          </Typography>
        </Stack>
      </Motion>
      <HomeMenu />
      <RenameAccount
        open={popup === ExtensionPopups.RENAME}
        setPopup={setPopup}
      />
      <RemoveAccount
        open={popup === ExtensionPopups.REMOVE}
        setPopup={setPopup}
      />
      <WebsitesAccess
        open={popup === ExtensionPopups.DAPPS}
        setPopup={setPopup}
      />
    </Container>
  );
}

export default React.memo(AccountSettings);
