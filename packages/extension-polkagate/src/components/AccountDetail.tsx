// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import useToast from '../../../extension-ui/src/hooks/useToast';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { copy1, eye } from '../assets/icons';

interface Props {
  address: string | undefined | null;
  name: string | undefined;
  toggleVisibility: () => void;
}

export default function AccountDetail({ address, name, toggleVisibility }: Props): React.ReactElement<Props> {
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
            sx={{ height: '15px', p: 0, mt: '13px', mx: '7px', width: '24px' }}
          >
            {/* <FontAwesomeIcon
              color={theme.palette.secondary.light}
              fontSize='20px'
              // icon={toggle ? faEye : faEyeSlash}
              icon={faEye}
              title={t('Visibilty')}
            /> */}
            <Avatar
              alt={'logo'}
              src={eye}
              sx={{ height: '13px', width: '22px', borderRadius: 0, '> img': { objectFit: 'scale-down' } }}
            />
          </IconButton>
        </Grid>
        <Grid item>
          <CopyToClipboard text={String(address)}>
            <IconButton
              onClick={_onCopy}
              sx={{ height: '23px', m: '10px 0', width: '25px' }}
            >
              {/* <FontAwesomeIcon
                color={theme.palette.secondary.light}
                fontSize='20px'
                icon={faCopy}
                title={t('Copy')}
              /> */}
              <Avatar
                alt={'logo'}
                src={copy1}
                sx={{ height: '22px', width: '23px', borderRadius: 0, '> img': { objectFit: 'scale-down' } }}
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
            height: 'auto',
            mx: '5px'
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
