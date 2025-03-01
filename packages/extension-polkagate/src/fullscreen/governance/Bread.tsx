// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TopMenu } from './utils/types';

import { Breadcrumbs, Grid, Link, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { useTranslation } from '../../hooks';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import { capitalizeFirstLetter } from './utils/util';

interface Props {
  address: string | undefined;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string>>
  topMenu: TopMenu;
  subMenu: string;
  postId?: string | undefined;
}

export default function Bread({ address, postId, setSelectedSubMenu, subMenu, topMenu }: Props): React.ReactElement {
  const history = useHistory();
  const { t } = useTranslation();

  const backToSubMenu = useCallback(() => {
    setSelectedSubMenu(subMenu);
  }, [setSelectedSubMenu, subMenu]);

  const backToTopMenu = useCallback(() => {
    address && topMenu && history.push({
      pathname: `/governance/${address}/${topMenu}`
    });
    setSelectedSubMenu('All');
  }, [address, history, setSelectedSubMenu, topMenu]);

  const toHome = useCallback(() => {
    openOrFocusTab('/', true);
  }, []);

  return (
    <Grid container sx={{ py: '10px' }}>
      <Breadcrumbs aria-label='breadcrumb' color='text.primary'>
        <Link onClick={toHome} sx={{ cursor: 'pointer' }} underline='hover'>
          <Typography color='text.primary' sx={{ fontWeight: 500 }}>
            {t('Home')}
          </Typography>
        </Link>
        <Link onClick={backToTopMenu} sx={{ cursor: 'pointer' }} underline='hover'>
          <Typography color='text.primary' sx={{ fontWeight: 500 }}>
            {capitalizeFirstLetter(topMenu || '')}
          </Typography>
        </Link>
        {postId
          ? <Link onClick={backToSubMenu} sx={{ cursor: 'pointer' }} underline='hover'>
            <Typography color='text.primary' sx={{ fontWeight: 500 }}>
              {subMenu}
            </Typography>
          </Link>
          : <Typography color='text.primary' sx={{ fontWeight: 500 }}>
            {subMenu || 'All'}
          </Typography>
        }
        {postId &&
          <Typography color='text.primary' sx={{ fontWeight: 500 }}>
            {`Referendum #${postId}`}
          </Typography>
        }
      </Breadcrumbs>
    </Grid>
  );
}
