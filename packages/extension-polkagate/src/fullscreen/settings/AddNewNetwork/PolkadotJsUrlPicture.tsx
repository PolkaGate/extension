// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Collapse } from '@mui/material';
import React from 'react';

import { endpointUrlPng } from '@polkadot/extension-polkagate/src/assets/img';

function PolkadotJsUrlPicture({ show }: { show: boolean | undefined }): React.ReactElement {
  return (
    <Collapse in={show} orientation='vertical' sx={{ mb: '60px', width: '100%' }}>
      <Box
        alt='endpoint in an URL'
        component='img'
        src={endpointUrlPng as string}
        sx={{
          borderRadius: '10px',
          height: 'auto',
          mt: '15px',
          width: '100%'
        }}
      />
    </Collapse>
  );
}

export default PolkadotJsUrlPicture;
