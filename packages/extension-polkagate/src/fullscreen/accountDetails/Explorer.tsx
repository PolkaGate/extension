// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Link } from '@mui/material';
import React, { memo } from 'react';

import { subscanTransparent } from '../../assets/icons';

interface Props {
  address: string | undefined;
}

function Explorer ({ address }: Props): React.ReactElement {
  return (
    <Link alignItems='center' href={`https://portfolio.subscan.io/account/${String(address)}`} justifyContent='center' rel='noreferrer' sx={{ bgcolor: '#FF4FB91A', borderRadius: '128px', display: 'flex', height: '32px', position: 'absolute', right: '10px', top: '10px', cursor: 'pointer', width: '32px' }} target='_blank'>
      <Avatar
        src={subscanTransparent as string}
        sx={{
          borderRadius: '50%',
          height: 20,
          width: 20,
          zIndex: 2
        }}
        variant='square'
      />
    </Link>
  );
}

export default memo(Explorer);
