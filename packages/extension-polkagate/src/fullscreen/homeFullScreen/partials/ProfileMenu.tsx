// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import DoneIcon from '@mui/icons-material/Done';
import { Divider, Grid, IconButton, Popover, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { InputWithLabel, MenuItem, VaadinIcon } from '../../../components';
import { getStorage, setStorage } from '../../../components/Loading';
import { useAccountsOrder, useInfo, useIsExtensionPopup, useProfiles, useTranslation } from '../../../hooks';
import { PROFILE_TAGS } from '../../../hooks/useProfileAccounts';
import { updateMeta } from '../../../messaging';

interface Props {
  address: string | undefined;
  closeParentMenu: () => void;
}

interface InputBoxProps {
  editName: (newName: string | null) => void;
  newName: string | undefined;
  addToNewProfile: (profile?: string) => void;
}

const InputBox = ({ addToNewProfile, editName, newName }: InputBoxProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid alignItems='flex-end' container item justifyContent='space-evenly'>
      <Grid container item xs>
        <InputWithLabel
          fontSize={16}
          fontWeight={400}
          height={35}
          isFocused
          label={t('Choose a name for the profile')}
          labelFontSize='14px'
          onChange={editName}
          // eslint-disable-next-line react/jsx-no-bind
          onEnter={() => newName && addToNewProfile(newName)}
          placeholder={t('Profile Name')}
          value={newName}
        />
      </Grid>
      <Grid container height='fit-content' item ml='10px' width='fit-content'>
        <IconButton
          disabled={!newName}
          // eslint-disable-next-line react/jsx-no-bind
          onClick={() => addToNewProfile(newName)}
          sx={{ p: 0 }}
        >
          <DoneIcon sx={{ color: 'secondary.light', fontSize: '32px', stroke: theme.palette.secondary.light, strokeWidth: 1.5 }} />
        </IconButton>
      </Grid>
    </Grid>
  );
};

interface AddProfileProps {
  address: string | undefined
  showName: boolean | undefined;
  setShowName: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  handleClose: () => void
}

const AddMenu = ({ address, handleClose, setShowName, showName }: AddProfileProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { userDefinedProfiles } = useProfiles();
  const { account } = useInfo(address);

  const [newName, setNewName] = useState<string | undefined>();

  const editName = useCallback((newName: string | null) => {
    setNewName(newName ?? '');
  }, []);

  const onNewProfile = useCallback(() => {
    setShowName(true);
  }, [setShowName]);

  const addToNewProfile = useCallback((profile?: string) => {
    if (!profile || !account) {
      return;
    }

    let profiles = profile;

    if (account.profile) {
      const profileArray = account.profile.split(',');

      profileArray.push(profile);
      const dedupeProfiles = new Set(profileArray);

      profiles = [...dedupeProfiles].join(',');
    }

    const metaData = JSON.stringify({ profile: profiles });

    updateMeta(String(address), metaData)
      .then(() => {
        handleClose();
      }).catch(console.error);
  }, [account, address, handleClose]);

  return (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '10px' }}>
      {showName
        ? <InputBox
          addToNewProfile={addToNewProfile}
          editName={editName}
          newName={newName}
        />
        : <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:plus' style={{ color: theme.palette.text.primary, height: '20px' }} />
          }
          onClick={onNewProfile}
          text={t('New profile')}
          withHoverEffect
        />
      }
      <Divider sx={{ bgcolor: 'divider', height: '1px', my: '6px' }} />
      {userDefinedProfiles.length > 0
        ? userDefinedProfiles.map((profile) => (
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:folder-open-o' style={{ color: theme.palette.text.primary, height: '20px' }} />
            }
            key={profile}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={() => addToNewProfile(profile)}
            text={profile}
            withHoverEffect
          />
        ))
        : <MenuItem
          disabled
          iconComponent={
            <VaadinIcon icon='vaadin:minus' style={{ color: `${theme.palette.text.disabled}`, height: '20px' }} />
          }
          text={t('No user profile')}
          withHoverEffect
        />
      }
    </Grid>
  );
};

interface RemoveProfileProps {
  profileNames: string[] | undefined;
  onRemove: (profile: string) => void;
}

const RemoveMenu = ({ onRemove, profileNames }: RemoveProfileProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '10px' }}>
      {profileNames?.map((profileName) => (
        // eslint-disable-next-line react/jsx-no-bind
        <Grid component='button' container item key={profileName} onClick={() => onRemove(profileName)} sx={{ '> div div:last-child p': { maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, bgcolor: 'transparent', border: 'none', color: theme.palette.text.primary, height: 'fit-content', p: 0, width: 'inherit' }}>
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:folder-remove' style={{ color: theme.palette.text.primary, height: '20px' }} />
            }
            text={t('Remove from {{profileName}}', { replace: { profileName } })}
            withHoverEffect
          />
        </Grid>
      ))}
    </Grid>
  );
};

