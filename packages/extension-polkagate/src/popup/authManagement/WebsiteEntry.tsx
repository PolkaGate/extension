// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';
import styled from 'styled-components';

import { AuthUrlInfo } from '@polkadot/extension-base/background/handlers/State';
import { RemoveAuth, Switch } from '@polkadot/extension-ui/components';

import useTranslation from '../../hooks/useTranslation';
import { Grid } from '@mui/material';
import { BorderBottom } from '@mui/icons-material';

interface Props {
  info: AuthUrlInfo;
  toggleAuth: (url: string) => void;
  removeAuth: (url: string) => void;
  url: string;
}

export default function WebsiteEntry({ info, removeAuth, toggleAuth, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const switchAccess = useCallback(() => {
    toggleAuth(url);
  }, [toggleAuth, url]);

  const _removeAuth = useCallback(() => {
    removeAuth(url);
  }, [removeAuth, url]);

  return (
    <Grid
      container
      sx={{
        borderBottom: '1px solid',
        borderBottomColor: 'secondaary.light'
      }}
    >
      <Grid
        alignItems='center'
        container
        item
        justifyContent='center'
        sx={{
          borderRight: '1px solid',
          borderRightColor: 'secondary.light'
        }}
        xs={6}
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
        xs={5}
      >
        <Switch
          checked={info.isAllowed}
          checkedLabel={t<string>('allowed')}
          className='info'
          onChange={switchAccess}
          uncheckedLabel={t<string>('denied')}
        />
      </Grid>
      <Grid
        alignItems='center'
        container
        item
        justifyContent='center'
        onClick={_removeAuth}
      >
        <RemoveAuth />
      </Grid>
    </Grid>
  );
}
