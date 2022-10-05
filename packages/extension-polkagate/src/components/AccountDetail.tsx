// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import useToast from '../../../extension-ui/src/hooks/useToast';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { copy1, eye, eyeSlashP } from '../assets/icons';

interface Props {
  address: string | undefined | null;
  name: string | undefined;
  toggleVisibility: () => void;
}

export default function AccountDetail ({ address, name, toggleVisibility }: Props): React.ReactElement<Props> {
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
          maxWidth='65%'
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
            sx={{ height: '15px', mt: '13px', mx: '7px', p: 0, width: '24px' }}
          >
            <Avatar
              alt={'logo'}
              src={eye}
              sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, width: '22px' }}
            />
          </IconButton>
        </Grid>
        <Grid item>
          <CopyToClipboard text={String(address)}>
            <IconButton
              onClick={_onCopy}
              sx={{ height: '23px', m: '10px 0', width: '25px' }}
            >
              <Avatar
                alt={'logo'}
                src={copy1}
                sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, width: '23px' }}
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
        <Divider
          orientation='vertical'
          sx={{
            backgroundColor: 'text.primary',
            height: '19px',
            mx: '5px',
            my: 'auto'
          }}
        />
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
