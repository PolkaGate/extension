// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Box, Container, Grid, Link, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { logoTransparent } from '../../assets/logos';
import { EXTENSION_NAME } from '../../util/constants';

function Header(): React.ReactElement {
  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', p: '5px 15px', position: 'relative', zIndex: 1 }}>
        <Grid alignItems='center' container item width='fit-content'>
          <Box
            component='img'
            src={logoTransparent as string}
            sx={{ width: 43 }}
          />
          <Typography color='text.primary' fontFamily='Eras' fontSize='20px' fontWeight={400}>
            {EXTENSION_NAME}
          </Typography>
        </Grid>
        <Link
          href='https://docs.polkagate.xyz/polkagate'
          sx={{
            '&:hover': { bgcolor: '#674394', transition: 'all 250ms ease-out' },
            alignItems: 'center',
            bgcolor: '#BFA1FF26',
            borderRadius: '10px',
            cursor: 'pointer',
            height: '30px',
            justifyContent: 'center',
            p: '5px',
            transition: 'all 250ms ease-out',
            width: '30px'
          }}
          target='_blank'
        >
          <QuestionMarkIcon sx={{ color: '#AA83DC', fontSize: '20px', stroke: '#AA83DC', strokeWidth: '1px' }} />
        </Link>
      </Container>
    </>
  );
}

export default Header;
