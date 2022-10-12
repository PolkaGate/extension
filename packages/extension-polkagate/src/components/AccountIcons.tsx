// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import useToast from '../hooks/useToast';
import useTranslation from '../hooks/useTranslation';
import { Proxy } from '../util/plusTypes';
import Identicon from './Identicon';

interface Props {
  address: string | null;
  recoverable?: boolean;
  identiconTheme: IconTheme;
  prefix?: number;
  proxies: Proxy[] | undefined
}

export default function AccountIcons({ address, identiconTheme, prefix, proxies, recoverable = false }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { show } = useToast();
  const { t } = useTranslation();

  const _onCopy = useCallback(
    () => show(t('Copied')),
    [show, t]
  );

  return (
    <Grid
      container
      direction='column'
      xs={3}
    >
      <Grid
        item
        m='auto'
        width='fit-content'
      >
        <Identicon
          iconTheme={identiconTheme}
          onCopy={_onCopy}
          prefix={prefix}
          size={40}
          value={address}
        />
      </Grid>
      <Grid
        container
        direction='row'
        item
        justifyContent='center'
      >
        <Grid item title={t('is recoverable')}>
          <IconButton
            disabled={!recoverable}
            sx={{ height: '15px', width: '15px' }}
          >
            <FontAwesomeIcon
              color={recoverable ? theme.palette.success.main : theme.palette.action.disabledBackground}
              fontSize='13px'
              icon={faShieldHalved}
            />
          </IconButton>
        </Grid>
        <Grid item title={t('has proxy')}>
          <IconButton
            disabled={!proxies?.length}
            sx={{ height: '15px', width: '15px' }}
          >
            <FontAwesomeIcon
              color={proxies?.length ? theme.palette.success.main : theme.palette.action.disabledBackground}
              fontSize='13px'
              icon={faSitemap}
            />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}