enum STATUS {
  SHOW_ADD,
  SHOW_REMOVE
}

function ProfileMenu ({ address, closeParentMenu }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();

  const isExtensionMode = useIsExtensionPopup();
  const { account } = useInfo(address);
  const initialAccountList = useAccountsOrder(true);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | HTMLDivElement | null>();
  const [status, setStatus] = useState<STATUS>();
  const [showName, setShowName] = useState<boolean>();
  const [currentProfile, setCurrentProfile] = useState<string>();

  const profileNames = account?.profile ? account.profile.split(',') : undefined;

  useEffect(() => {
    getStorage('profile').then((res) => {
      setCurrentProfile(res as string);
    }).catch(console.error);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setShowName(false);
    closeParentMenu();
  }, [closeParentMenu]);

  const onAddClick = useCallback((event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setStatus(STATUS.SHOW_ADD);
  }, []);

  const onRemoveMenuClick = useCallback((event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setStatus(STATUS.SHOW_REMOVE);
  }, []);

  const onRemove = useCallback((profileToBeRemoved: string) => {
    const maybeAccountProfile = account?.profile; // could be a list of joined profile tags as a string

    if (!maybeAccountProfile || !initialAccountList) {
      return;
    }

    const accountsWithTheSameProfileTag = initialAccountList.filter(({ account: acc }) => acc?.profile && acc.profile.split(',').includes(profileToBeRemoved));

    const accountProfiles = maybeAccountProfile.split(',');
    const indexToBeRemoved = accountProfiles.findIndex((item) => item === profileToBeRemoved);

    accountProfiles.splice(indexToBeRemoved, 1);

    const metaData = JSON.stringify({ profile: accountProfiles?.length ? accountProfiles.join(',') : null });

    updateMeta(String(address), metaData)
      .then(() => {
        if (accountsWithTheSameProfileTag.length === 1 && currentProfile === profileToBeRemoved) {
          // set profile tab to ALL, since this account was the last account with such a tag and the current profile is the same as account's profile
          setStorage('profile', PROFILE_TAGS.ALL).then(handleClose).catch(console.error);
        } else {
          handleClose();
        }
      }).catch(console.error);
  }, [account?.profile, address, handleClose, initialAccountList, currentProfile]);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover 2' : undefined;

  return (
    <>
      <Grid aria-describedby={id} component='button' container item onClick={onAddClick} sx={{ bgcolor: 'transparent', border: 'none', color: theme.palette.text.primary, height: 'fit-content', p: 0, width: 'inherit' }}>
        <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:folder-add' style={{ color: `${theme.palette.text.primary}`, height: '20px' }} />
          }
          showChevron
          text={t('Add to profile')}
          withHoverEffect
        />
      </Grid>
      {!!profileNames?.length && !isExtensionMode &&
        <>
          {profileNames.map((profileName) => (
            // eslint-disable-next-line react/jsx-no-bind
            <Grid component='button' container item key={profileName} onClick={() => onRemove(profileName)} sx={{ '> div div:last-child p': { maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, bgcolor: 'transparent', border: 'none', color: theme.palette.text.primary, height: 'fit-content', p: 0, width: 'inherit' }}>
              <MenuItem
                iconComponent={
                  <VaadinIcon icon='vaadin:folder-remove' style={{ color: `${theme.palette.text.primary}`, height: '20px' }} />
                }
                text={t('Remove from {{profileName}}', { replace: { profileName } })}
                withHoverEffect
              />
            </Grid>
          ))}
          <Divider sx={{ bgcolor: 'divider', height: '1px', my: '6px', width: '100%' }} />
        </>
      }
      {isExtensionMode && profileNames && profileNames.length > 0 &&
        <Grid aria-describedby={id} component='button' container item onClick={onRemoveMenuClick} sx={{ bgcolor: 'transparent', border: 'none', color: theme.palette.text.primary, height: 'fit-content', p: 0, width: 'inherit' }}>
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:folder-remove' style={{ color: theme.palette.text.primary, height: '20px' }} />
            }
            showChevron
            text={t('Remove from profile')}
            withHoverEffect
          />
        </Grid>
      }
      {isExtensionMode && <Divider sx={{ bgcolor: 'divider', height: '1px', my: '6px', width: '100%' }} />}
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
        {status === STATUS.SHOW_ADD &&
          <AddMenu
            address={address}
            handleClose={handleClose}
            setShowName={setShowName}
            showName={showName}
          />}
        {status === STATUS.SHOW_REMOVE &&
          <RemoveMenu
            onRemove={onRemove}
            profileNames={profileNames}
          />
        }
      </Popover>
    </>
  );
}

export default React.memo(ProfileMenu);
