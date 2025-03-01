// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountsOrder } from '@polkadot/extension-polkagate/src/util/types';

import { Collapse, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { VaadinIcon } from '../../components/index';
import { setStorage } from '../../components/Loading';
import { useProfileAccounts, useTranslation } from '../../hooks';
import { showAccount } from '../../messaging';
import { getProfileColor } from '../../util/utils';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
  text: string;
  index: number;
  isSelected: boolean;
  isContainerHovered: boolean;
}

const COLLAPSED_SIZE = '20px';
const HIDDEN_PERCENT = '50%';

function ProfileTab({ index, isContainerHovered, isSelected, orderedAccounts, text }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const profileAccounts = useProfileAccounts(orderedAccounts, text);

  /** set by user click on a profile tab */
  const [toHideAll, setToHideAll] = useState<boolean>();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const shadow = useMemo(() => isDarkMode ? '0px 0px 2px 1px rgba(255, 255, 255, 0.10)' : '0px 0px 2px 1px rgba(000, 000, 000, 0.13)', [isDarkMode]);
  const shadowOnHover = useMemo(() => isDarkMode ? '0px 0px 3px 1px rgba(255, 255, 255, 0.20)' : '0px 0px 3px 1px rgba(000, 000, 000, 0.20)', [isDarkMode]);

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
    <Grid container item sx={{ transform: !isContainerHovered && !isSelected ? `translateY(${HIDDEN_PERCENT})` : undefined, transition: 'transform 0.75s', width: 'fit-content' }}>
      <Collapse
        collapsedSize={COLLAPSED_SIZE}
        in={visibleContent}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        orientation='horizontal'
        sx={{
          '&:hover': { boxShadow: shadowOnHover },
          border: 2,
          borderColor: getProfileColor(index, theme) || 'background.paper',
          borderRadius: '10px',
          boxShadow: shadow,
          cursor: 'pointer',
          height: COLLAPSED_SIZE,
          my: '2px',
          opacity: isDarkMode ? (isContainerHovered || isSelected ? 1 : 0.3) : undefined,
          transition: visibleContent ? 'width 0.3s, box-shadow 1s, opacity 1s' : 'width 0.3s, box-shadow 0.2s, opacity 1s'
        }}
      >
        <Grid alignItems='center' container item justifyContent='center' sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', minWidth: '40px', px: '8px', width: 'fit-content' }}>
          <Typography color='text.primary' fontSize='14px' sx={{ lineHeight: 'normal', maxWidth: '100px', overflowX: 'hidden', textOverflow: 'ellipsis', transition: 'visibility 0.1s ease', userSelect: 'none', visibility: visibleContent ? 'visible' : 'hidden', whiteSpace: 'nowrap', width: 'fit-content' }} textAlign='center'>
            {t(text)}
          </Typography>
          {areAllHidden && isSelected &&
            <VaadinIcon icon='vaadin:eye-slash' style={{ display: 'block', height: '13px', marginLeft: '5px', width: '15px' }} />
          }
        </Grid>
      </Collapse>
    </Grid>
  );
}

export default React.memo(ProfileTab);
