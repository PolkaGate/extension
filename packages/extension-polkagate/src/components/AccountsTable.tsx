// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useRef } from 'react';

import { openOrFocusTab } from '../fullscreen/accountDetails/components/CommonTasks';
import { useTranslation } from '../hooks';
import { showAccount } from '../messaging';
import Label from './Label';
import { AccountContext, Identity, PButton, Switch } from '.';

type AccountTypeFilterType = ['Watch-Only' | 'Hardware' | 'QR'];

interface Props {
  areAllCheck?: boolean;
  label?: string;
  style?: SxProps<Theme>;
  maxHeight?: string | number;
  accountTypeFilter?: AccountTypeFilterType;
  selectedAccounts: string[];
  setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>;
  manageConnectedAccounts?: boolean;
}

const sortAccounts = (accountA: AccountJson, accountB: AccountJson, selectedList: string[]): number => {
  const isASelected = selectedList.includes(accountA.address);
  const isBSelected = selectedList.includes(accountB.address);

  if (!isASelected && isBSelected) {
    return -1;
  } else if (isASelected && !isBSelected) {
    return 1;
  }

  return 0;
};

function AccountsTable({ accountTypeFilter, areAllCheck, label, manageConnectedAccounts, maxHeight = '112px', selectedAccounts, setSelectedAccounts, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);

  // Sort only on the first render, store result in a ref
  const sortedAccountsRef = useRef<AccountJson[] | null>(null);

  const accountsToShow = useMemo(() => {
    const filtered = [...accounts].filter(({ isExternal, isHardware, isHidden, isQR }) =>
      (accountTypeFilter?.includes('Watch-Only') && !isExternal) ||
      (accountTypeFilter?.includes('Hardware') && !isHardware) ||
      (accountTypeFilter?.includes('QR') && !isQR) ||
      !isHidden
    );

    // Only sort accounts when:
    // 1. We're in manage authorized accounts mode (manageConnectedAccounts is true)
    // 2. The accounts haven't been sorted yet (sortedAccountsRef.current is null)
    // 3. There are some selected accounts (selectedAccounts.length !== 0)
    if (manageConnectedAccounts && !sortedAccountsRef.current && selectedAccounts.length !== 0) {
      sortedAccountsRef.current = [...filtered].sort((a, b) => sortAccounts(a, b, selectedAccounts));
    }

    return filtered; // .sort((a, b) => sortAccounts(a, b, selectedAccounts))
  }, [accountTypeFilter, accounts, manageConnectedAccounts, selectedAccounts]);

  const onCheck = useCallback((address: string) => {
    const isAlreadySelected = selectedAccounts.includes(address);

    const updatedSelectedAccountsInfo = isAlreadySelected
      ? selectedAccounts.filter((account) => account !== address) // remove an item on deselect
      : [...selectedAccounts, address]; // add an item on select

    setSelectedAccounts(updatedSelectedAccountsInfo);
  }, [selectedAccounts, setSelectedAccounts]);

  const isChecked = useCallback((address: string): boolean => selectedAccounts.includes(address), [selectedAccounts]);

  const toggleSelectAll = useCallback(() => {
    areAllCheck
      ? setSelectedAccounts([]) // deselect
      : setSelectedAccounts(accounts.map(({ address }) => address)); // select all
  }, [accounts, areAllCheck, setSelectedAccounts]);

  const createOrImport = useCallback(() => {
    openOrFocusTab('/onboarding');
  }, []);

  const makeAccountsVisible = useCallback(() => {
    accounts.forEach(({ address }) => {
      showAccount(address, true).catch(console.error);
    });
  }, [accounts]);

  return (
    <Grid container item sx={{ position: 'relative', ...style }}>
      <Label label={label ?? t('Accounts')} style={{ fontWeight: 300, position: 'relative', width: '100%' }}>
        <Grid container direction='column' sx={{ '> div:not(:last-child:not(:only-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', display: 'block', maxHeight, minHeight: '68px', overflowY: 'scroll', textAlign: 'center' }}>
          <Grid container item sx={{ '> div:not(:last-child)': { borderRight: '1px solid', borderRightColor: 'secondary.light' }, textAlign: 'center' }} xs={12}>
            <Grid item xs={8}>
              <Typography fontSize='14px' fontWeight={400} lineHeight='25px'>
                {t('Account')}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography fontSize='14px' fontWeight={400} lineHeight='25px'>
                {t('Connected')}
              </Typography>
            </Grid>
          </Grid>
          {accounts.length === 0 &&
            <Grid container item justifyContent='center' py='20px' xs={12}>
              {t('There is no account to display!')}
              <PButton
                _ml={0}
                _mt='5px'
                _onClick={createOrImport}
                text={t('Create or Import account(s)')}
              />
            </Grid>
          }
          {accounts.length > 0 && accountsToShow.length === 0 &&
            <Grid container item justifyContent='center' py='20px' xs={12}>
              {t('Your accounts are hidden (invisible) to websites!')}
              <PButton
                _ml={0}
                _mt='5px'
                _onClick={makeAccountsVisible}
                text={t('Make accounts visible')}
              />
            </Grid>
          }
          {(sortedAccountsRef.current ?? accountsToShow).map(({ address }, index) => (
            <Grid container item key={index} sx={{ '> div:not(:last-child)': { borderRight: '1px solid', borderRightColor: 'secondary.light' }, height: '37px', textAlign: 'center' }} xs={12}>
              <Grid alignItems='center' container item justifyContent='left' pl='15px' xs={8}>
                <Identity address={address} identiconSize={25} showShortAddress showSocial={false} style={{ fontSize: '14px' }} subIdOnly />
              </Grid>
              <Grid alignItems='center' container height='100%' item justifyContent='center' xs={4}>
                <Switch
                  isChecked={isChecked(address)}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={() => onCheck(address)}
                  theme={theme}
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Label>
      {areAllCheck !== undefined && accountsToShow.length > 0 &&
        <Grid container item justifyContent='flex-end' onClick={toggleSelectAll} sx={{ color: 'secondary.light', cursor: 'pointer', fontSize: '14px', pr: '15px', textDecoration: 'underline' }}>
          {areAllCheck ? t('Disconnect all') : t('Connect all')}
        </Grid>}
    </Grid>
  );
}

export default React.memo(AccountsTable);
