// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import Identicon from '../../../../extension-ui/src/components/Identicon';
import useToast from '../../../../extension-ui/src/hooks/useToast';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';

interface Props {
  address: string | null;
  recoverable?: boolean;
  realAccount?: boolean;
  identiconTheme: IconTheme;
  prefix?: number;
}

export default function Icons ({ address, identiconTheme, prefix, realAccount = false, recoverable = false }: Props): React.ReactElement<Props> {
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
        <Grid item>
          <IconButton
            disabled={recoverable}
            sx={{ height: '15px', width: '15px' }}
          >
            <FontAwesomeIcon
              color={recoverable ? theme.palette.success.main : theme.palette.action.disabledBackground}
              fontSize='12px'
              icon={faShieldHalved}
              title={t('Recoverable')}
            />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            disabled={realAccount}
            sx={{ height: '15px', width: '15px' }}
          >
            <FontAwesomeIcon
              color={recoverable ? theme.palette.success.main : theme.palette.action.disabledBackground}
              fontSize='12px'
              icon={faSitemap}
              title={t('RealAccount')}
            />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}
