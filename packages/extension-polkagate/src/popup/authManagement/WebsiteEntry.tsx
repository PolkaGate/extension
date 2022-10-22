// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { AuthUrlInfo } from '@polkadot/extension-base/background/handlers/State';

import { RemoveAuth, Switch } from '../../components';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  info: AuthUrlInfo;
  toggleAuth: (url: string) => void;
  removeAuth: (url: string) => void;
  url: string;
}

export default function WebsiteEntry ({ info, removeAuth, toggleAuth, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const switchAccess = useCallback(() => {
    toggleAuth(url);
  }, [toggleAuth, url]);

  const _removeAuth = useCallback(() => {
    removeAuth(url);
  }, [removeAuth, url]);

  return (
    <Grid
      container
      item
      sx={{
        '&:last-child': {
          borderBottom: 'none'
        },
        borderBottom: '1px solid',
        borderBottomColor: 'secondary.light'
      }}
    >
      <Grid
        alignItems='center'
        container
        item
        maxWidth='163px'
        sx={{
          borderRight: '1px solid',
          borderRightColor: 'secondary.light',
          overflowX: 'hidden',
          pl: '5px',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {url}
      </Grid>
      <Grid
        alignItems='center'
        container
        item
        justifyContent='center'
        sx={{
          borderRight: '1px solid',
          borderRightColor: 'secondary.light'
        }}
        xs={5.2}
      >
        <Switch
          checkedLabel={t<string>('Allowed')}
          fontSize='12px'
          fontWeight={400}
          isChecked={info.isAllowed}
          onChange={switchAccess}
          theme={theme}
          uncheckedLabel={t<string>('Denied')}
        />
      </Grid>
      <Grid
        alignItems='center'
        container
        item
        justifyContent='center'
        onClick={_removeAuth}
        xs={0.8}
      >
        <RemoveAuth />
      </Grid>
    </Grid>
  );
}
