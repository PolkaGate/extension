// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Container, Grid, Typography } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext } from '../../../components';
import SelectAccount from './SelectAccount';

function AccountSelection (): React.ReactElement {
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
        <Grid container item sx={{ background: '#2D1E4A', borderRadius: '9px', height: '26px', width: '26px' }}>

        </Grid>
        <Typography
          fontFamily='Inter'
          fontSize='14px'
          fontWeight={600}
          sx={{
            maxWidth: '65px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: 'fit-content'
          }}
        >
          {selectedAccount?.name}
        </Typography>
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
