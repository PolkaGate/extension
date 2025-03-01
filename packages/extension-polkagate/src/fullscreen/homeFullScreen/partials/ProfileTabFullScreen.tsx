// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountsOrder } from '@polkadot/extension-polkagate/src/util/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getProfileColor } from '@polkadot/extension-polkagate/src/util/utils';

import { Infotip2, VaadinIcon } from '../../../components/index';
import { getStorage, setStorage, watchStorage } from '../../../components/Loading';
import { useAlerts, useProfileAccounts, useTranslation } from '../../../hooks';
import { showAccount } from '../../../messaging';
import { HIDDEN_PERCENT } from './ProfileTabsFullScreen';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined
  selectedProfile: string | undefined;
  setSelectedProfile: React.Dispatch<React.SetStateAction<string | undefined>>;
  isHovered: boolean | undefined;
  text: string;
  index: number;
}

function ProfileTabFullScreen({ index, isHovered, orderedAccounts, selectedProfile, setSelectedProfile, text }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { alerts, notify } = useAlerts();
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
    setStorage('profile', text).catch(console.error);
    isSelected && setToHideAll(!toHideAll);
  }, [toHideAll, text, isSelected]);

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
    });
    notify(t('Accounts in the {{profileName}} profile are now {{visibility}} websites.', { replace: { profileName: text, visibility: toHideAll ? 'hidden from' : 'visible to' } }), 'info');
  }, [notify, t, text, toHideAll]);

  const areAllHidden = areAllProfileAccountsHidden !== undefined ? areAllProfileAccountsHidden : toHideAll;

  const hideCard = useMemo(() => !(isSelected || isHovered || visibleContent), [isSelected, isHovered, visibleContent]);

  useEffect(() => {
    if (profileAccounts && toHideAll !== undefined) {
      hideAccounts(profileAccounts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideAccounts, profileAccounts?.length, toHideAll]);

  useEffect(() => {
    /** set profile text in local storage and watch its change to apply on the UI */
    getStorage('profile').then((res) => {
      setSelectedProfile(res as string || t('All'));
    }).catch(console.error);

    const unsubscribe = watchStorage('profile', setSelectedProfile);

    return () => {
      unsubscribe();
    };
  }, [setSelectedProfile, t]);

  return (
    <Infotip2
      text={
        !alerts?.length && isSelected && !areAllHidden
          ? t('Click to hide all the profile accounts from websites!')
          : undefined
      }
    >
      <Grid
        alignItems='center'
        columnGap='5px'
        container
        item
        justifyContent='center'
        onClick={onClick}
        px='8px'
        sx={{
          '&:hover': {
            boxShadow: shadowOnHover
          },
          border: 2,
          borderColor: getProfileColor(index, theme) || 'background.paper',
          borderRadius: '15px',
          boxShadow: shadow,
          cursor: 'pointer',
          flexShrink: 0,
          minWidth: '100px',
          mr: '5px',
          mt: '2px',
          opacity: isDarkMode ? (visibleContent ? 1 : 0.3) : undefined,
          position: 'relative',
          transform: hideCard ? `translateY(-${HIDDEN_PERCENT})` : undefined,
          transformOrigin: 'top',
          transition: hideCard ? 'transform 1s, box-shadow 1s, opacity 1s' : 'transform 0.2s, box-shadow 0.2s',
          userSelect: 'none',
          width: 'fit-content'
        }}
      >
        <VaadinIcon icon={'vaadin:check'} style={{ height: '12px', visibility: isSelected ? 'visible' : 'hidden', width: '15px' }} />
        <Typography
          color={'text.primary'} display='block' fontSize='16px' fontWeight={400}
          sx={{
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: isSelected ? 'none' : 'visibility 0.1s ease-in-out',
            visibility: visibleContent ? 'visible' : 'hidden',
            whiteSpace: 'nowrap'
          }} textAlign='center'
        >
          {t(text)}
        </Typography>
        <VaadinIcon
          icon={areAllHidden ? 'vaadin:eye-slash' : ''}
          style={{
            height: '13px',
            transition: isSelected ? 'none' : 'visibility 0.1s ease-in-out',
            visibility: visibleContent ? 'visible' : 'hidden',
            width: '15px'
          }}
        />
      </Grid>
    </Infotip2>
  );
}

export default React.memo(ProfileTabFullScreen);
