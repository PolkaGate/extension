// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { Share } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { useCurrency } from '../../../hooks';
import SelectCurrency from './SelectCurrency';

const containerStyle: SxProps<Theme> = {
  '&:hover': {
    bgcolor: '#674394',
    transition: 'all 250ms ease-out'
  },
  bgcolor: '#BFA1FF26',
  borderRadius: '12px',
  columnGap: '2px',
  cursor: 'pointer',
  p: '5px 7px',
  transition: 'all 250ms ease-out',
  width: 'fit-content'
};

function Currency () {
  const currency = useCurrency();

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const toggleMenu = useCallback(() => setOpenMenu((isOpen) => !isOpen), []);

  return (
    <>
      <Grid alignItems='center' container item justifyContent='center' onClick={toggleMenu} sx={containerStyle}>
        <Share color='#BEAAD8' size='18' variant='Bold' />
        <Typography color='text.secondary' textTransform='uppercase' variant='B-2'>
          {currency?.code}
        </Typography>
      </Grid>
      <SelectCurrency
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />
    </>
  );
}

export default Currency;
