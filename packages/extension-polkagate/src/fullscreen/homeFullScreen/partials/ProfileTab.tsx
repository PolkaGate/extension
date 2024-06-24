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
import { keyframes } from '@emotion/react';
import { HIDDEN_PERCENT } from './ProfileTabs';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined
  selectedProfile: string | undefined;
  setSelectedProfile: React.Dispatch<React.SetStateAction<string | undefined>>;
  isHovered: boolean | undefined;
  text: string;
}

// Define keyframes for the swinging animation around the x-axis
const swingAnimation = keyframes`
  0% { transform: rotateX(0deg); }
  20% { transform: rotateX(30deg); }
  40% { transform: rotateX(-20deg); }
  60% { transform: rotateX(10deg); }
  80% { transform: rotateX(-10deg); }
  100% { transform: rotateX(0deg); }
`;

export default function ProfileTab({ isHovered, text, selectedProfile, setSelectedProfile, orderedAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const PREDEFINED_TAB_COLORS = useMemo(() => {
    return [
      { text: t('All'), colorLight: '#D1C4E9', colorDark: '#5E35B1' },
      { text: t('Local'), colorLight: '#C8E6C9', colorDark: '#388E3C' },
      { text: t('Ledger'), colorLight: '#FFCCBC', colorDark: '#D84315' },
      { text: t('Watch-only'), colorLight: '#B3E5FC', colorDark: '#0288D1' },
      { text: t('QR-attached'), colorLight: '#F8BBD0', colorDark: '#D81B60' },
    ]
  }, [t, theme]);

  const profileAccounts = useProfileAccounts(orderedAccounts, text);

  const [animate, setAnimate] = useState<boolean>(true);
  /** set by user click on a profile tab */
  const [toHiddenAll, setToHiddenAll] = useState<boolean>();

  const getColor = useCallback((_text: string) => {
    const selectedProfile = PREDEFINED_TAB_COLORS.find(({ text }) => text === _text);
    const color = theme.palette.mode === 'dark' ? selectedProfile?.colorDark : selectedProfile?.colorLight;

    return color;
  }, [PREDEFINED_TAB_COLORS]);

  const isSelected = useMemo(() => selectedProfile === text, [selectedProfile, text]);
  const visibleContent = useMemo(() => isHovered || isSelected, [isHovered, isSelected]);

  /** Save the current selected tab in local storage on tab click */
  const onClick = useCallback(() => {
    setStorage('profile', text);
    isSelected && setToHiddenAll(!toHiddenAll);
  }, [selectedProfile, toHiddenAll, text, isSelected]);

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
  }, [hideAccounts, profileAccounts?.length, toHiddenAll]);

  useEffect(() => {
    /** set profile text in local storage and watch its change to apply on the UI */
    getStorage('profile').then((res) => {
      setSelectedProfile(res as string || t('All'));
    }).catch(console.error);

    watchStorage('profile', setSelectedProfile).catch(console.error);

    // Disable animation after initial render
    const timer = setTimeout(() => {
      setAnimate(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [t]);

  return (
    <Grid item container onClick={onClick}
      justifyContent='center'
      alignItems='center'
      sx={{
        cursor: 'pointer',
        flexShrink: 0,
        mx: '1px',
        bgcolor: getColor(text) || 'background.paper',
        borderBottomLeftRadius: '12px',
        WebkitBorderBottomRightRadius: '12px',
        minWidth: '100px',
        borderBottom: isSelected
          ? `1.5px solid ${theme.palette.secondary.light}`
          : `1.5px solid ${theme.palette.divider}`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'perspective(1000px) translateZ(10px)',
          boxShadow: pgBoxShadow(theme),
        },
        animation: animate ? `${swingAnimation} 1s ease-in-out` : 'none',
        perspective: '1000px',
        width: 'fit-content',
        transformOrigin: 'top',
        position: 'relative',
        transform: isSelected && !isHovered ? `translateY(${HIDDEN_PERCENT})` : undefined
      }}>
      <VaadinIcon icon={'vaadin:check'} style={{ height: '13px', marginRight: '-20px', visibility: isSelected ? 'visible' : 'hidden' }} />
      <Typography color={'text.primary'} display='block' fontSize='15px' fontWeight={400} textAlign='center'
        sx={{
          userSelect: 'none',
          px: '20px',
          visibility: visibleContent ? 'visible' : 'hidden',
          transition: 'visibility 0.3s ease-in-out'
        }}>
        {text}
      </Typography>
      <VaadinIcon icon={isHiddenAll ? 'vaadin:eye-slash' : ''}
        style={{
          height: '13px',
          marginLeft: '-20px',
          visibility: visibleContent ? 'visible' : 'hidden',
          transition: 'visibility 0.3s ease-in-out'
        }} />
    </Grid>
  );
}
