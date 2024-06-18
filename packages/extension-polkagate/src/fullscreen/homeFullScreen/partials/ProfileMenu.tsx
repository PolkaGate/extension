// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Popover, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState, useMemo } from 'react';

import { AccountContext, ActionContext, MenuItem, VaadinIcon } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { PROXY_CHAINS } from '../../../util/constants';
import { POPUPS_NUMBER } from './AccountInformationForHome';
import { updateMeta } from '../../../messaging';

interface Props {
  address: string | undefined;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

function ProfileMenu({ address, setDisplayPopup }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const { chain } = useInfo(address);

  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | HTMLDivElement | null>();

  const userDefinedProfiles = useMemo(() => {
    const profiles = accounts?.map(({ profile }) => profile)?.filter((item) => !!item);
    return [...new Set(profiles)];
  }, [accounts]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const onClick = useCallback((event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const onManageProfiles = useCallback(() => {
    setDisplayPopup(POPUPS_NUMBER.MANAGE_PROFILE);
  }, [address, chain, onAction]);

  const addToNewProfile = useCallback((profile: string) => {
    const metaData = JSON.stringify({ profile: profile });

    updateMeta(String(address), metaData)
      .then(() => {
        handleClose();
      }).catch(console.error);
  }, [address]);

  const isDisable = useCallback((supportedChains: string[]) => {
    if (!chain) {
      return true;
    } else {
      return !supportedChains.includes(chain.genesisHash ?? '');
    }
  }, [chain]);

  const Menus = () => (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '10px' }}>
      <MenuItem
        iconComponent={
          <VaadinIcon icon='vaadin:plus' style={{ height: '20px', color: `${isDisable(PROXY_CHAINS) ? theme.palette.text.disabled : theme.palette.text.primary}` }} />
        }
        onClick={onManageProfiles}
        text={t('New profile')}
        withHoverEffect
      />
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      {userDefinedProfiles?.length
        ? userDefinedProfiles?.map((profile) => (
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:minus' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={() => addToNewProfile(profile as string)}
            text={profile as string}
            withHoverEffect
          />
        ))
        : <MenuItem
          disabled
          iconComponent={
            <VaadinIcon icon='vaadin:minus' style={{ height: '20px', color: `${theme.palette.text.disabled}` }} />
          }
          text={t('No user profile')}
          withHoverEffect
        />
      }
    </Grid>
  );

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Grid aria-describedby={id} component='button' container item onClick={onClick} sx={{ bgcolor: 'transparent', border: 'none', height: 'fit-content', p: 0, width: 'inherit' }}>
        <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:archives' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
          }
          text={t('Add to profile')}
          withHoverEffect
        />
      </Grid>
      <Popover
        PaperProps={{
          sx: {
            backgroundImage: 'none',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'transparent',
            borderRadius: '7px',
            boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)'
          }
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        id={id}
        onClose={handleClose}
        open={open}
        sx={{ mt: '5px' }}
        transformOrigin={{
          horizontal: -15,
          vertical: 45
        }}
      >
        <Menus />
      </Popover>
    </>
  );
}

export default React.memo(ProfileMenu);
