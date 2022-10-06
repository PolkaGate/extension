// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { Theme, ThemeProps } from '../types';

import { Avatar, Divider, Grid, IconButton, Input, InputLabel, useTheme } from '@mui/material';
import React, { useMemo, useState , useCallback} from 'react';

import settings from '@polkadot/ui-settings';

import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import getLanguageOptions from '../../../extension-ui/src/util/getLanguageOptions';
import { externalLink } from '../assets/icons';
import { ManageAccess, ManageAccessB } from '../assets/icons'
import Checkbox from '../components/Checkbox';
import MenuItem from '../components/MenuItem';
import Select from '../components/Select';
import Switch from '../components/Switch';
import {  windowOpen } from '../messaging';

interface Props {
  className?: string;
}

export default function SettingSubMenu({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const [hasCammeraAccess, setHasCammeraAccess] = useState<boolean>(false);

  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const notificationOptions = ['Extension', 'PopUp', 'Window']
    .map((item) => ({ text: item, value: item.toLowerCase() }));

  const prefixOptions = settings.availablePrefixes
    .filter(({ value }) => value !== -1)
    .map(({ text, value }): Option => ({ text, value: `${value}` }));

  const _onWindowOpen = useCallback(
    (): void => {
      windowOpen('/').catch(console.error);
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
        </Grid>
        <Grid
          item
          pt='12px'
        >
          <Select
            defaultValue={languageOptions[0].value}
            label={t<string>('Language')}
            options={languageOptions}
          />
        </Grid>
        <Grid
          item
          pt='10px'
        >
          <Select
            defaultValue={notificationOptions[1].value}
            label={t<string>('Notification')}
            options={notificationOptions}
          />
        </Grid>
        <Grid
          item
          pt='20px'
        >
          <Checkbox
            checked={hasCammeraAccess}
            label={t<string>('Allow QR Camera Access')}
            onChange={setHasCammeraAccess}
            style={{ marginTop: 0, marginLeft: '-20px' }}
            theme={theme}
          />
        </Grid>
        <Grid
          container
          item
        >
          <MenuItem
            Icon={theme.palette.mode === 'dark' ? ManageAccess : ManageAccessB}
            text={t<string>('Manage website access')}
          />
        </Grid>
        <Grid
          item
          pt='7px'
        >
          <Select
            defaultValue={prefixOptions[2].value}
            label={t<string>('Default display address format')}
            options={prefixOptions}
          />
        </Grid>
      </Grid>
    </>
  );
}
