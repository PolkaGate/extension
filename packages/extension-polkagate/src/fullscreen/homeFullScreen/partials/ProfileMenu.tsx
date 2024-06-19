// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Popover, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState, useMemo } from 'react';

import { AccountContext, ActionContext, InputWithLabel, MenuItem, VaadinIcon } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { PROXY_CHAINS } from '../../../util/constants';
import { updateMeta } from '../../../messaging';

interface Props {
  address: string | undefined;
  setUpperAnchorEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>
}

function ProfileMenu({ address, setUpperAnchorEl }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const { account, chain } = useInfo(address);

  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | HTMLDivElement | null>();
  const [showName, setShowName] = useState<boolean>();
  const [newName, setNewName] = useState<string | undefined>();

  const editName = useCallback((newName: string | null) => {
    setNewName(newName ?? '');
  }, []);

  const profileName = account?.profile;

  const userDefinedProfiles = useMemo(() => {
    const profiles = accounts?.map(({ profile }) => profile)?.filter((item) => !!item);
    return [...new Set(profiles)].sort();
  }, [accounts]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setShowName(false);
    setUpperAnchorEl(null);
  }, []);

  const onAddClick = useCallback((event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const onNewProfile = useCallback(() => {
    setShowName(true);
  }, [address, chain, onAction]);

  const addToNewProfile = useCallback((profile?: string) => {
    if (!profile) {
      return;
    }

    const metaData = JSON.stringify({ profile: profile });

    updateMeta(String(address), metaData)
      .then(() => {
        handleClose();
      }).catch(console.error);
  }, [address]);

  const onRemoveClick = useCallback(() => {
    if (!account) {
      return;
    }

    const metaData = JSON.stringify({ profile: null });

    updateMeta(String(address), metaData)
      .then(() => {
        handleClose();
      }).catch(console.error);
  }, [address, account]);

  const isDisable = useCallback((supportedChains: string[]) => {
    if (!chain) {
      return true;
    } else {
      return !supportedChains.includes(chain.genesisHash ?? '');
    }
  }, [chain]);

  const Menus = () => (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '10px' }}>
      {showName
        ? <InputWithLabel
          isFocused
          fontSize={16}
          fontWeight={400}
          height={35}
          label={t('Choose a name for the profile')}
          labelFontSize='14px'
          onChange={editName}
          onEnter={() => addToNewProfile(newName as string)}
          placeholder={t('Profile Name')}
          value={newName}
        />
        : <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:plus' style={{ height: '20px', color: `${isDisable(PROXY_CHAINS) ? theme.palette.text.disabled : theme.palette.text.primary}` }} />
          }
          onClick={onNewProfile}
          text={t('New profile')}
          withHoverEffect
        />
      }
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      {userDefinedProfiles?.length
        ? userDefinedProfiles?.map((profile) => (
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:folder-open-o' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
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
  const id = open ? 'simple-popover 2' : undefined;

  return (
    <>
      <Grid aria-describedby={id} component='button' container item onClick={onAddClick} sx={{ bgcolor: 'transparent', border: 'none', height: 'fit-content', p: 0, width: 'inherit' }}>
        <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:folder-add' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
          }
          text={t('Add to profile')}
          withHoverEffect
        />
      </Grid>
      {!!profileName &&
        <>
          <Grid component='button' container item onClick={onRemoveClick} sx={{ bgcolor: 'transparent', border: 'none', height: 'fit-content', p: 0, width: 'inherit' }}>
            <MenuItem
              iconComponent={
                <VaadinIcon icon='vaadin:folder-remove' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
              }
              text={t('Remove from {{profileName}} profile', { replace: { profileName } })}
              withHoverEffect
            />
          </Grid>
          <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px', width: '100%' }} />
        </>
      }
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
