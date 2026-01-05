// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, type SxProps, Typography } from '@mui/material';
import React from 'react';

import { logoTransparent, logoWhite } from '../../../assets/logos';
import useIsDark from '../../../hooks/useIsDark';
import { WhatsNew } from '../../../partials';
import { EXTENSION_NAME } from '../../../util/constants';

function Introduction ({ style = {} }: { style?: SxProps }): React.ReactElement {
  const isDark = useIsDark();

  return (
    <Grid alignItems='center' columnGap='5px' container item sx={{ bgcolor: 'background.paper', borderRadius: '14px', height: '56px', px: '10px', ...style }}>
      <Box
        component='img'
        src={(isDark ? logoTransparent : logoWhite) as string}
        sx={{ width: 36 }}
      />
      <Grid alignItems='baseline' columnGap='5px' container item width='fit-content'>
        <Typography color='text.primary' fontFamily='Eras' fontSize='18px' fontWeight={400}>
          {EXTENSION_NAME}
        </Typography>
        <WhatsNew
          showLabel={false}
          style={{
            padding: 0,
            paddingLeft: '10px',
            width: 'fit-content'
          }}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(Introduction);
