// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Collapse } from '@mui/material';
import React from 'react';

interface Props {
  show: boolean;
}

export default function SettingSubMenuFullScreen({ show }: Props): React.ReactElement {
  return (
    <>
      <Collapse in={show}>
        <>

        </>
      </Collapse>
    </>
  );
}
