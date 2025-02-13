// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid } from '@mui/material';
import { Category, DocumentDownload, Edit2, Logout, Notification, People } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { noop } from '@polkadot/util';

import { ActionCard, ActionContext, BackWithLabel } from '../../../components';
import { useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import RenameAccount from '../../../partials/RenameAccount';
import { ExtensionPopups } from '../../../util/constants';

function AccountSettings (): React.ReactElement {
  const { t } = useTranslation();
  const [popup, setPopup] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  const onAction = useContext(ActionContext);

  const onBack = useCallback(() => onAction('/settings'), [onAction]);

  const onRename = useCallback(() => setPopup(ExtensionPopups.RENAME), []);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('Account Settings')}
      />
      <Grid container item sx={{ px: '15px' }}>
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
          title={t('Connected Accounts')}
        />
        <ActionCard
          Icon={DocumentDownload}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={noop}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Export Accounts')}
        />
        <ActionCard
          Icon={Logout}
          iconColor='#FF4FB9'
          iconSize={24}
          iconWithoutTransform
          onClick={noop}
          style={{
            alignItems: 'center',
            height: '64px',
            mt: '8px'
          }}
          title={t('Forget Account')}
        />
      </Grid>
      <HomeMenu />
      <RenameAccount
        open={popup === ExtensionPopups.RENAME}
        setPopup={setPopup}
      />
    </Container>
  );
}

export default React.memo(AccountSettings);
