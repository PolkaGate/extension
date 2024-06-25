// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Autocomplete, Grid, type SxProps, TextField, type Theme, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Label from './Label';
import { useProfiles } from '../hooks';

interface Props {
  disabled?: boolean;
  helperText?: string;
  label: string;
  placeHolder?: string;
  profileName: string | undefined;
  setProfileName: React.Dispatch<React.SetStateAction<string | undefined>>;
  style?: SxProps<Theme>;
}

export default function ProfileInput({ disabled = false, placeHolder = '', setProfileName, profileName, helperText = '', label, style }: Props): React.ReactElement<Props> {
  const containerRef = useRef<HTMLDivElement>(null);

  const profiles = useProfiles();

  const [isPopperOpen, setTogglePopper] = useState<boolean>(false);
  const [focus, setFocus] = useState<boolean>(false);
  const [enteredProfile, setEnteredProfile] = useState<string | undefined>();
  const [dropdownWidth, setDropdownWidth] = useState<string>('0');

  const autocompleteOptions = useMemo(() => profiles?.userDefinedProfiles?.map((profile, index) => ({ index, profile })), [profiles?.userDefinedProfiles]);

  useEffect(() => {
    profileName && setEnteredProfile(profileName);
  }, [profileName]);

  useEffect(() => {
    if (containerRef) {
      setDropdownWidth(`${(containerRef.current?.offsetWidth || 0)}px`);
    }
  }, [containerRef?.current?.offsetWidth]);

  const handleProfile = useCallback((value?: string): void => {
    setTogglePopper(false);

    if (!value) {
      setProfileName(undefined);
      setEnteredProfile(undefined);

      return;
    }

    setEnteredProfile(value);
    setProfileName(value)
  }, [setProfileName]);

  const openPopper = useCallback(() =>
    profiles?.userDefinedProfiles && profiles.userDefinedProfiles?.length > 0 && !enteredProfile && !isPopperOpen && setTogglePopper(true)
    , [profiles?.userDefinedProfiles?.length, enteredProfile, isPopperOpen]);

  const closePopper = useCallback(() =>
    setTogglePopper(false),
    []);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' ref={containerRef} sx={{ position: 'relative', ...style }}>
      <Label
        helperText={helperText}
        label={label}
        style={{ position: 'relative', width: '100%' }}
      >
        <Autocomplete
          componentsProps={{ paper: { sx: { '> ul': { m: 0, p: 0 }, border: '2px solid', borderColor: 'secondary.light', maxHeight: window.innerHeight / 2, ml: '-1px', my: '5px', p: 0, width: dropdownWidth } } }}
          disableClearable
          disabled={disabled || !autocompleteOptions}
          freeSolo
          getOptionLabel={(option) => option?.toString() as any}
          inputValue={enteredProfile ?? ''}
          onBlur={() => setFocus(false)}
          onClose={closePopper}
          onFocus={() => setFocus(true)}
          onOpen={openPopper}
          open={isPopperOpen && !enteredProfile}
          options={autocompleteOptions as any}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
              }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleProfile(event.target.value)}
              placeholder={placeHolder}
              sx={{ '> div.MuiOutlinedInput-root': { '> fieldset': { border: 'none' }, '> input.MuiAutocomplete-input': { border: 'none', lineHeight: '31px', p: 0 }, border: 'none', height: '31px', p: 0, px: '5px' }, bgcolor: 'background.paper', border: `${focus ? '2px' : '1px'} solid`, borderColor: `${focus ? 'action.focus' : 'secondary.light'}`, borderRadius: '5px', height: '32px', lineHeight: '31px' }}
            />
          )}
          // @ts-ignore
          renderOption={(_props, { index, profile }) => {
            return (
              <Grid alignItems='center' container item justifyContent='space-between' key={index} onClick={() => handleProfile(profile)} sx={{ '&:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'secondary.light', mb: '5px' }, cursor: 'pointer', p: '5px' }}>
                <Typography fontSize='12px' fontWeight={400} lineHeight='25px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {profile}
                </Typography>
              </Grid>);
          }}
          sx={{ border: 'none', height: '31px', p: 0 }}
        />
      </Label>
    </Grid>
  );
}
