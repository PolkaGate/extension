// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIsBlueish, useSelectedAccount } from '@polkadot/extension-polkagate/src/hooks/index';

import { AccountContext, ScrollingTextBox } from '../../../components';
import useIsDark from '../../../hooks/useIsDark';
import PolkaGateIdenticon from '../../../style/PolkaGateIdenticon';
import { identiconBlue, identiconPink } from '../svg';

interface AccountsIconProps {
  noSelection: boolean;
  address: string | undefined;
  accountsLength: number | undefined;
  isInAccountLists: boolean;
}

const AccountsIcon = ({ accountsLength, address, isInAccountLists, noSelection }: AccountsIconProps) => {
  const isDark = useIsDark();

  return (
    <>
      {noSelection
        ? (
          <PolkaGateIdenticon
            address={address ?? ''}
            size={20}
            style={{ marginLeft: '4px' }}
          />)
        : (
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
              {accountsLength ?? 0}
            </Grid>
          </Grid>)}
    </>
  );
};

interface Props {
  noSelection?: boolean;
}

function AccountSelection ({ noSelection = false }: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const isBlueish = useIsBlueish();
  const { accounts } = useContext(AccountContext);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();

  const onClick = useCallback(() => {
    if (noSelection) {
      return;
    }

    const from = location?.state?.from as string || '/';

    if (location.pathname === '/accounts') {
      navigate(from) as void;
    } else {
      navigate('/accounts', { state: { from: location.pathname } }) as void;
    }
  }, [location.pathname, location?.state?.from, navigate, noSelection]);

  const isInAccountLists = location?.pathname === '/accounts';

  return (
    <Container
      disableGutters
      onClick={onClick}
      sx={{
        ':hover': noSelection ? {} : { background: '#674394' },
        alignItems: 'center',
        background: isDark
          ? isInAccountLists
            ? '#FF4FB9'
            : '#BFA1FF26'
          : '#FFFFFF8C',
        borderRadius: '10px',
        columnGap: '5px',
        cursor: noSelection ? 'default' : 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        p: '2px',
        pr: noSelection ? '8px' : '2px',
        transition: 'all 250ms ease-out',
        width: 'fit-content'
      }}
    >
      <AccountsIcon
        accountsLength={accounts.length}
        address={selectedAccount?.address}
        isInAccountLists={isInAccountLists}
        noSelection={noSelection}
      />
      <ScrollingTextBox
        text={selectedAccount?.name ?? ''}
        textStyle={{
          color: isInAccountLists ? '#05091C' : 'text.primary',
          ...theme.typography['B-2']
        }}
        width={noSelection ? 120 : 65}
      />
      {!noSelection &&
          <ArrowDown2
            color={isDark
              ? isInAccountLists
                ? '#05091C'
                : isBlueish ? '#596AFF' : '#AA83DC'
              : '#8F97B8'
            }
            size='18'
            style={{ transform: isInAccountLists ? 'rotate(180deg)' : undefined, transition: 'all 250ms ease-out ' }}
            variant='Bold'
          />}
    </Container>
  );
}

export default React.memo(AccountSelection);
