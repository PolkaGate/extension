// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import { Box, Container, Grid, Stack, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { useSelectedAccount, useUpdateSelectedAccount } from '@polkadot/extension-polkagate/src/hooks/index';
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
          <Grid container item justifyContent='space-around' sx={{ background: isDark ? '#2D1E4A' : '#CCD2EA', borderRadius: '9px', display: 'grid', gap: '2px', height: 'fit-content', p: '2px', width: 'fit-content' }}>
            <Stack columnGap='2px' direction='row'>
              <Box component='img' src={identiconPink as string} sx={{ height: '9px', width: '9px' }} />
              <Box component='img' src={identiconBlue as string} sx={{ height: '9px', width: '9px' }} />
            </Stack>
            <Grid
              alignContent='center' container item justifyContent='center'
              sx={{
                background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
                borderRadius: '999px',
                color: isDark ? '#EAEBF1' : '#FFFFFF',
                fontFamily: 'Inter',
                fontSize: '12px',
                fontWeight: 700,
                height: '11px',
                lineHeight: '11px',
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
  CHAINS,
  NONE
}

function ChainSwitcher({ onClick }: { onClick: (toOpen: MODAL_TO_OPEN) => () => void }): React.ReactElement {
  const isDark = useIsDark();
  const selectedAccount = useSelectedAccount();
  const { genesisHash: maybeGenesisFromPath } = useParams<{ genesisHash: string }>();
  const savedGenesis = useAccountSelectedChain(selectedAccount?.address);
  const genesisHash = maybeGenesisFromPath ?? savedGenesis;

  return (
    <Box onClick={onClick(MODAL_TO_OPEN.CHAINS)}
      sx={{
        alignItems: 'center',
        bgcolor: isDark ? '#2D1E4A80' : '#CCD2EA',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        height: '28px',
        justifyContent: 'center',
        width: '28px'
      }}
    >
      <ChainLogo
        genesisHash={genesisHash ?? POLKADOT_GENESIS}
        size={20}
      />
    </Box>
  );
}

function AccountSelect({ modalToOpen, noSelection = false, onClick }: { modalToOpen: MODAL_TO_OPEN, noSelection: boolean, onClick: (toOpen: MODAL_TO_OPEN) => () => void }): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const { accounts } = useContext(AccountContext);
  const selectedAccount = useSelectedAccount();
  const { address } = useParams<{ address: string; genesisHash: string }>();

  // Update the URL if it contains an address, the address has changed, and the account modal is open
  const changeUrl = Boolean(address && address !== selectedAccount?.address && modalToOpen === MODAL_TO_OPEN.ACCOUNTS);

  useUpdateSelectedAccount(selectedAccount?.address, changeUrl);

  return (
    <Grid container direction='row' item onClick={onClick(MODAL_TO_OPEN.ACCOUNTS)}
      sx={{
        alignItems: 'center',
        columnGap: '5px',
        cursor: noSelection ? 'default' : 'pointer',
        flexWrap: 'nowrap',
        height: 'fit-content',
        justifyContent: 'space-between',
        p: '3px 4px',
        pr: 0,
        transition: 'all 250ms ease-out',
        width: '110px'
      }}
    >
      <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start' sx={{ width: '79%' }}>
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
      </Stack>
      {
        !noSelection &&
        <ArrowDown2
          color={isDark ? '#AA83DC' : '#8F97B8'}
          size='18'
          style={{ transition: 'all 250ms ease-out ' }}
          variant='Bold'
        />
      }
    </Grid>
  );
}

export default function AccountChainSelect({ noSelection = false }: Props): React.ReactElement {
  const isDark = useIsDark();

  const [modalToOpen, setModalToOpen] = React.useState<MODAL_TO_OPEN>(MODAL_TO_OPEN.NONE);

  const onClick = useCallback((toOpen: MODAL_TO_OPEN) => () => {
    setModalToOpen(toOpen);
  }, []);

  return (
    <>
      <Container disableGutters
        sx={{
          ':hover': noSelection ? {} : { background: '#674394' },
          alignItems: 'center',
          background: isDark
            ? '#2D1E4A80'
            : '#FFFFFF8C',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          pr: noSelection ? '8px' : '2px',
          transition: 'all 250ms ease-out',
          width: '145px'
        }}
      >
        <AccountSelect
          modalToOpen={modalToOpen}
          noSelection={noSelection}
          onClick={onClick}
        />
        <ChainSwitcher onClick={onClick} />
      </Container>
      <AccountListModal
        handleClose={onClick(MODAL_TO_OPEN.NONE)}
        open={modalToOpen === MODAL_TO_OPEN.ACCOUNTS}
      />
      <ChainListModal
        handleClose={onClick(MODAL_TO_OPEN.NONE)}
        open={modalToOpen === MODAL_TO_OPEN.CHAINS}
      />
    </>
  );
}
