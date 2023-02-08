// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, SxProps, Theme, Typography } from '@mui/material';
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

export default function ShowIdentity ({ accountIdentity, style }: Props): React.ReactElement {
  const { t } = useTranslation();

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
      <Label label={t<string>('Identity')}>
        <Grid container sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', maxHeight: '170px', minHeight: '38px', overflow: 'hidden' }}>
          {accountIdentity
            ? <Grid container item>
              <Grid display='block' item sx={{ borderRight: '1px solid', borderRightColor: 'secondary.light', p: '10px' }} xs={4}>
                <Typography fontSize='12px' fontWeight={400}>
                  {t<string>('Display')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t<string>('Legal')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t<string>('Email')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t<string>('Element')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t<string>('Twitter')}:
                </Typography>
                <Typography fontSize='12px' fontWeight={400}>
                  {t<string>('Web')}:
                </Typography>
              </Grid>
              <Grid display='block' item p='10px' xs={8}>
                {identity &&
                  Object.entries(identity).map(([key, value]) => (
                    <Typography fontSize='12px' fontWeight={300} key={key} visibility={value ? 'visible' : 'hidden'}>
                      {value ?? 'nan'}
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
                  {t<string>('No identity found')}
                </Typography>
              </Grid>
              : <Grid alignItems='center' container justifyContent='center'>
                <Grid item role='progressbar'>
                  <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
                </Grid>
                <Typography fontSize='13px' lineHeight='41px' pl='10px'>
                  {t<string>('looking for identity...')}
                </Typography>
              </Grid>
          }
        </Grid>
      </Label>
    </Grid>
  );
}
