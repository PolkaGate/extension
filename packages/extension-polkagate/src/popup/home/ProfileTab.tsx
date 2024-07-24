// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountsOrder } from '@polkadot/extension-polkagate/src/util/types';

import { Collapse, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getProfileColor } from '@polkadot/extension-polkagate/src/util/utils';

import { VaadinIcon } from '../../components/index';
import { setStorage } from '../../components/Loading';
import { useProfileAccounts, useTranslation } from '../../hooks';
import { showAccount } from '../../messaging';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
  text: string;
  index: number;
  isSelected: boolean;
}

const COLLAPSED_SIZE = '20px';

export default function ProfileTab ({ index, isSelected, orderedAccounts, text }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const profileAccounts = useProfileAccounts(orderedAccounts, text);

  /** set by user click on a profile tab */
  const [toHideAll, setToHideAll] = useState<boolean>();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const shadow = useMemo(() => isDarkMode ? '0px 1px 2px 1px rgba(255, 255, 255, 0.10)' : '0px 1px 2px 1px rgba(000, 000, 000, 0.13)', [isDarkMode]);
  const shadowOnHover = useMemo(() => isDarkMode ? '0px 1px 2px 1px rgba(255, 255, 255, 0.20)' : '0px 1px 2px 1px rgba(000, 000, 000, 0.20)', [isDarkMode]);

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
  }, [toHideAll]);

  const areAllHidden = areAllProfileAccountsHidden !== undefined ? areAllProfileAccountsHidden : toHideAll;

  useEffect(() => {
    if (profileAccounts && toHideAll !== undefined) {
      hideAccounts(profileAccounts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideAccounts, profileAccounts?.length, toHideAll]);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <Collapse
      collapsedSize={COLLAPSED_SIZE}
      in={visibleContent}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      orientation='horizontal'
      sx={{
        '&:hover': { boxShadow: shadowOnHover },
        bgcolor: getProfileColor(index, theme) || 'background.paper',
        borderRadius: '10px',
        boxShadow: shadow,
        cursor: 'pointer',
        height: COLLAPSED_SIZE,
        mb: '5px',
        px: '8px'
      }}
    >
      <Grid alignItems='center' container item justifyContent='center' sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', minWidth: '40px', width: 'fit-content' }}>
        <Typography color='text.primary' fontSize='14px' fontWeight={isSelected ? 500 : 400} textAlign='center' sx={{ maxWidth: '100px', overflowX: 'hidden', textOverflow: 'ellipsis', transition: 'visibility 0.1s ease', visibility: visibleContent ? 'visible' : 'hidden', whiteSpace: 'nowrap', width: 'fit-content' }}>
          {t(text)}
        </Typography>
        {areAllHidden && isSelected &&
          <VaadinIcon icon='vaadin:eye-slash' style={{ display: 'block', height: '13px', marginLeft: '5px', width: '15px' }} />}
      </Grid>
    </Collapse>
  );
}