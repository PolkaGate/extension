// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Divider, Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import settings from '@polkadot/ui-settings';

import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import getLanguageOptions from '../../../extension-ui/src/util/getLanguageOptions';
import { externalLink, ManageAccess, ManageAccessB } from '../assets/icons';
import { ActionContext, Checkbox, MenuItem, Select, Switch } from '../components';
import { useIsPopup } from '../hooks';
import { setNotification, windowOpen } from '../messaging';

interface Props {
  className?: string;
}

export default function SettingSubMenu({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPopup = useIsPopup();
  const onAction = useContext(ActionContext);

  const [notification, updateNotification] = useState(settings.notification);
  const [camera, setCamera] = useState(settings.camera === 'on');
  const [prefix, setPrefix] = useState(`${settings.prefix === -1 ? 42 : settings.prefix}`);

  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const notificationOptions = ['Extension', 'PopUp', 'Window'].map((item) => ({ text: item, value: item.toLowerCase() }));

  useEffect(() => {
    settings.set({ camera: camera ? 'on' : 'off' });
  }, [camera]);

  interface Option {
    text: string;
    value: string;
  }

  const prefixOptions = settings.availablePrefixes
    .filter(({ value }) => value !== -1)
    .map(({ text, value }): Option => ({ text, value: `${value}` }));

  const _onWindowOpen = useCallback(
    (): void => {
      windowOpen('/').catch(console.error);
    }, []
  );

  const _onAuthManagement = useCallback(() => {
    onAction('/auth-list');
  }, [onAction]);

  const _onChangeLang = useCallback(
    (value: string): void => {
      settings.set({ i18nLang: value });
    }, []
  );

  const _onChangePrefix = useCallback(
    (value: string): void => {
      setPrefix(value);
      settings.set({ prefix: parseInt(value, 10) });
    }, []
  );

  const _onChangeNotification = useCallback(
    (value: string): void => {
      setNotification(value).catch(console.error);

      updateNotification(value);
      settings.set({ notification: value });
    }, []
  );

  return (
    <>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid
        container
        direction='column'
        pl='30px'
        pt='10px'
      >
        <Grid
          alignItems='center'
          container
          item
          justifyContent='space-between'
        >
          <Grid
            item
          >
            <Switch theme={theme} />
          </Grid>
          {isPopup &&
            <>
              <Grid
                item
              >
                <Divider
                  orientation='vertical'
                  sx={{
                    backgroundColor: 'text.primary',
                    height: '20px',
                    my: 'auto'
                  }}
                />
              </Grid>
              <Grid
                item
              >
                <IconButton
                  sx={{ height: '35px', width: '35px' }}
                  onClick={_onWindowOpen}
                >
                  <Avatar
                    alt={'logo'}
                    src={externalLink}
                    sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, height: '28px', width: '28px' }}
                  />
                </IconButton>
              </Grid>
            </>
          }
        </Grid>
        <Grid
          item
          pt='12px'
        >
          <Select
            value={settings.i18nLang !== 'default' ? settings.i18nLang : languageOptions[0].value}
            label={t<string>('Language')}
            onChange={_onChangeLang}
            options={languageOptions}
          />
        </Grid>
        <Grid
          item
          pt='10px'
        >
          <Select
            value={notification ?? notificationOptions[1].value}
            label={t<string>('Notification')}
            onChange={_onChangeNotification}
            options={notificationOptions}
          />
        </Grid>
        <Grid
          item
          pt='20px'
        >
          <Checkbox
            checked={camera}
            label={t<string>('Allow QR camera access')}
            onChange={setCamera}
            style={{ fontSize: '18px', marginLeft: '-25px', marginTop: 0, textAlign: 'left' }}
            theme={theme}
          />
        </Grid>
        <Grid
          container
          item
        >
          <MenuItem
            icon={theme.palette.mode === 'dark' ? ManageAccess : ManageAccessB}
            onClick={_onAuthManagement}
            text={t<string>('Manage website access')}
          />
        </Grid>
        <Grid
          item
          pt='7px'
        >
          <Select
            value={prefix ?? prefixOptions[2].value}
            label={t<string>('Default display address format')}
            onChange={_onChangePrefix}
            options={prefixOptions}
          />
        </Grid>
      </Grid>
    </>
  );
}
