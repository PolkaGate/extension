// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React from 'react';

import { useIsDark, useIsExtensionPopup } from '../../../hooks/index';
import Lock from './actions/Lock';
import Reload from './actions/Reload';
import ThemeChange from './actions/ThemeChange';

export default function ActionRow (): React.ReactElement {
  const isDark = useIsDark();
  const isExtension = useIsExtensionPopup();

  const style = {
    '&:hover': {
      bgcolor: isDark ? '#2D1E4A' : '#CCD2EA80'
    },
    bgcolor: 'background.paper',
    borderRadius: isExtension ? '16px' : '10px',
    cursor: 'pointer',
    height: isExtension ? '39px' : '36px',
    mt: '2px',
    transition: 'background-color 0.3s ease',
    width: isExtension ? '110px' : '36px'
  };

  return (
    <Grid columnGap={isExtension ? 0 : '7px' } container item justifyContent={isExtension ? 'space-between' : 'end'} >
      <Lock isExtension={isExtension} style={style} />
      {
        isExtension &&
        <ThemeChange />
      }
      <Reload isExtension={isExtension} style={style} />
    </Grid>
  );
}
