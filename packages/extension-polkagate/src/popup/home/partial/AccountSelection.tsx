// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useSelectedAccount } from '@polkadot/extension-polkagate/src/hooks/index';

import { AccountContext, ScrollingTextBox } from '../../../components';
import useIsDark from '../../../hooks/useIsDark';
import { identiconBlue, identiconPink } from '../svg';

function AccountSelection (): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const { accounts } = useContext(AccountContext);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();

  const onClick = useCallback(() => {
    const from = location?.state?.from || '/';

    if (location.pathname === '/accounts') {
      navigate(from);
    } else {
      navigate('/accounts', { state: { from: location.pathname } });
    }
  }, [location, navigate]);

  const isInAccountLists = location?.pathname === '/accounts';

  return (
    <>
      <Container
        disableGutters
        onClick={onClick}
        sx={{
          ':hover': { background: '#674394' },
          alignItems: 'center',
          background: isDark
            ? isInAccountLists
              ? '#FF4FB9'
              : '#BFA1FF26'
            : '#FFFFFF8C',
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
        <Grid container item justifyContent='space-around' sx={{ background: isDark ? '#2D1E4A' : '#CCD2EA', borderRadius: '9px', height: '26px', width: '26px' }}>
          <Stack columnGap='2px' direction='row' sx={{ mt: '1px' }}>
            <Box component='img' src={identiconPink as string} sx={{ height: '9.75px', width: '9.75px' }} />
            <Box component='img' src={identiconBlue as string} sx={{ height: '9.75px', width: '9.75px' }} />
          </Stack>
          <Grid
            alignContent='center' container item justifyContent='center' sx={{
              background: isInAccountLists ? 'transparent' : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
              borderRadius: '1024px',
              color: isDark ? '#EAEBF1' : '#FFFFFF',
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
            color: isInAccountLists ? '#05091C' : 'text.primary',
            ...theme.typography['B-2']
          }}
          width={65}
        />
        <ArrowDown2 color={isDark ? isInAccountLists ? '#05091C' : '#AA83DC' : '#8F97B8'} size='18' variant='Bold' style={{ transform: isInAccountLists ? 'rotate(180deg)' : undefined, transition: 'all 250ms ease-out ' }} />
      </Container>
    </>
  );
}

export default AccountSelection;
