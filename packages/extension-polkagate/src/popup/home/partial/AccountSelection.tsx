// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Box, Container, Grid, Stack, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext, ScrollingTextBox } from '../../../components';
import { identiconBlue, identiconPink } from '../svg';
import SelectAccount from './SelectAccount';

function AccountSelection (): React.ReactElement {
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);

  const [selectedAccount, setSelectedAccount] = useState<AccountJson | undefined>();
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const toggleMenu = useCallback(() => setOpenMenu((isOpen) => !isOpen), []);

  useEffect(() => {
    const selected = accounts.find(({ selected }) => selected);

    if (!selectedAccount || selectedAccount !== selected) {
      setSelectedAccount(selected ?? accounts[0]);
    }
  }, [accounts, selectedAccount, openMenu]);

  return (
    <>
      <Container
        disableGutters
        onClick={toggleMenu}
        sx={{
          ':hover': { background: '#674394' },
          alignItems: 'center',
          background: '#BFA1FF26',
          borderRadius: '10px',
          columnGap: '5px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          p: '2px',
          transition: 'all 250ms ease-out',
          width: 'fit-content'
        }}
      >
        <Grid container item justifyContent='space-around' sx={{ background: '#2D1E4A', borderRadius: '9px', height: '26px', width: '26px' }}>
          <Stack columnGap='2px' direction='row'>
            <Box component='img' src={identiconPink as string} sx={{ width: '9.75px' }} />
            <Box component='img' src={identiconBlue as string} sx={{ width: '9.75px' }} />
          </Stack>
          <Grid
            alignContent='center' container item justifyContent='center' sx={{
              background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
              borderRadius: '1024px',
              fontFamily: 'Inter',
              fontSize: '12px',
              fontWeight: 700,
              height: '11px',
              lineHeight: '11px',
              m: '2px',
              width: '100%'
            }}
          >
            {accounts?.length ?? 0}
          </Grid>
        </Grid>
        <ScrollingTextBox
          text={selectedAccount?.name ?? ''}
          textStyle={{
            color: 'text.primary',
            ...theme.typography['B-2']
          }}
          width={65}
        />
        <ArrowDown2 color='#AA83DC' size='18' variant='Bold' />
      </Container>
      <SelectAccount
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />
    </>
  );
}

export default AccountSelection;
