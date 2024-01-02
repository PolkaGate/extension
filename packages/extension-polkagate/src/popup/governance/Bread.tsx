// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Breadcrumbs, Grid, Link, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { capitalizeFirstLetter } from './utils/util';

interface Props {
  address: string | undefined;
  setSelectedSubMenu: React.Dispatch<React.SetStateAction<string>>
  topMenu: 'referenda' | 'fellowship';
  subMenu: string;
  postId?: string | undefined;
}

export default function Bread({ address, postId, setSelectedSubMenu, subMenu, topMenu }: Props): React.ReactElement {
  const history = useHistory();

  const backToSubMenu = useCallback(() => {
    setSelectedSubMenu(subMenu);
  }, [setSelectedSubMenu, subMenu]);

  const backToTopMenu = useCallback(() => {
    address && topMenu && history.push({
      pathname: `/governance/${address}/${topMenu}`
    });
    setSelectedSubMenu('All');
  }, [address, history, setSelectedSubMenu, topMenu]);

  return (
    <Grid container sx={{ py: '10px' }}>
      <Breadcrumbs aria-label='breadcrumb' color='text.primary'>
        <Link onClick={backToTopMenu} sx={{ cursor: 'pointer' }} underline='hover'>
          <Typography color='text.primary' sx={{ fontWeight: 500 }}>
            {capitalizeFirstLetter(topMenu)}
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
