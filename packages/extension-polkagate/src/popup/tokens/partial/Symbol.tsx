// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React from 'react';

import { MySkeleton } from '@polkadot/extension-polkagate/src/components';

export default function Symbol({ token }: { token: string | undefined }): React.ReactElement {
  return (
    <>
      {token
        ? <Typography color='text.secondary' variant='B-2'>
          {token}
        </Typography>
        : <MySkeleton style={{ margin: '5px 0 4px' }} width='50px' />
      }
    </>

  );
}
