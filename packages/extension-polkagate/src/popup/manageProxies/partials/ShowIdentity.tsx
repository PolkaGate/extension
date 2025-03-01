// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React, { useEffect, useState } from 'react';

import Label from '../../../components/Label';
import { useTranslation } from '../../../hooks';

interface Props {
  accountIdentity?: DeriveAccountRegistration | undefined | null;
  style?: SxProps<Theme> | undefined;
}

interface IdentityProps {
  display: string | undefined;
  legal: string | undefined;
  email: string | undefined;
  element: string | undefined;
  twitter: string | undefined;
  web: string | undefined;
}

export default function ShowIdentity({ accountIdentity, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [identity, setIdentity] = useState<IdentityProps | undefined>();

  useEffect(() => {
    if (!accountIdentity) {
      return;
    }

    const Id = {
      display: accountIdentity.display,
      element: accountIdentity?.riot,
      email: accountIdentity?.email,
      legal: accountIdentity?.legal,
      twitter: accountIdentity?.twitter,
      web: accountIdentity?.web
    };

    setIdentity(Id);
  }, [accountIdentity]);

  return (
    <Grid sx={{ ...style }}>
      <Label label={t('Identity')}>
        <Grid container sx={{ bgcolor: 'background.paper', borderRadius: '5px', maxHeight: '170px', minHeight: '38px', overflow: 'hidden' }}>
          {accountIdentity
            ? <Grid container item>
              <Grid display='block' item sx={{ borderRight: '1px solid', borderRightColor: theme.palette.divider, p: '10px' }} xs={4}>
                <Typography fontSize='12px' fontWeight={400}>
                  {t('Display')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t('Legal')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t('Email')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t('Element')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t('X')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t('Web')}:
                </Typography>
              </Grid>
              <Grid display='block' item p='10px' xs={8}>
                {identity &&
                  Object.entries(identity).map(([key, value]) => (
                    <Typography fontSize='12px' fontWeight={300} key={key}>
                      {value || '--- ---'}
                    </Typography>
                  ))}
              </Grid>
            </Grid>
            : accountIdentity === null
              ? <Grid alignItems='center' container display='inline-flex' justifyContent='center'>
                <FontAwesomeIcon
                  className='warningImage'
                  icon={faExclamationTriangle}
                />
                <Typography fontSize='12px' fontWeight={400} lineHeight='20px' pl='8px'>
                  {t('No identity found')}
                </Typography>
              </Grid>
              : <Grid alignItems='center' container justifyContent='center'>
                <Grid item role='progressbar'>
                  <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
                </Grid>
                <Typography fontSize='13px' lineHeight='41px' pl='10px'>
                  {t('looking for identity...')}
                </Typography>
              </Grid>
          }
        </Grid>
      </Label>
    </Grid>
  );
}
