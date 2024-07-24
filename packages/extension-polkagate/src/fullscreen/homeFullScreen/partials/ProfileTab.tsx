// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useProfileAccounts, useTranslation } from '../../../hooks';
import { getStorage, setStorage, watchStorage } from '../../../components/Loading';
import { VaadinIcon } from '../../../components/index';
import { showAccount } from '../../../messaging';
import { HIDDEN_PERCENT } from './ProfileTabs';
import type { AccountsOrder } from '@polkadot/extension-polkagate/src/util/types';
import { getProfileColor } from '@polkadot/extension-polkagate/src/util/utils';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined
  selectedProfile: string | undefined;
  setSelectedProfile: React.Dispatch<React.SetStateAction<string | undefined>>;
  isHovered: boolean | undefined;
  text: string;
  index: number;
}

export default function ProfileTab({ isHovered, text, selectedProfile, setSelectedProfile, orderedAccounts, index }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const profileAccounts = useProfileAccounts(orderedAccounts, text);

  /** set by user click on a profile tab */
  const [toHideAll, setToHideAll] = useState<boolean>();

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const shadow = useMemo(() => isDarkMode ? '0px 2px 5px 1px rgba(255, 255, 255, 0.10)' : '0px 2px 3px 1px rgba(000, 000, 000, 0.13)', [isDarkMode]);
  const shadowOnHover = useMemo(() => isDarkMode ? '0px 2px 5px 1px rgba(255, 255, 255, 0.20)' : '0px 2px 3px 1px rgba(000, 000, 000, 0.20)', [isDarkMode]);

  const isSelected = useMemo(() => selectedProfile === text, [selectedProfile, text]);
  const visibleContent = useMemo(() => isHovered || isSelected, [isHovered, isSelected]);

  /** Save the current selected tab in local storage on tab click */
  const onClick = useCallback(() => {
    setStorage('profile', text);
    isSelected && setToHideAll(!toHideAll);
  }, [selectedProfile, toHideAll, text, isSelected]);

  /** check to see if all accounts in a profile is hidden */
  const areAllProfileAccountsHidden = useMemo(() => {
    const isHidden = profileAccounts?.length
      ? profileAccounts.every(({ account }) => account.isHidden)
      : undefined;

    return isHidden;
  }, [profileAccounts]);

  const hideAccounts = useCallback((accounts: AccountsOrder[]) => {
    toHideAll !== undefined && accounts.forEach(({ account: { address } }) => {
      showAccount(address, !toHideAll).catch(console.error);
    })
  }, [toHideAll]);

  const areAllHidden = areAllProfileAccountsHidden !== undefined ? areAllProfileAccountsHidden : toHideAll;

  const hideCard = useMemo(() => !Boolean(isSelected || isHovered || visibleContent), [isSelected, isHovered, visibleContent]);

  useEffect(() => {
    if (profileAccounts && toHideAll !== undefined) {
      hideAccounts(profileAccounts);
    }
  }, [hideAccounts, profileAccounts?.length, toHideAll]);

  useEffect(() => {
    /** set profile text in local storage and watch its change to apply on the UI */
    getStorage('profile').then((res) => {
      setSelectedProfile(res as string || t('All'));
    }).catch(console.error);

    watchStorage('profile', setSelectedProfile).catch(console.error);
  }, [t]);

  return (
    <Grid item container onClick={onClick}
      justifyContent='center'
      alignItems='center'
      columnGap='5px'
      px='8px'
      sx={{
        cursor: 'pointer',
        flexShrink: 0,
        bgcolor: getProfileColor(index, theme) || 'background.paper',
        borderRadius: '0 0 12px 12px',
        minWidth: '100px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: shadow,
        '&:hover': {
          boxShadow: shadowOnHover,
        },
        position: 'relative',
        transformOrigin: 'top',
        transform: hideCard ? `translateY(-${HIDDEN_PERCENT})` : undefined,
        userSelect: 'none',
        width: 'fit-content'
      }}>
      <VaadinIcon icon={'vaadin:check'} style={{ height: '13px', visibility: isSelected ? 'visible' : 'hidden', width: '15px' }} />
      <Typography color={'text.primary'} display='block' fontSize='16px' fontWeight={isSelected ? 500 : 400} textAlign='center' sx={{ visibility: visibleContent ? 'visible' : 'hidden', transition: isSelected ? 'none' : 'visibility 0.1s ease-in-out', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {t(text)}
      </Typography>
      <VaadinIcon icon={areAllHidden ? 'vaadin:eye-slash' : ''}
        style={{
          height: '13px',
          visibility: visibleContent ? 'visible' : 'hidden',
          transition: isSelected ? 'none' : 'visibility 0.1s ease-in-out',
          width: '15px'
        }} />
    </Grid>
  );
}
