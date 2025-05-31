// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { useSelectedAccount } from '@polkadot/extension-polkagate/src/hooks/index';
import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';

import { AccountContext, ChainLogo, ScrollingTextBox } from '../../components';
import useIsDark from '../../hooks/useIsDark';
import { identiconBlue, identiconPink } from '../../popup/home/svg';
import PolkaGateIdenticon from '../../style/PolkaGateIdenticon';
import AccountListModal from './AccountListModal';
import ChainListModal from './ChainListModal';

interface AccountsIconProps {
  noSelection: boolean;
  address: string | undefined;
  accountsLength: number | undefined;
}

const AccountsIcon = ({ accountsLength, address, noSelection }: AccountsIconProps) => {
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
                background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
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

enum MODAL_TO_OPEN {
  ACCOUNTS,
  CHAINS
}

function AccountChainSelect ({ noSelection = false }: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const { accounts } = useContext(AccountContext);
  const selectedAccount = useSelectedAccount();
  const genesisHash = useAccountSelectedChain(selectedAccount?.address);

  const [modalToOpen, setModalToOpen] = React.useState<MODAL_TO_OPEN>();

  const onClick = useCallback((toOpen: MODAL_TO_OPEN) => {
    setModalToOpen(toOpen);
  }, []);

  return (
    <>
      <Container
        disableGutters
        sx={{
          ':hover': noSelection ? {} : { background: '#674394' },
          alignItems: 'center',
          background: isDark
            ? '#2D1E4A80'
            : '#FFFFFF8C',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          p: '2px',
          pr: noSelection ? '8px' : '2px',
          transition: 'all 250ms ease-out',
          width: '145px'
        }}
      >
        <Grid container direction='row' item onClick={() => onClick(MODAL_TO_OPEN.ACCOUNTS)} sx={{
          alignItems: 'center',
          columnGap: '5px',
          cursor: noSelection ? 'default' : 'pointer',
          flexWrap: 'nowrap',
          height: '32px',
          justifyContent: 'space-between',
          transition: 'all 250ms ease-out',
          width: '110px'
        }}>
          <AccountsIcon
            accountsLength={accounts.length}
            address={selectedAccount?.address}
            noSelection={noSelection}
          />
          <ScrollingTextBox
            text={selectedAccount?.name ?? ''}
            textStyle={{
              color: 'text.primary',
              ...theme.typography['B-2']
            }}
            width={noSelection ? 120 : 65}
          />
          {!noSelection &&
            <ArrowDown2
              color={isDark ? '#AA83DC' : '#8F97B8'}
              size='18'
              style={{ transition: 'all 250ms ease-out ' }}
              variant='Bold'
            />}
        </Grid>
        <Box
          onClick={() => onClick(MODAL_TO_OPEN.CHAINS)}
          sx={{
            alignItems: 'center',
            bgcolor: isDark ? '#2D1E4A80' : '#CCD2EA',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            height: '28px',
            justifyContent: 'center',
            width: '28px'
          }}>
          <ChainLogo
            genesisHash={genesisHash}
            size={18}
          />
        </Box>
      </Container>
      <AccountListModal
        // eslint-disable-next-line react/jsx-no-bind
        handleClose={() => setModalToOpen(undefined)}
        open={modalToOpen === MODAL_TO_OPEN.ACCOUNTS}
      />
      <ChainListModal
        // eslint-disable-next-line react/jsx-no-bind
        handleClose={() => setModalToOpen(undefined)}
        open={modalToOpen === MODAL_TO_OPEN.CHAINS}
      />
    </>
  );
}

export default AccountChainSelect;
