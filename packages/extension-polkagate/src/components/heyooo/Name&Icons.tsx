// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import useToast from '../../../../extension-ui/src/hooks/useToast';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';

interface Props {
  address: string | undefined | null;
  name: string | undefined;
  toggleVisibility: () => void;
}

export default function NameIcons({ address, name, toggleVisibility }: Props): React.ReactElement<Props> {
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
      xs={7.5}
    >
      <Grid
        container
        direction='row'
        item
      >
        <Grid
          item
          maxWidth='67%'
        >
          <Typography
            fontSize='28px'
            fontWeight={300}
            overflow='hidden'
            textOverflow='ellipsis'
            whiteSpace='nowrap'
          >
            {name}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            onClick={toggleVisibility}
            sx={{ height: '21px', width: '21px', m: '10px' }}
          >
            <FontAwesomeIcon
              color={theme.palette.secondary.light}
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
              sx={{ height: '21px', width: '21px', m: '10px 0' }}
            >
              <FontAwesomeIcon
                color={theme.palette.secondary.light}
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
      >
        <Grid
          fontSize='18px'
          fontWeight={300}
          item
        >
          {'123.45 kKSM'}
        </Grid>
        <Divider sx={{ backgroundColor: 'text.primary', height: 'auto', mx: '5px' }} orientation='vertical' />
        <Grid
          fontSize='18px'
          fontWeight={300}
          item
        >
          {'$456.78 K'}
        </Grid>
      </Grid>
    </Grid>
  );
}
