// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import { faCopy, faEye, faEyeSlash, faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import useToast from '../../../../extension-ui/src/hooks/useToast';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';

interface Props {
  address: string | null;
  name: string | null;
}

export default function Icons({ address, name }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const { show } = useToast();
  const { t } = useTranslation();

  const _onCopy = useCallback(
    () => show(t('Copied')),
    [show, t]
  );

  const VisibilityHandler = useCallback(() => {

  }, []);

  return (
    <Grid
      container
      direction='column'
      xs={8}
    >
      <Grid
        container
        direction='row'
        item
      >
        <Grid item>
          <Typography
            fontSize='28px'
            fontWeight={300}
          >
            {name}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            onClick={VisibilityHandler}
            sx={{ height: '15px', width: '15px' }}
          >
            <FontAwesomeIcon
              color={theme.palette.primary.main}
              fontSize='20px'
              // icon={toggle ? faEye : faEyeSlash}
              icon={faEye}
              title={t('Visibilty')}
            />
          </IconButton>
        </Grid>
        <Grid item>
          <CopyToClipboard text={String(address)}>
            <IconButton
              onClick={_onCopy}
              sx={{ height: '15px', width: '15px' }}
            >
              <FontAwesomeIcon
                color={theme.palette.primary.main}
                fontSize='20px'
                icon={faCopy}
                title={t('Copy')}
              />
            </IconButton>
          </CopyToClipboard>
        </Grid>
      </Grid>
      <Grid
        container
        direction='row'
        item
        justifyContent='center'
      >
        <Grid item>
          <IconButton disabled={recoverable} sx={{ width: '15px', height: '15px' }}>
            <FontAwesomeIcon
              color={recoverable ? theme.palette.success.main : theme.palette.action.disabledBackground}
              fontSize='12px'
              icon={faShieldHalved}
              title={t('Recoverable')}
            />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton disabled={realAccount} sx={{ width: '15px', height: '15px' }}>
            <FontAwesomeIcon
              color={recoverable ? theme.palette.success.main : theme.palette.action.disabledBackground}
              fontSize='12px'
              icon={faSitemap}
              title={t('Recoverable')}
            />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}
