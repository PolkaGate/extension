// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { Share } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { CurrencyContext } from '@polkadot/extension-polkagate/src/components';

import { useIsDark } from '../../../hooks';
import SelectCurrency from './SelectCurrency';

function Currency () {
  const { currency } = useContext(CurrencyContext);
  const isDark = useIsDark();

  const containerStyle: SxProps<Theme> = {
    '&:hover': {
      bgcolor: '#674394',
      transition: 'all 250ms ease-out'
    },
    bgcolor: isDark ? '#BFA1FF26' : ' #FFFFFF',
    borderRadius: '12px',
    columnGap: '2px',
    cursor: 'pointer',
    p: '5px 7px',
    transition: 'all 250ms ease-out',
    width: 'fit-content'
  };

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const toggleMenu = useCallback(() => setOpenMenu((isOpen) => !isOpen), []);

  return (
    <>
      <Grid alignItems='center' container item justifyContent='center' onClick={toggleMenu} sx={containerStyle}>
        <Share color={isDark ? '#BEAAD8' : '#745D8B'} size='18' variant='Bold' />
        <Typography color={isDark ? '#BEAAD8' : '#745D8B'} textTransform='uppercase' variant='B-2'>
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
