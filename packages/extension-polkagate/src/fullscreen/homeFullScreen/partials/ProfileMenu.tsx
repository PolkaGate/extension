// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Popover, useTheme, IconButton, type Theme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import { type TFunction } from '@polkagate/apps-config/types';
import DoneIcon from '@mui/icons-material/Done';
import { ActionContext, InputWithLabel, MenuItem, VaadinIcon } from '../../../components';
import { useInfo, useTranslation, useProfiles, useIsExtensionPopup } from '../../../hooks';
import { updateMeta } from '../../../messaging';

interface Props {
  address: string | undefined;
  setUpperAnchorEl?: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
}

interface InputBoxProps {
  editName: (newName: string | null) => void;
  newName: string | undefined;
  addToNewProfile: (profile?: string) => void;
  t: TFunction;
  theme: Theme;
}

const InputBox = ({ addToNewProfile, editName, newName, t, theme }: InputBoxProps) => {
  return (
    <Grid container item alignItems='flex-end' justifyContent='space-evenly'>
      <Grid container item xs>
        <InputWithLabel
          isFocused
          fontSize={16}
          fontWeight={400}
          height={35}
          label={t('Choose a name for the profile')}
          labelFontSize='14px'
          onChange={editName}
          onEnter={() => newName && addToNewProfile(newName as string)}
          placeholder={t('Profile Name')}
          value={newName}
        />
      </Grid>
      <Grid container item height='fit-content' ml='10px' width='fit-content'>
        <IconButton
          disabled={!newName}
          onClick={() => addToNewProfile(newName as string)}
          sx={{ p: 0 }}
        >
          <DoneIcon sx={{ color: 'secondary.light', fontSize: '32px', stroke: theme.palette.secondary.light, strokeWidth: 1.5 }} />
        </IconButton>
      </Grid>
    </Grid>
  );
}

enum STATUS {
  SHOW_ADD,
  SHOW_REMOVE
};

function ProfileMenu({ address, setUpperAnchorEl }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const isExtensionMode = useIsExtensionPopup();

  const onAction = useContext(ActionContext);
  const { account, chain } = useInfo(address);
  const { userDefinedProfiles } = useProfiles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | HTMLDivElement | null>();
  const [status, setStatus] = useState<STATUS>();
  const [showName, setShowName] = useState<boolean>();
  const [newName, setNewName] = useState<string | undefined>();

  const profileNames = account?.profile ? account.profile.split(',') : undefined;

  const editName = useCallback((newName: string | null) => {
    setNewName(newName ?? '');
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setShowName(false);
    setUpperAnchorEl && setUpperAnchorEl(null);
  }, []);

  const onAddClick = useCallback((event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setStatus(STATUS.SHOW_ADD);
  }, []);

  const onRemoveClick = useCallback((event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setStatus(STATUS.SHOW_REMOVE);
  }, []);

  const onNewProfile = useCallback(() => {
    setShowName(true);
  }, [address, chain, onAction]);

  const addToNewProfile = useCallback((profile?: string) => {
    if (!profile || !account) {
      return;
    }

    let profiles = profile;

    if (account.profile) {
      const profileArray = account.profile.split(',')
      profileArray.push(profile);
      const dedupeProfiles = new Set(profileArray);
      profiles = [...dedupeProfiles].join(',')
    }

    const metaData = JSON.stringify({ profile: profiles });

    updateMeta(String(address), metaData)
      .then(() => {
        handleClose();
      }).catch(console.error);
  }, [address, account]);

  const onRemove = useCallback((profile: string) => {
    if (!account?.profile) {
      return;
    }

    const profiles = account.profile.split(',');
    const profileIndex = profiles.findIndex((item) => item === profile);
    profiles.splice(profileIndex, 1);

    const metaData = JSON.stringify({ profile: profiles?.length ? profiles.join(',') : null });

    updateMeta(String(address), metaData)
      .then(() => {
        handleClose();
      }).catch(console.error);
  }, [address, account]);

  const AddMenu = () => (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '10px' }}>
      {showName
        ? <InputBox
          addToNewProfile={addToNewProfile}
          editName={editName}
          newName={newName}
          t={t}
          theme={theme}
        />
        : <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:plus' style={{ height: '20px', color: theme.palette.text.primary }} />
          }
          onClick={onNewProfile}
          text={t('New profile')}
          withHoverEffect
        />
      }
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
      {userDefinedProfiles.length > 0
        ? userDefinedProfiles.map((profile) => (
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:folder-open-o' style={{ height: '20px', color: theme.palette.text.primary }} />
            }
            key={profile}
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

  const RemoveMenu = () => (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', minWidth: '300px', p: '10px' }}>
      {profileNames && profileNames.map((profileName) => (
        <Grid component='button' container item onClick={() => onRemove(profileName)} sx={{ '> div div:last-child p': { maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, bgcolor: 'transparent', border: 'none', color: theme.palette.text.primary, height: 'fit-content', p: 0, width: 'inherit' }}>
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:folder-remove' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
            }
            text={t('Remove from {{profileName}}', { replace: { profileName } })}
            withHoverEffect
          />
        </Grid>
      ))}
    </Grid>
  );

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover 2' : undefined;

  return (
    <>
      <Grid aria-describedby={id} component='button' container item onClick={onAddClick} sx={{ bgcolor: 'transparent', border: 'none', color: theme.palette.text.primary, height: 'fit-content', p: 0, width: 'inherit' }}>
        <MenuItem
          iconComponent={
            <VaadinIcon icon='vaadin:folder-add' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
          }
          text={t('Add to profile')}
          withHoverEffect
          showChevron
        />
      </Grid>
      {!!profileNames?.length && !isExtensionMode &&
        <>
          {profileNames.map((profileName) => (
            <Grid component='button' container item onClick={() => onRemove(profileName)} sx={{ '> div div:last-child p': { maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, bgcolor: 'transparent', border: 'none', color: theme.palette.text.primary, height: 'fit-content', p: 0, width: 'inherit' }}>
              <MenuItem
                iconComponent={
                  <VaadinIcon icon='vaadin:folder-remove' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
                }
                text={t('Remove from {{profileName}}', { replace: { profileName } })}
                withHoverEffect
              />
            </Grid>
          ))}
          <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px', width: '100%' }} />
        </>
      }
      {isExtensionMode && profileNames && profileNames.length > 0 &&
        <Grid aria-describedby={id} component='button' container item onClick={onRemoveClick} sx={{ bgcolor: 'transparent', border: 'none', color: theme.palette.text.primary, height: 'fit-content', p: 0, width: 'inherit' }}>
          <MenuItem
            iconComponent={
              <VaadinIcon icon='vaadin:folder-remove' style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
            }
            text={t('Remove from profile')}
            withHoverEffect
            showChevron
          />
        </Grid>
      }
      {isExtensionMode && <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px', width: '100%' }} />}
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
        {status === STATUS.SHOW_ADD && <AddMenu />}
        {status === STATUS.SHOW_REMOVE && <RemoveMenu />}
      </Popover>
    </>
  );
}

export default React.memo(ProfileMenu);
