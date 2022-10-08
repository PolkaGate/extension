// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext } from '../../../extension-ui/src/components';
import { connect, connectB, key, keyB, qr, qrB, restore, restoreB, sitemap, sitemapB } from '../assets/icons';
import MenuItem from '../components/MenuItem';

interface Props {
  className?: string;
}

export default function ImportAccSubMenu({ className }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const _goToImportAcc = useCallback(
    () => {
      onAction('/account/import-seed');
    }, [onAction]
  );

  return (
    <>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid
        container
        direction='column'
        sx={{ p: '18px 0 15px 10px' }}
      >
        <MenuItem
          Icon={theme.palette.mode === 'light' ? restoreB : restore}
          py='4px'
          text='Restore from JSON file'
        // onClick={}
        />
        <MenuItem
          Icon={theme.palette.mode === 'light' ? keyB : key}
          onClick={_goToImportAcc}
          py='4px'
          text='Import from Mnemonic'
        />
        <MenuItem
          Icon={theme.palette.mode === 'light' ? qrB : qr}
          py='4px'
          text='Attach external QR-signer '
        // onClick={ }
        />
        <MenuItem
          Icon={theme.palette.mode === 'light' ? connectB : connect}
          py='4px'
          text='Connect ledger device'
        // onClick={ }
        />
        <MenuItem
          Icon={theme.palette.mode === 'light' ? sitemapB : sitemap}
          py='4px'
          text='Add proxied address'
        // onClick={ }
        />
      </Grid>
    </>
  );
}
