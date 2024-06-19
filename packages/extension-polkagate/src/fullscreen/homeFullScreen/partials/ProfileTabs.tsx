// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsOrder } from '..';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useProfileAccounts, useTranslation } from '../../../hooks';
import { getStorage, setStorage, watchStorage } from '../../../components/Loading';
import { pgBoxShadow } from '../../../util/utils';
import { VaadinIcon } from '../../../components/index';
import { showAccount } from '../../../messaging';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
}

interface TabProps {
  text: string;
  orderedAccounts: AccountsOrder[] | undefined
}

function Tab({ text, orderedAccounts }: TabProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const profileAccounts = useProfileAccounts(orderedAccounts, text);

  const [profile, setProfile] = useState<string>();
  /** set by user click on profile tab */
  const [toHiddenAll, setToHiddenAll] = useState<boolean>();

  /** Save the current selected tab in local storage on tab click */
  const onClick = useCallback(() => {
    setStorage('profile', text);
    profile === text && setToHiddenAll(!toHiddenAll);
  }, [profile, toHiddenAll]);

  /** check to see if all accounts in a profile is hidden */
  const isAllProfileAccountsHidden = useMemo(() => {
    const isHidden = profileAccounts?.length
      ? profileAccounts.every(({ account }) => account.isHidden)
      : undefined;

    return isHidden;
  }, [profileAccounts]);

  const hideAccounts = useCallback((accounts: AccountsOrder[]) => {
    toHiddenAll !== undefined && accounts.forEach(({ account: { address } }) => {
      showAccount(address, !toHiddenAll).catch(console.error);
    })
  }, [toHiddenAll]);

  const isHiddenAll = isAllProfileAccountsHidden !== undefined ? isAllProfileAccountsHidden : toHiddenAll;

  useEffect(() => {
    if (profileAccounts && toHiddenAll !== undefined) {
      hideAccounts(profileAccounts);
    }
  }, [toHiddenAll]);

  useEffect(() => {
    /** set profile text in local storage and watch its change to apply on the UI */
    getStorage('profile').then((res) => {
      setProfile(res as string || t('All'));
    }).catch(console.error);

    watchStorage('profile', setProfile).catch(console.error);
  }, []);

  return (
    <Grid item container onClick={onClick}
      justifyContent='space-between'
      alignItems='center'
      sx={{
        cursor: 'pointer',
        mx: '1px',
        pb: '2px',
        px: '20px',
        bgcolor: 'background.paper',
        borderBottomLeftRadius: '12px',
        WebkitBorderBottomRightRadius: '12px',
        minWidth: '100px',
        borderBottom: profile === text
          ? `1.5px solid ${theme.palette.secondary.light}`
          : `1.5px solid ${theme.palette.divider}`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'perspective(1000px) translateZ(10px)',
          boxShadow: pgBoxShadow(theme),
        },
        perspective: '1000px',
        // display: 'inline-block',
        width: 'fit-content'
      }}>
      <Grid item>
        <Typography color={'text.primary'} display='block' fontSize='14px' fontWeight={400} textAlign='center' sx={{ userSelect: 'none' }}>
          {text}
        </Typography>
      </Grid>
      <Grid item>
        <VaadinIcon icon={isHiddenAll ? 'vaadin:eye-slash' : ''} style={{ height: '13px' }} />
      </Grid>
    </Grid>
  );
}

export default function ProfileTabs({ orderedAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<string[]>([t('All')]);

  useEffect(() => {
    if(!orderedAccounts){
      return
    }

    const texts=[t('All')];
    const hasLocal = orderedAccounts.find(({ account }) => !account.isExternal)
    if (hasLocal) {
      texts.push(t('Local'))
    }

    const hasLedger = orderedAccounts.find(({ account }) => account.isHardware)
    if (hasLedger) {
      texts.push(t('Ledger'))
    }

    const hasWatchOnly = orderedAccounts.find(({ account }) => account.isExternal && !account.isQR && !account.isHardware);
    if (hasWatchOnly) {
      texts.push(t('Watch Only'))
    }

    const hasQrAttached = orderedAccounts.find(({ account: { isQR } }) => isQR);
    if (hasQrAttached) {
      texts.push(t('QR-attached'))
    }

    const userDefinedProfiles = orderedAccounts.map(({ account: { profile } }) => profile as string).filter((item) => !!item);
    const sortedUserDefinedProfiles = [...new Set(userDefinedProfiles)].sort();
    if (sortedUserDefinedProfiles) {
      texts.push(...sortedUserDefinedProfiles)
    }

    setProfiles(texts);
  }, [orderedAccounts]);

  return (
    <Grid container item justifyContent='left' sx={{ bgcolor: 'backgroundFL.secondary', maxWidth: '1282px', px: '20px' }}>
      {profiles?.map((profile) => (
        <Tab
          text={profile as string}
          orderedAccounts={orderedAccounts}
        />
      ))
      }
    </Grid>
  );
}

