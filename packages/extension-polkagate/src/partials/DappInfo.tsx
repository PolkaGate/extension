// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Container, Grid, Typography } from '@mui/material';
import React, { } from 'react';

import { MySkeleton } from '../components';

interface Props {
  favicon?: string | null;
  dappName?: string;
}

function DappInfo ({ dappName, favicon }: Props): React.ReactElement {
  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#1B133C', border: '1px solid', borderColor: '#BEAAD833', borderRadius: '14px', display: 'flex', justifyContent: 'center', my: '15px', p: '4px', width: '90%' }}>
      {favicon
        ? (<Avatar
          src={favicon ?? undefined}
          sx={{
            borderRadius: '10px',
            height: '32px',
            width: '32px'
          }}
          variant='square'
        />)
        : (<MySkeleton
          style={{ borderRadius: '10px', height: '32px', width: '32px' }}
        />)
      }
      <Grid alignItems='center' container item justifyContent='center' xs>
        <Typography color='text.secondary' sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
          {dappName}
        </Typography>
      </Grid>
    </Container>
  );
}

export default React.memo(DappInfo);
