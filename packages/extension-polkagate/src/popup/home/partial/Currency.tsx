// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { Share } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { CurrencyContext } from '@polkadot/extension-polkagate/src/components';

import { useIsDark } from '../../../hooks';
import SelectCurrency from './SelectCurrency';

function Currency() {
  const { currency } = useContext(CurrencyContext);
  const isDark = useIsDark();
  const hoverBg = isDark ? '#674394' : '#EEF1FF';
  const textColor = isDark ? '#BEAAD8' : '#745D8B';

  const containerStyle: SxProps<Theme> = {
    '&:hover': {
      bgcolor: hoverBg,
      transition: 'all 250ms ease-out'
    },
    bgcolor: isDark ? '#BFA1FF26' : '#FFFFFF',
    border: '1px solid',
    borderColor: isDark ? 'transparent' : '#E1E5F3',
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
        <Share color={textColor} size='18' variant='Bold' />
        <Typography color={textColor} textTransform='uppercase' variant='B-2'>
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
