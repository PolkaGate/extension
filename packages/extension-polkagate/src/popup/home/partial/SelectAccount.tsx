// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Container, Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { Hashtag } from 'iconsax-react';
import React, { memo, useCallback, useContext, useMemo, useState } from 'react';

import { AccountContext, ExtensionPopup, SearchField } from '../../../components';
import { useTranslation } from '../../../hooks';
import { updateMeta } from '../../../messaging';
import PolkaGateIdenticon from '../../../style/PolkaGateIdenticon';
import AccountActionButtons from './AccountActionButtons';
import AssetsGroup from './AssetsGroup';

interface Props {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AccountsOptionProps {
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AccountItemProps {
  address: string;
  name: string | undefined;
  selected?: boolean;
  index: number;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

function AccountItem ({ address, index, name, selected, setOpenMenu }: AccountItemProps) {
  const gradientBackgroundStyle: React.CSSProperties = {
    background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
    borderRadius: '18px',
    cursor: selected ? 'default' : 'pointer',
    inset: '-4px',
    opacity: selected ? 1 : 0,
    position: 'absolute',
    transition: 'all 250ms ease-out',
    zIndex: -1
  };

  const backgroundStyle: React.CSSProperties = {
    background: '#2D1E4A',
    borderRadius: '18px',
    cursor: selected ? 'default' : 'pointer',
    inset: '-4px',
    opacity: selected ? 0 : 1,
    position: 'absolute',
    transition: 'all 250ms ease-out',
    zIndex: -1
  };

  const AccountItemStyle: SxProps<Theme> = {
    '&:hover': {
      background: '#322256',
      transition: 'all 250ms ease-out'
    },
    alignItems: 'center',
    background: '#05091C',
    borderRadius: '14px',
    boxSizing: 'border-box',
    columnGap: '8px',
    cursor: selected ? 'default' : 'pointer',
    display: 'flex',
    height: '64px',
    m: '4px',
    p: '12px',
    position: 'relative',
    transition: 'all 250ms ease-out',
    width: 'calc(100% - 8px)'
  };

  const { accounts } = useContext(AccountContext);

  const onSelectAccount = useCallback(() => {
    if (selected) {
      return;
    }

    const accountToUnselect = accounts.find(({ selected }) => selected);

    if (!accountToUnselect) {
      updateMeta(address, JSON.stringify({ selected: true })).catch(console.error);
      setOpenMenu(false);

      return;
    }

    Promise
      .all([updateMeta(address, JSON.stringify({ selected: true })), updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))])
      .catch(console.error);

    setOpenMenu(false);
  }, [accounts, address, selected, setOpenMenu]);

  return (
    <Container
      disableGutters
      onClick={onSelectAccount}
      sx={AccountItemStyle}
    >
      <PolkaGateIdenticon
        address={address}
      />
      <Grid container item justifyContent='flex-start' sx={{ maxWidth: '150px', overflowX: 'hidden', width: '100%' }}>
        <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
          {name}
        </Typography>
        <AssetsGroup address={address} />
      </Grid>
      <AccountActionButtons address={address} index={index} />
      {/* styles */}
      <div style={backgroundStyle} />
      <div style={gradientBackgroundStyle} />
    </Container>
  );
}

function AccountsOptions ({ setOpenMenu }: AccountsOptionProps): React.ReactElement {
  const { accounts } = useContext(AccountContext);

  const [searchedAccounts, setSearchedAccounts] = useState<AccountJson[]>();

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setSearchedAccounts(undefined);
    }

    keyword = keyword.trim().toLowerCase();

    const filtered = accounts.filter(({ address, name }) =>
      address.toLowerCase().includes(keyword) ||
      name?.toLowerCase().includes(keyword)
    );

    setSearchedAccounts([...filtered]);
  }, [accounts]);

  const accountsToShow = useMemo(() => {
    if (searchedAccounts) {
      return searchedAccounts;
    }

    return accounts;
  }, [accounts, searchedAccounts]);

  return (
    <Grid container item justifyContent='center'>
      <Grid container item>
        <SearchField
          onInputChange={onSearch}
          placeholder='🔍 Search Accounts'
        />
      </Grid>
      <Grid container item justifyContent='center' sx={{ alignContent: 'flex-start', display: 'flex', height: '320px', maxHeight: '320px', overflow: 'scroll', pt: '8px', rowGap: '8px' }}>
        {accountsToShow.map(({ address, name, selected }, index) => (
          <AccountItem
            address={address}
            index={index}
            key={address}
            name={name}
            selected={selected}
            setOpenMenu={setOpenMenu}
          />
        ))}
      </Grid>
    </Grid>
  );
}

function SelectAccount ({ openMenu, setOpenMenu }: Props): React.ReactElement {
  const { t } = useTranslation();

  const handleClose = useCallback(() => setOpenMenu(false), [setOpenMenu]);

  return (
    <ExtensionPopup
      TitleIcon={Hashtag}
      handleClose={handleClose}
      openMenu={openMenu}
      title={t('Select address')}
      withoutBackground
      withoutTopBorder
    >
      <Grid container item justifyContent='center' sx={{ position: 'relative', py: '5px', zIndex: 1 }}>
        <AccountsOptions
          setOpenMenu={setOpenMenu}
        />
      </Grid>
    </ExtensionPopup>
  );
}

export default memo(SelectAccount);
