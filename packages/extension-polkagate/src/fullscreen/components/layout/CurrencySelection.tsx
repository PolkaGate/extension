// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Typography, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { CurrencyContext } from '@polkadot/extension-polkagate/src/components';
import SelectCurrency from '@polkadot/extension-polkagate/src/popup/home/partial/SelectCurrency';

import { useIsDark } from '../../../hooks';

function CurrencySelection(): React.ReactElement {
  const { currency } = useContext(CurrencyContext);
  const isDark = useIsDark();
  const theme = useTheme();

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const toggleMenu = useCallback(() => setOpenMenu((isOpen) => !isOpen), []);

  return (
    <>
      <Container
        disableGutters
        onClick={toggleMenu}
        sx={{
          ':hover': { background: isDark ? '#674394' : '#F3F6FD' },
          alignItems: 'center',
          backdropFilter: 'blur(20px)',
          background: isDark ? '#2D1E4A80' : '#FFFFFF',
          border: isDark ? 'none' : '1px solid #DDE3F4',
          borderRadius: '12px',
          boxShadow: isDark ? '0px 0px 24px 8px #4E2B7259 inset' : '0px 8px 22px rgba(133, 140, 176, 0.12)',
          columnGap: '5px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          p: '2px',
          transition: 'all 250ms ease-out',
          width: 'fit-content'
        }}
      >
        <Box alignItems='center' justifyContent='center' sx={{ background: isDark ? '#2D1E4A80' : '#F2F5FD', border: isDark ? 'none' : '1px solid #E3E8F7', borderRadius: '10px', display: 'flex', height: '28px', width: '28px' }}>
          <Typography color={isDark ? '#AA83DC' : theme.palette.text.secondary} variant='B-2'>
            {currency?.sign}
          </Typography>
        </Box>
        <Typography color='text.primary' variant='B-2'>
          {currency?.code}
        </Typography>
        <ArrowDown2 color={isDark ? '#BEAAD8' : '#8F97B8'} size='18' variant='Bold' />
      </Container>
      <SelectCurrency
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />
    </>
  );
}

export default CurrencySelection;
