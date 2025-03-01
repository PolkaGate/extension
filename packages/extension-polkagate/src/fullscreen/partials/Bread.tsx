// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Breadcrumbs, Link, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import { capitalizeFirstLetter } from '../governance/utils/util';

export default function Bread(): React.ReactElement {
  const { address } = useParams<{ address: string, paramAssetId?: string }>();
  const { t } = useTranslation();

  const path = window.location.hash.replace('#/', '').split('/')[0];

  const segments = useMemo(() => {
    switch (path) {
      case ('accountfs'):
      case ('import'):
      case ('derivefs'):
      case ('addNewChain'):
        return [t('Home')];
      case ('managePoolValidators'):
        return [t('Home'), t('Account Details'), t('Staked in Pool')];
      case ('manageValidators'):
        return [t('Home'), t('Account Details'), t('Staked Solo')];
      default:
        return [t('Home'), t('Account Details')];
    }
  }, [path, t]);

  const backToTopMenu = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const { outerText } = event.target as HTMLElement;

    switch (outerText) {
      case (t('Home')):
      case (`${t('Home')} /`):
        return openOrFocusTab('/', true);
      case (t('Account Details')):
        return openOrFocusTab(`/accountfs/${address}/0`, true);
      case (t('Staked Solo')):
        return openOrFocusTab(`solofs/${address}/`, true);
      case (t('Staked in Pool')):
        return openOrFocusTab(`poolfs/${address}/`, true);
      default:
        return [];
    }
  }, [address, t]);

  return (
    <Breadcrumbs aria-label='breadcrumb' color='text.primary' separator='/' sx={{ mt: '10px' }}>
      {segments?.map((item, index) => (
        <Link component='button' key={index} onClick={backToTopMenu} sx={{ cursor: 'pointer' }} underline='hover'>
          <Typography color='text.primary' sx={{ fontSize: 15, fontWeight: 500 }}>
            {capitalizeFirstLetter(item)}{segments.length === 1 ? ' /' : ''}
          </Typography>
        </Link>
      ))}
    </Breadcrumbs>
  );
}
